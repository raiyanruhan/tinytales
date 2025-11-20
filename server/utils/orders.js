import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { decreaseStock, increaseStock } from './products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ORDERS_FILE = join(__dirname, '../data/orders.json');

// Status progression order (cannot go backwards)
// Special statuses (approved, refused, cancelled) can be set at various stages
// but don't block forward progression in the main flow
const STATUS_ORDER = {
  pending: 0,
  awaiting_processing: 1,
  order_confirmation: 2,
  approved: 2, // Can happen after order_confirmation, same level
  shipped: 3,
  delivered: 4,
  refused: 1, // Can happen early, but shouldn't block progression
  cancelled: 0 // Can happen at any time
};

// Valid status transitions - allows certain special transitions
const VALID_TRANSITIONS = {
  // Can go from approved to shipped/delivered (forward progression) or back to processing (admin override)
  'approved': ['shipped', 'delivered', 'refused', 'cancelled', 'awaiting_processing', 'order_confirmation'],
  // Can go from refused back to processing (admin override)
  'refused': ['awaiting_processing', 'order_confirmation', 'approved', 'cancelled'],
  // Can go from order_confirmation to approved
  'order_confirmation': ['approved', 'shipped', 'delivered', 'refused', 'cancelled', 'awaiting_processing'],
  // Can go from awaiting_processing to approved or order_confirmation
  'awaiting_processing': ['order_confirmation', 'approved', 'shipped', 'delivered', 'refused', 'cancelled']
};

// Initialize orders file if it doesn't exist
function initOrdersFile() {
  if (!existsSync(ORDERS_FILE)) {
    const dir = join(__dirname, '../data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
}

// Read orders from file
function readOrders() {
  try {
    initOrdersFile();
    const data = readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

// Write orders to file
function writeOrders(orders) {
  try {
    initOrdersFile();
    writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error writing orders:', error);
  }
}

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TT-${timestamp}-${random}`;
}

// Get order by ID
export function getOrderById(id) {
  const orders = readOrders();
  return orders.find(order => order.id === id);
}

// Get orders by email
export function getOrdersByEmail(email) {
  const orders = readOrders();
  return orders.filter(order => order.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get all orders
export function getAllOrders() {
  const orders = readOrders();
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Save order (create new)
export function saveOrder(orderData) {
  const orders = readOrders();
  const now = new Date().toISOString();
  
  const newOrder = {
    id: orderData.id || Date.now().toString(),
    orderNumber: generateOrderNumber(),
    email: orderData.email,
    userId: orderData.userId || null,
    items: orderData.items || [],
    shipping: orderData.shipping || {},
    payment: orderData.payment || { method: 'Cash on Delivery' },
    address: orderData.address || {},
    status: 'pending',
    adminStatus: null,
    shipperName: null,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    cancelledBy: null
  };
  
  orders.push(newOrder);
  writeOrders(orders);
  return newOrder;
}

// Update order status with restrictions
export function updateOrderStatus(id, status, adminStatus, shipperName) {
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const order = orders[orderIndex];
  
  // Cannot change status if already delivered
  if (order.status === 'delivered') {
    throw new Error('Cannot change status after order is delivered');
  }
  
  // Check if status change is backwards (not allowed)
  const currentStatusOrder = STATUS_ORDER[order.status] || 0;
  const newStatusOrder = STATUS_ORDER[status] || 0;
  
  // Check for valid special transitions first
  const validTransitions = VALID_TRANSITIONS[order.status] || [];
  const hasValidTransition = validTransitions.includes(status);
  
  // Special case: cancelled can always be set
  if (status === 'cancelled') {
    // Always allowed
  }
  // Special case: approved can transition to shipped/delivered (forward progression)
  else if (order.status === 'approved' && (status === 'shipped' || status === 'delivered')) {
    // Valid forward transition from approved
  }
  // Check if it's a valid special transition
  else if (hasValidTransition) {
    // Valid special transition
  }
  // Normal flow: allow if moving forward or staying at same level
  else if (newStatusOrder >= currentStatusOrder) {
    // Valid forward progression
  }
  // Otherwise, it's an invalid backward transition
  else {
    throw new Error(`Cannot change status from "${order.status}" to "${status}". Status can only move forward in the order flow.`);
  }
  
  // If reverting from approved to a previous status, restore stock
  if (order.status === 'approved' && status !== 'approved' && 
      (status === 'awaiting_processing' || status === 'order_confirmation' || status === 'refused' || status === 'cancelled')) {
    try {
      for (const item of order.items) {
        increaseStock(item.productId, item.size, item.color, item.quantity);
      }
    } catch (error) {
      console.error('Error restoring stock when reverting approved order:', error);
      // Don't throw - allow status change even if stock restoration fails
    }
  }
  
  // Track if status actually changed (for email sending)
  const statusChanged = order.status !== status;
  
  order.status = status;
  if (adminStatus !== undefined) {
    order.adminStatus = adminStatus;
  }
  if (shipperName !== undefined) {
    order.shipperName = shipperName;
  }
  order.updatedAt = new Date().toISOString();
  
  writeOrders(orders);
  
  // Return order with flag indicating if status changed
  return { order, statusChanged };
}

// Approve order (decreases stock)
export function approveOrder(id) {
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const order = orders[orderIndex];
  
  // Cannot approve if already delivered
  if (order.status === 'delivered') {
    throw new Error('Cannot approve order after it is delivered');
  }
  
  // Track if status actually changed (for email sending)
  const statusChanged = order.status !== 'approved';
  
  if (order.status === 'approved') {
    return { order, statusChanged: false }; // Already approved
  }
  
  // Decrease stock for each item
  try {
    for (const item of order.items) {
      decreaseStock(item.productId, item.size, item.color, item.quantity);
    }
  } catch (error) {
    throw new Error(`Stock update failed: ${error.message}`);
  }
  
  order.status = 'approved';
  order.updatedAt = new Date().toISOString();
  
  writeOrders(orders);
  return { order, statusChanged };
}

// Refuse order
export function refuseOrder(id) {
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const order = orders[orderIndex];
  
  // Cannot refuse if already delivered
  if (order.status === 'delivered') {
    throw new Error('Cannot refuse order after it is delivered');
  }
  
  // Track if status actually changed (for email sending)
  const statusChanged = order.status !== 'refused';
  
  order.status = 'refused';
  order.updatedAt = new Date().toISOString();
  
  writeOrders(orders);
  
  // Return order with flag indicating if status changed
  return { order, statusChanged };
}

// Cancel order (check permissions)
export function cancelOrder(id, reason, cancelledBy) {
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const order = orders[orderIndex];
  
  // User can only cancel if status is pending
  if (cancelledBy === 'user' && order.status !== 'pending') {
    throw new Error('You can only cancel orders before admin approval');
  }
  
  // Admin can cancel at any time
  // If order was approved, restore stock
  if (order.status === 'approved') {
    try {
      for (const item of order.items) {
        increaseStock(item.productId, item.size, item.color, item.quantity);
      }
    } catch (error) {
      console.error('Error restoring stock:', error);
    }
  }
  
  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  order.cancelledBy = cancelledBy;
  order.updatedAt = new Date().toISOString();
  
  writeOrders(orders);
  return order;
}

// Restore stock when order cancelled (if approved)
export function restoreStock(orderId) {
  const order = getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.status !== 'approved') {
    return; // No stock to restore
  }
  
  try {
    for (const item of order.items) {
      increaseStock(item.productId, item.size, item.color, item.quantity);
    }
  } catch (error) {
    console.error('Error restoring stock:', error);
    throw error;
  }
}

