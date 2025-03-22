import express from 'express';
import productManager from '../models/ProductManager.js';

const router = express.Router();

// GET /api/products (Con paginación, filtros y ordenamiento)
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {} // Orden por precio asc/desc
        };

        const filter = query ? { category: query } : {}; // Filtra por categoría si se envía query

        const products = await productManager.getProducts(filter, options);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: "Producto no encontrado" });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.pid);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
