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

// ✅ Configurar Handlebars con opciones de acceso seguro
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
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
    const products = await productManager.getProducts()
    res.render("home", { title: "Lista de Productos", products })
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

