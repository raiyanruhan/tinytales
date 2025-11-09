import express from 'express';
import { getAllProducts, getProductById, saveProduct, deleteProduct, reorderProducts } from '../utils/products.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all products (public)
router.get('/', (req, res) => {
  try {
    const products = getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
router.get('/:id', (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', adminAuth, (req, res) => {
  try {
    const {
      name,
      price,
      category,
      description,
      colors,
      sizes,
      stock,
      order,
      badges,
      image
    } = req.body;

    // Validation
    if (!name || !price || !category || !description) {
      return res.status(400).json({ error: 'Name, price, category, and description are required' });
    }

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ error: 'At least one color is required' });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ error: 'At least one size is required' });
    }

    // Generate ID
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const productData = {
      id,
      name,
      price: parseFloat(price),
      category,
      description,
      colors: colors.map(c => ({
        name: c.name,
        images: c.images || []
      })),
      sizes,
      stock: stock || {},
      order: order ? parseInt(order) : undefined,
      badges: badges || [],
      image: image || (colors[0]?.images?.[0] || '')
    };

    const product = saveProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name,
      price,
      category,
      description,
      colors,
      sizes,
      stock,
      order,
      badges,
      image
    } = req.body;

    const updateData = {
      id: req.params.id,
      ...product,
      ...(name && { name }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(description && { description }),
      ...(colors && { colors: colors.map(c => ({
        name: c.name,
        images: c.images || []
      })) }),
      ...(sizes && { sizes }),
      ...(stock !== undefined && { stock }),
      ...(order !== undefined && { order: parseInt(order) }),
      ...(badges !== undefined && { badges }),
      ...(image && { image })
    };

    const updatedProduct = saveProduct(updateData);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = deleteProduct(req.params.id);
    if (deleted) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Reorder products (admin only)
router.post('/reorder', adminAuth, (req, res) => {
  try {
    const { products: productsWithOrder } = req.body;

    if (!Array.isArray(productsWithOrder)) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const reordered = reorderProducts(productsWithOrder);
    res.json({ message: 'Products reordered successfully', products: reordered });
  } catch (error) {
    console.error('Error reordering products:', error);
    res.status(500).json({ error: 'Failed to reorder products' });
  }
});

export default router;


