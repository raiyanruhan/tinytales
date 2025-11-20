import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRODUCTS_FILE = join(__dirname, '../data/products.json');

// Initialize products file if it doesn't exist
function initProductsFile() {
  if (!existsSync(PRODUCTS_FILE)) {
    const dir = join(__dirname, '../data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
  }
}

// Read products from file
function readProducts() {
  try {
    initProductsFile();
    const data = readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

// Write products to file
function writeProducts(products) {
  try {
    initProductsFile();
    writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error writing products:', error);
  }
}

// Get product by ID
export function getProductById(id) {
  const products = readProducts();
  return products.find(product => product.id === id);
}

// Get all products (sorted by order, then by createdAt)
export function getAllProducts() {
  const products = readProducts();
  return products.sort((a, b) => {
    const orderA = a.order ?? 999999;
    const orderB = b.order ?? 999999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
}

// Save or update product
export function saveProduct(productData) {
  const products = readProducts();
  const existingIndex = products.findIndex(p => p.id === productData.id);
  
  const now = new Date().toISOString();
  
  if (existingIndex >= 0) {
    // Update existing product
    products[existingIndex] = {
      ...products[existingIndex],
      ...productData,
      updatedAt: now
    };
  } else {
    // Create new product
    const newProduct = {
      ...productData,
      createdAt: now,
      updatedAt: now
    };
    products.push(newProduct);
  }
  
  writeProducts(products);
  return existingIndex >= 0 ? products[existingIndex] : products[products.length - 1];
}

// Delete product
export function deleteProduct(id) {
  const products = readProducts();
  const filtered = products.filter(p => p.id !== id);
  writeProducts(filtered);
  return filtered.length < products.length;
}

// Reorder products
export function reorderProducts(productsWithOrder) {
  const products = readProducts();
  const orderMap = new Map(productsWithOrder.map(p => [p.id, p.order]));
  
  products.forEach(product => {
    if (orderMap.has(product.id)) {
      product.order = orderMap.get(product.id);
      product.updatedAt = new Date().toISOString();
    }
  });
  
  writeProducts(products);
  return getAllProducts();
}

// Decrease stock for a product
export function decreaseStock(productId, size, color, quantity) {
  const products = readProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.stock) {
    product.stock = {};
  }
  
  // If color is 'default' or not provided, use the first available color
  let actualColor = color;
  if (!actualColor || actualColor === 'default') {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0];
      actualColor = typeof firstColor === 'object' && firstColor.name ? firstColor.name : firstColor;
    } else {
      actualColor = 'default';
    }
  }
  
  const stockKey = `${size}-${actualColor}`;
  let currentStock = product.stock[stockKey];
  
  // If stock key not found, try alternative formats or use size-only key as fallback
  if (currentStock === undefined) {
    // Try size-only key (for backward compatibility with old products)
    currentStock = product.stock[size];
    
    // If still not found and stock object exists but is empty, initialize with high default
    // This handles cases where stock wasn't properly initialized
    if (currentStock === undefined && Object.keys(product.stock).length === 0) {
      // No stock data at all - initialize with high default to allow order processing
      currentStock = 999; // Set high default to allow order processing
      product.stock[stockKey] = currentStock;
    } else {
      // Default to 0 if still undefined
      currentStock = currentStock || 0;
    }
  }
  
  if (currentStock < quantity) {
    throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`);
  }
  
  product.stock[stockKey] = currentStock - quantity;
  product.updatedAt = new Date().toISOString();
  
  writeProducts(products);
  return product;
}

// Increase stock for a product (for restoring when order cancelled)
export function increaseStock(productId, size, color, quantity) {
  const products = readProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.stock) {
    product.stock = {};
  }
  
  // If color is 'default' or not provided, use the first available color
  let actualColor = color;
  if (!actualColor || actualColor === 'default') {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const firstColor = product.colors[0];
      actualColor = typeof firstColor === 'object' && firstColor.name ? firstColor.name : firstColor;
    } else {
      actualColor = 'default';
    }
  }
  
  const stockKey = `${size}-${actualColor}`;
  const currentStock = product.stock[stockKey] || 0;
  product.stock[stockKey] = currentStock + quantity;
  product.updatedAt = new Date().toISOString();
  
  writeProducts(products);
  return product;
}

// Check stock availability
export function checkStock(productId, size, color, quantity) {
  const product = getProductById(productId);
  
  if (!product) {
    return { available: false, message: 'Product not found' };
  }
  
  if (!product.stock) {
    return { available: false, message: 'Stock information not available' };
  }
  
  // If color is 'default' or not provided, use the first available color
  let actualColor = color;
  if (!actualColor || actualColor === 'default') {
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      // Handle both old format (string[]) and new format (ProductColor[])
      const firstColor = product.colors[0];
      actualColor = typeof firstColor === 'object' && firstColor.name ? firstColor.name : firstColor;
    } else {
      actualColor = 'default';
    }
  }
  
  const stockKey = `${size}-${actualColor}`;
  let currentStock = product.stock[stockKey];
  
  // If stock key not found, try alternative formats or use size-only key as fallback
  if (currentStock === undefined) {
    // Try size-only key (for backward compatibility with old products)
    currentStock = product.stock[size];
    
    // If still not found and stock object exists but is empty or has no matching keys
    // This handles cases where stock wasn't properly initialized
    if (currentStock === undefined && Object.keys(product.stock).length === 0) {
      // No stock data at all - allow order but log warning
      return { available: true, availableStock: 999 }; // Set high default to allow order
    }
    
    // Default to 0 if still undefined
    currentStock = currentStock || 0;
  }
  
  if (currentStock < quantity) {
    return { available: false, message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`, availableStock: currentStock };
  }
  
  return { available: true, availableStock: currentStock };
}


