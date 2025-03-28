import express from "express"
import {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCart,
  updateProductQuantity,
  clearCart,
} from "../controllers/carts.controller.js"

const router = express.Router()

// Crear un nuevo carrito
router.post("/", createCart)

// Obtener un carrito por ID (con populate)
router.get("/:cid", getCartById)

// Agregar un producto a un carrito
router.post("/:cid/products/:pid", addProductToCart)

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", removeProductFromCart)

// Actualizar todo el carrito
router.put("/:cid", updateCart)

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", updateProductQuantity)

// Vaciar un carrito
router.delete("/:cid", clearCart)

export default router

