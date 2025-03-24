import Product from './Product.js';

class ProductManager {
    async addProduct({ title, description, code, price, stock, category, thumbnails = [] }) {
        try {
            if (!title || !description || !code || !price || !stock || !category) {
                throw new Error("❌ Error: Faltan campos obligatorios.");
            }

            const exists = await Product.findOne({ code });
            if (exists) {
                throw new Error("❌ Error: El código del producto ya existe.");
            }

            const newProduct = await Product.create({ title, description, code, price, stock, category, thumbnails });
            return newProduct;
        } catch (error) {
            console.error("❌ Error al agregar producto:", error.message);
            throw error;
        }
    }

    async getProducts(query = {}, options = {}) {
        try {
            const { sort = null, limit = 10, page = 1 } = options;

            const products = await Product.find(query)
                .sort(sort ? { price: sort === "asc" ? 1 : -1 } : {})
                .limit(limit)
                .skip((page - 1) * limit);

            if (!products || products.length === 0) {
                throw new Error("❌ No hay productos en la base de datos.");
            }

            return products;
        } catch (error) {
            console.error("❌ Error al obtener productos:", error.message);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id);
            if (!product) throw new Error("❌ Producto no encontrado");
            return product;
        } catch (error) {
            console.error("❌ Error al obtener producto por ID:", error.message);
            throw error;
        }
    }

    async updateProduct(id, updates) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
            if (!updatedProduct) throw new Error("❌ Producto no encontrado");
            return updatedProduct;
        } catch (error) {
            console.error("❌ Error al actualizar producto:", error.message);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) throw new Error("❌ Producto no encontrado");
            return deletedProduct;
        } catch (error) {
            console.error("❌ Error al eliminar producto:", error.message);
            throw error;
        }
    }
}

// ✅ Exportamos la CLASE en lugar de una instancia
export default ProductManager;
