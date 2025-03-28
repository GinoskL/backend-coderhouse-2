import express from "express"
import ProductManager from "../models/ProductManager.js"

const router = express.Router()
const productManager = new ProductManager() // Create an instance of ProductManager

// GET /api/products (Con paginación, filtros y ordenamiento)
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query

    const options = {
      limit: Number.parseInt(limit),
      page: Number.parseInt(page),
      sort: sort, // Pass the sort parameter directly
    }

    // Build filter object based on query parameters
    const filter = {}
    if (query) {
      filter.category = query
    }

    const products = await productManager.getProducts(filter, options)

    // Format response with pagination info
    const totalProducts = await productManager.countProducts(filter)
    const totalPages = Math.ceil(totalProducts / options.limit)
    const hasPrevPage = page > 1
    const hasNextPage = page < totalPages

    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? Number.parseInt(page) - 1 : null,
      nextPage: hasNextPage ? Number.parseInt(page) + 1 : null,
      page: Number.parseInt(page),
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage
        ? `/api/products?limit=${limit}&page=${Number.parseInt(page) - 1}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null,
      nextLink: hasNextPage
        ? `/api/products?limit=${limit}&page=${Number.parseInt(page) + 1}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null,
    })
  } catch (error) {
    console.error("Error getting products:", error)
    res.status(500).json({ status: "error", error: error.message })
  }
})

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid)
    res.json({ status: "success", payload: product })
  } catch (error) {
    res.status(404).json({ status: "error", error: "Producto no encontrado" })
  }
})

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body)
    res.status(201).json({ status: "success", payload: newProduct })
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message })
  }
})

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body)
    res.json({ status: "success", payload: updatedProduct })
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message })
  }
})

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message })
  }
})

export default router

