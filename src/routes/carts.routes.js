import express from 'express';
import cartManager from '../models/CartManager.js';

const router = express.Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un carrito por ID (con populate)
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Agregar un producto a un carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params; // ✅ Extraer bien los IDs

        if (!cid || !pid) {
            return res.status(400).json({ error: "Faltan parámetros cid o pid" });
        }

        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Actualizar todo el carrito
router.put('/:cid', async (req, res) => {
    try {
        const updatedCart = await cartManager.updateCart(req.params.cid, req.body.products);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedCart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Vaciar un carrito
router.delete('/:cid', async (req, res) => {
    try {
        const updatedCart = await cartManager.clearCart(req.params.cid);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
