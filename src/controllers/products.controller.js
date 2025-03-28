import ProductManager from "../models/ProductManager.js"

const productManager = new ProductManager()

export const getAllProducts = async (req, res) => {
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

    return res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? options.page - 1 : null,
      nextPage: hasNextPage ? options.page + 1 : null,
      page: options.page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage
        ? `/api/products?limit=${limit}&page=${options.page - 1}${sort ? `&sort=${sort}` : ""}${category ? `&category=${category}` : ""}`
        : null,
      nextLink: hasNextPage
        ? `/api/products?limit=${limit}&page=${options.page + 1}${sort ? `&sort=${sort}` : ""}${category ? `&category=${category}` : ""}`
        : null,
    })
  } catch (error) {
    console.error("Error getting products:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid)
    return res.json({ status: "success", payload: product })
  } catch (error) {
    return res.status(404).json({ status: "error", error: error.message })
  }
}

export const createProduct = async (req, res) => {
  try {
    // Validate required fields
    const { title, description, code, price, stock, category } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({
        status: "error",
        error: "Faltan campos obligatorios. Se requiere title, description, code, price, stock y category",
      })
    }

    const newProduct = await productManager.addProduct(req.body)
    return res.status(201).json({ status: "success", payload: newProduct })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body)
    return res.json({ status: "success", payload: updatedProduct })
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid)
    return res.status(204).send()
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message })
  }
}

