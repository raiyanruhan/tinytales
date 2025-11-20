import express from 'express';
import { 
  saveOrder, 
  getAllOrders, 
  getOrderById, 
  getOrdersByEmail,
  updateOrderStatus,
  approveOrder,
  refuseOrder,
  cancelOrder
} from '../utils/orders.js';
import { checkStock, getProductById } from '../utils/products.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { verifyCSRF, stateChangeRateLimiter } from '../middleware/security.js';
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendOrderStatusEmail,
  sendOrderCancellationEmail
} from '../utils/email.js';

const router = express.Router();

// Create new order (public, no auth required)
router.post('/', stateChangeRateLimiter, verifyCSRF, async (req, res) => {
  try {
    const { email, userId, items, shipping, payment, address } = req.body;

    // Validation
    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Email and items are required' });
    }

    if (!address || !address.streetAddress || !address.regionState || !address.cityArea) {
      return res.status(400).json({ error: 'Complete address is required' });
    }

    // Check stock availability and resolve actual colors for all items
    const resolvedItems = [];
    for (const item of items) {
      const product = getProductById(item.productId);
      let actualColor = item.color;
      
      // If color is 'default' or not provided, use the first available color
      if (!actualColor || actualColor === 'default') {
        if (product && product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          const firstColor = product.colors[0];
          actualColor = typeof firstColor === 'object' && firstColor.name ? firstColor.name : firstColor;
        } else {
          actualColor = 'default';
        }
      }
      
      // Check stock with resolved color
      const stockCheck = checkStock(item.productId, item.size || 'One Size', actualColor, item.quantity);
      if (!stockCheck.available) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name}: ${stockCheck.message}` 
        });
      }
      
      resolvedItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'One Size',
        color: actualColor, // Use resolved color
        image: item.image
      });
    }

    // Create order
    const orderData = {
      email: email.toLowerCase(),
      userId: userId || null,
      items: resolvedItems,
      shipping: shipping || { method: 'Standard Shipping', cost: 100 },
      payment: payment || { method: 'Cash on Delivery' },
      address: {
        firstName: address.firstName,
        lastName: address.lastName,
        mobileNumber: address.mobileNumber,
        streetAddress: address.streetAddress,
        country: address.country || 'Bangladesh',
        regionState: address.regionState,
        cityArea: address.cityArea,
        zipPostalCode: address.zipPostalCode,
        sameAddress: address.sameAddress || true,
        deliveryInstructions: address.deliveryInstructions
      }
    };

    const order = saveOrder(orderData);

    // Send confirmation emails (async, don't wait)
    sendOrderConfirmationEmail(email, order).catch(err => {
      console.error('Failed to send confirmation email:', err);
      console.error('Email error details:', {
        email: email,
        orderId: order.id,
        error: err.message || err
      });
    });
    sendAdminOrderNotificationEmail(order).catch(err => {
      console.error('Failed to send admin notification:', err);
      console.error('Email error details:', {
        orderId: order.id,
        error: err.message || err
      });
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Get all orders (admin only)
router.get('/', adminAuth, (req, res) => {
  try {
    const orders = getAllOrders();
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by email
router.get('/email/:email', (req, res) => {
  try {
    // Decode the email parameter (it's URL encoded)
    const email = decodeURIComponent(req.params.email);
    const orders = getOrdersByEmail(email);
    res.json({ orders: orders || [] });
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id/status', stateChangeRateLimiter, verifyCSRF, adminAuth, async (req, res) => {
  try {
    const { status, adminStatus, shipperName } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { order, statusChanged } = updateOrderStatus(req.params.id, status, adminStatus, shipperName);

    // Send status update email only if status actually changed
    if (statusChanged) {
      sendOrderStatusEmail(order.email, order, status, shipperName).catch(err => {
        console.error('Failed to send status email:', err);
        console.error('Email error details:', {
          email: order.email,
          orderId: order.id,
          status: status,
          error: err.message || err
        });
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ error: error.message || 'Failed to update order status' });
  }
});

// Approve order (admin only, decreases stock)
router.put('/:id/approve', stateChangeRateLimiter, verifyCSRF, adminAuth, async (req, res) => {
  try {
    const { order, statusChanged } = approveOrder(req.params.id);
    
    // Check if order is already delivered (cannot approve after delivery)
    if (order.status === 'delivered') {
      return res.status(400).json({ error: 'Cannot approve order after it is delivered' });
    }

    // Send status update email only if status actually changed
    if (statusChanged) {
      sendOrderStatusEmail(order.email, order, 'approved', null).catch(err => {
        console.error('Failed to send approval email:', err);
        console.error('Email error details:', {
          email: order.email,
          orderId: order.id,
          error: err.message || err
        });
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(400).json({ error: error.message || 'Failed to approve order' });
  }
});

// Refuse order (admin only)
router.put('/:id/refuse', stateChangeRateLimiter, verifyCSRF, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const { order, statusChanged } = refuseOrder(req.params.id);

    // Send status update email only if status actually changed
    if (statusChanged) {
      sendOrderStatusEmail(order.email, order, 'refused', null).catch(err => {
        console.error('Failed to send refusal email:', err);
        console.error('Email error details:', {
          email: order.email,
          orderId: order.id,
          error: err.message || err
        });
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error refusing order:', error);
    res.status(400).json({ error: error.message || 'Failed to refuse order' });
  }
});

// Cancel order (user or admin)
router.put('/:id/cancel', stateChangeRateLimiter, verifyCSRF, async (req, res) => {
  try {
    const { reason, email: providedEmail } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    // Get order first to check permissions
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const orderEmail = order.email.toLowerCase();
    let cancelledBy = 'user';
    let isAdmin = false;
    let userEmail = null;
    let userId = null;
    
    // Try to verify token and get user info
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { getUserById } = await import('../utils/users.js');
        const user = getUserById(decoded.userId);
        if (user) {
          userId = user.id;
          userEmail = user.email.toLowerCase();
          if (userEmail === 'raiyanbinrashid0@gmail.com') {
            cancelledBy = 'admin';
            isAdmin = true;
          }
        }
      } catch (err) {
        // Token verification failed - will use provided email as fallback
      }
    }
    
    // Determine if user can cancel this order
    // Priority: Admin > userId match > Token-verified user email match > Provided email match
    let canCancel = false;
    
    if (isAdmin) {
      // Admin can cancel any order
      canCancel = true;
    } else if (userId && order.userId && userId === order.userId) {
      // Logged-in user's ID matches order's userId (most reliable check)
      canCancel = true;
    } else if (userEmail && userEmail === orderEmail) {
      // Logged-in user (token verified) email matches order email
      canCancel = true;
    } else if (providedEmail && providedEmail.toLowerCase() === orderEmail) {
      // Provided email matches order email (for guest orders or when token fails)
      canCancel = true;
    } else if ((userId && order.userId && userId !== order.userId) || (userEmail && userEmail !== orderEmail)) {
      // Logged-in user doesn't own this order
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    } else {
      // No valid authentication or email match
      // If token was provided but verification failed, suggest using email
      if (token) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please ensure you are logged in with the same email used to place this order, or provide your email if you placed this order as a guest.' 
        });
      } else {
        return res.status(401).json({ 
          error: 'Authentication required to cancel order. Please log in or provide your email if you placed this order as a guest.' 
        });
      }
    }
    
    if (!canCancel) {
      return res.status(403).json({ error: 'You do not have permission to cancel this order' });
    }

    const cancelledOrder = cancelOrder(req.params.id, reason, cancelledBy);

    // Send cancellation email (async)
    sendOrderCancellationEmail(cancelledOrder.email, cancelledOrder, cancelledBy).catch(err => {
      console.error('Failed to send cancellation email:', err);
      console.error('Email error details:', {
        email: cancelledOrder.email,
        orderId: cancelledOrder.id,
        error: err.message || err
      });
    });

    res.json({ order: cancelledOrder });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel order' });
  }
});

export default router;

