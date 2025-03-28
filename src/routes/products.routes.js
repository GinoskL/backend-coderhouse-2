import express from "express"
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js"

const router = express.Router()

// GET /api/products (Con paginación, filtros y ordenamiento)
router.get("/", getAllProducts)

// GET /api/products/:pid
router.get("/:pid", getProductById)

// POST /api/products
router.post("/", createProduct)

// PUT /api/products/:pid
router.put("/:pid", updateProduct)

// DELETE /api/products/:pid
router.delete("/:pid", deleteProduct)

export default router

