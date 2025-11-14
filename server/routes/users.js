import express from 'express';
import { getSavedCart, saveCart, getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/users.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token and get user
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get saved cart (requires auth)
router.get('/:id/cart', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const cart = getSavedCart(req.params.id);
    res.json({ cart: cart || null });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Save cart (requires auth)
router.post('/:id/cart', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { cartItems } = req.body;
    const savedCart = saveCart(req.params.id, cartItems || []);
    res.json({ cart: savedCart });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: error.message || 'Failed to save cart' });
  }
});

// Get wishlist (requires auth)
router.get('/:id/wishlist', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const wishlist = getWishlist(req.params.id);
    res.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist (requires auth)
router.post('/:id/wishlist', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    console.log('Adding to wishlist:', { userId: req.params.id, productId });
    const wishlist = addToWishlist(req.params.id, productId);
    console.log('Wishlist after add:', wishlist);
    console.log('Response type:', typeof wishlist, 'Is array:', Array.isArray(wishlist));
    res.json({ wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: error.message || 'Failed to add to wishlist' });
  }
});

// Remove from wishlist (requires auth)
router.delete('/:id/wishlist/:productId', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const wishlist = removeFromWishlist(req.params.id, req.params.productId);
    res.json({ wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: error.message || 'Failed to remove from wishlist' });
  }
});

// Check if product is in wishlist (requires auth)
router.get('/:id/wishlist/:productId', verifyToken, (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const inWishlist = isInWishlist(req.params.id, req.params.productId);
    res.json({ inWishlist });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
});

export default router;

