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


