import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { engine } from "express-handlebars"
import path from "path"
import { fileURLToPath } from "url"

import productsRouter from "./routes/products.routes.js"
import cartsRouter from "./routes/carts.routes.js"
import ProductManager from "./models/ProductManager.js"
import CartManager from "./models/CartManager.js"
import connectDB from "./config/db.js"

// ✅ Conectar a MongoDB
connectDB()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const productManager = new ProductManager() // ✅ Instanciamos ProductManager
const cartManager = new CartManager() // ✅ Instanciamos CartManager

const app = express()
const server = createServer(app)
const io = new Server(server)

// ✅ Configurar Handlebars con opciones de acceso seguro y helpers
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => a * b,
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
    },
  }),
)
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

// ✅ Middleware
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Rutas de la API
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)

// ✅ Obtener el cartId de un carrito existente
const getCartId = async () => {
  try {
    const carts = await cartManager.getAllCarts()
    if (carts.length > 0) {
      return carts[0]._id.toString()
    } else {
      const newCart = await cartManager.createCart()
      return newCart._id.toString()
    }
  } catch (error) {
    console.error("Error getting cart ID:", error)
    return null
  }
}

// ✅ Ruta para renderizar la vista home con productos
app.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts({}, { limit: 5 })
    const cartId = await getCartId()

    // Get all unique categories for the category section
    const allProducts = await productManager.getProducts()
    const categories = [...new Set(allProducts.map((product) => product.category))]

    res.render("home", {
      title: "Bienvenido a nuestra tienda",
      products,
      categories,
      cartId,
    })
  } catch (error) {
    console.error("❌ Error en la ruta '/':", error.message)
    res.status(500).send(`❌ Error al cargar los productos: ${error.message}`)
  }
})

// ✅ Ruta para la vista en tiempo real con productos
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts()
    const cartId = await getCartId()

    console.log("📥 Enviando productos a la vista en tiempo real:", products)

    // Pass cartId to the template
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real",
      products,
      cartId,
    })
  } catch (error) {
    console.error("❌ Error en la ruta '/realtimeproducts':", error.message)
    res.status(500).send(`❌ Error al cargar los productos: ${error.message}`)
  }
})

// ✅ Nueva ruta para la vista de productos con paginación y filtros
app.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category } = req.query

    const options = {
      limit: Number.parseInt(limit),
      page: Number.parseInt(page),
      sort: sort,
    }

    // Build filter object based on query parameters
    const filter = {}
    if (category) {
      filter.category = category
    }

    const products = await productManager.getProducts(filter, options)
    const totalProducts = await productManager.countProducts(filter)
    const totalPages = Math.ceil(totalProducts / options.limit)
    const hasPrevPage = options.page > 1
    const hasNextPage = options.page < totalPages

    // Get all unique categories for the filter dropdown
    const allProducts = await productManager.getProducts()
    const categories = [...new Set(allProducts.map((product) => product.category))]

    // Get cart ID for add to cart functionality
    const cartId = await getCartId()

    res.render("products", {
      title: "Catálogo de Productos",
      products,
      page: options.page,
      limit: options.limit,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? options.page - 1 : null,
      nextPage: hasNextPage ? options.page + 1 : null,
      categories,
      selectedCategory: category,
      sort,
      cartId,
    })
  } catch (error) {
    console.error("❌ Error en la ruta '/products':", error.message)
    res.status(500).send(`❌ Error al cargar los productos: ${error.message}`)
  }
})

// ✅ Nueva ruta para ver el contenido de un carrito
app.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid)

    res.render("cart", {
      title: "Carrito de Compras",
      cart,
    })
  } catch (error) {
    console.error("❌ Error en la ruta '/carts/:cid':", error.message)
    res.status(500).send(`❌ Error al cargar el carrito: ${error.message}`)
  }
})

// ✅ Configuración de WebSockets
io.on("connection", async (socket) => {
  console.log("⚡ Cliente conectado")

  try {
    // ✅ Enviar productos actuales al cliente cuando se conecta
    const products = await productManager.getProducts()
    console.log("Enviando productos iniciales al cliente:", products.length)
    socket.emit("updateProducts", products)
  } catch (error) {
    console.error("Error sending initial products:", error)
  }

  // ✅ Agregar un nuevo producto
  socket.on("newProduct", async (productData) => {
    try {
      console.log("📥 Producto recibido en WebSocket:", productData)

      const newProduct = await productManager.addProduct(productData)
      if (!newProduct) {
        console.log("❌ Error al agregar producto.")
        return
      }

      console.log("✅ Producto agregado a MongoDB:", newProduct)

      const updatedProducts = await productManager.getProducts()
      io.emit("updateProducts", updatedProducts)
    } catch (error) {
      console.error("❌ Error en WebSockets:", error.message)
    }
  })

  // ✅ Recibir solicitud para eliminar un producto
  socket.on("deleteProduct", async (productId) => {
    try {
      if (!productId) {
        console.log("❌ Error: Falta productId.")
        return
      }

      console.log(`🗑 Eliminando producto ${productId}`)

      // Eliminar el producto de la base de datos
      await productManager.deleteProduct(productId)

      // Obtener la lista actualizada de productos
      const updatedProducts = await productManager.getProducts()

      // Emitir la lista actualizada a todos los clientes
      io.emit("updateProducts", updatedProducts)

      console.log("✅ Producto eliminado correctamente")
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error.message)
    }
  })

  // ✅ Recibir solicitud para actualizar un producto
  socket.on("updateProduct", async (productData) => {
    try {
      if (!productData || !productData._id) {
        console.log("❌ Error: Faltan datos del producto.")
        return
      }

      console.log(`✏️ Actualizando producto ${productData._id}`)

      // Actualizar el producto en la base de datos
      const updatedProduct = await productManager.updateProduct(productData._id, productData)

      if (!updatedProduct) {
        console.log("❌ Error al actualizar producto.")
        return
      }

      console.log("✅ Producto actualizado en MongoDB:", updatedProduct)

      // Obtener la lista actualizada de productos
      const updatedProducts = await productManager.getProducts()

      // Emitir la lista actualizada a todos los clientes
      io.emit("updateProducts", updatedProducts)
    } catch (error) {
      console.error("❌ Error al actualizar producto:", error.message)
    }
  })

  socket.on("disconnect", () => {
    console.log("⚡ Cliente desconectado")
  })
})

// ✅ Levantar el servidor
const PORT = 8080
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
})

export { io }

