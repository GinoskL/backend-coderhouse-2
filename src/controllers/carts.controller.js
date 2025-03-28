import CartManager from "../models/CartManager.js"

const cartManager = new CartManager()

export const createCart = async (req, res) => {
  try {
    const newCart = await cartManager.createCart()
    return res.status(201).json({ status: "success", payload: newCart })
  } catch (error) {
    return res.status(500).json({ status: "error", error: error.message })
  }
}

export const getCartById = async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid)
    return res.json({ status: "success", payload: cart })
  } catch (error) {
    return res.status(404).json({ status: "error", error: error.message })
  }
}

export const addProductToCart = async (req, res) => {
  try {
    const { quantity = 1 } = req.body

    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        error: "La cantidad debe ser un número mayor a 0",
      })
    }

    const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid, Number.parseInt(quantity))

    return res.json({ status: "success", payload: updatedCart })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const removeProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params

    if (!cid || !pid) {
      return res.status(400).json({
        status: "error",
        error: "Faltan parámetros cid o pid",
      })
    }

    const updatedCart = await cartManager.removeProductFromCart(cid, pid)
    return res.json({ status: "success", payload: updatedCart })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const updateCart = async (req, res) => {
  try {
    const { products } = req.body

    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: "error",
        error: "El campo products debe ser un array",
      })
    }

    const updatedCart = await cartManager.updateCart(req.params.cid, products)
    return res.json({ status: "success", payload: updatedCart })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const updateProductQuantity = async (req, res) => {
  try {
    const { quantity } = req.body

    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        error: "La cantidad debe ser un número mayor a 0",
      })
    }

    const updatedCart = await cartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      Number.parseInt(quantity),
    )

    return res.json({ status: "success", payload: updatedCart })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const clearCart = async (req, res) => {
  try {
    const updatedCart = await cartManager.clearCart(req.params.cid)
    return res.json({ status: "success", payload: updatedCart })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

