import express from 'express';
import { getSavedCart, saveCart } from '../utils/users.js';
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

export default router;

