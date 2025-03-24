import Cart from './Cart.js';

class CartManager {
    async createCart() {
        try {
            const newCart = await Cart.create({ products: [] });
            return newCart;
        } catch (error) {
            console.error("❌ Error al crear carrito:", error.message);
            throw error;
        }
    }

    async getAllCarts() {
        try {
            const carts = await Cart.find();
            return carts;
        } catch (error) {
            console.error("❌ Error al obtener todos los carritos:", error.message);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) throw new Error("❌ Carrito no encontrado");
            return cart;
        } catch (error) {
            console.error("❌ Error al obtener carrito:", error.message);
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error("❌ Carrito no encontrado");

            const existingProduct = cart.products.find(p => p.product.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.error("❌ Error al agregar producto al carrito:", error.message);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            if (!cartId || !productId) {
                throw new Error("❌ Error: Se requieren cartId y productId.");
            }
    
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error("❌ Carrito no encontrado");
    
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex === -1) throw new Error("❌ Producto no encontrado en el carrito");
    
            cart.products.splice(productIndex, 1);
            await cart.save();
    
            return cart;
        } catch (error) {
            console.error("❌ Error al eliminar producto del carrito:", error.message);
            throw error;
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await Cart.findByIdAndUpdate(cartId, { products }, { new: true });
            if (!cart) throw new Error("❌ Carrito no encontrado");
            return cart;
        } catch (error) {
            console.error("❌ Error al actualizar carrito:", error.message);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error("❌ Carrito no encontrado");

            const productToUpdate = cart.products.find(p => p.product.toString() === productId);
            if (!productToUpdate) throw new Error("❌ Producto no encontrado en el carrito");

            productToUpdate.quantity = quantity;
            await cart.save();
            return cart;
        } catch (error) {
            console.error("❌ Error al actualizar cantidad del producto en carrito:", error.message);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error("❌ Carrito no encontrado");

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            console.error("❌ Error al vaciar carrito:", error.message);
            throw error;
        }
    }
}

// ✅ Exportamos la CLASE en lugar de una instancia
export default CartManager;
