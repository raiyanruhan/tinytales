import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = join(__dirname, '../data/users.json');

// Initialize users file if it doesn't exist
function initUsersFile() {
  if (!existsSync(USERS_FILE)) {
    const dir = join(__dirname, '../data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Read users from file
function readUsers() {
  try {
    initUsersFile();
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Write users to file
function writeUsers(users) {
  try {
    initUsersFile();
    const jsonData = JSON.stringify(users, null, 2);
    writeFileSync(USERS_FILE, jsonData, 'utf8');
    console.log('Users file written successfully. Total users:', users.length);
    // Verify the write by reading back
    const verify = readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(verify);
    console.log('Verification - File contains', parsed.length, 'users');
    if (parsed.length > 0 && parsed[0].wishlist !== undefined) {
      console.log('Verification - First user wishlist:', parsed[0].wishlist);
    }
  } catch (error) {
    console.error('Error writing users:', error);
    throw error;
  }
}

// Get user by email
export function getUserByEmail(email) {
  const users = readUsers();
  return users.find(user => user.email === email.toLowerCase());
}

// Get user by ID
export function getUserById(id) {
  const users = readUsers();
  return users.find(user => user.id === id);
}

// Save or update user
export function saveUser(userData) {
  const users = readUsers();
  const existingIndex = users.findIndex(u => u.id === userData.id);
  
  if (existingIndex >= 0) {
    // Merge the updated data with existing user to preserve all fields
    users[existingIndex] = { ...users[existingIndex], ...userData };
  } else {
    users.push(userData);
  }
  
  writeUsers(users);
  // Return the saved user from the array to ensure we have the actual saved data
  const savedIndex = users.findIndex(u => u.id === userData.id);
  return savedIndex >= 0 ? users[savedIndex] : userData;
}

// Update user verification
export function updateUserVerification(userId, verified) {
  const user = getUserById(userId);
  if (user) {
    user.verified = verified;
    user.updatedAt = new Date().toISOString();
    saveUser(user);
  }
  return user;
}

// Get saved cart for user
export function getSavedCart(userId) {
  const user = getUserById(userId);
  return user?.savedCart || null;
}

// Save cart for user
export function saveCart(userId, cartItems) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.savedCart = cartItems;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  return user.savedCart;
}

// Clear saved cart (on logout - but keep on server per requirements)
// Actually, per requirements, we don't clear server cart on logout
// This function is kept for potential future use
export function clearSavedCart(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Per requirements: server cart persists on server even after logout
  // So we don't actually clear it here
  // user.savedCart = null;
  // user.updatedAt = new Date().toISOString();
  // saveUser(user);
  return null;
}

// Get wishlist for user
export function getWishlist(userId) {
  const user = getUserById(userId);
  return user?.wishlist || [];
}

// Add product to wishlist
export function addToWishlist(userId, productId) {
  console.log('addToWishlist called with:', { userId, productId });

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  console.log('User found:', { id: user.id, wishlist: user.wishlist });

  // Ensure wishlist exists
  if (!user.wishlist) {
    user.wishlist = [];
  }

  console.log('User wishlist before add:', user.wishlist);

  // Check if product already in wishlist
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    user.updatedAt = new Date().toISOString();

    console.log('User wishlist after add:', user.wishlist);

    // Save the entire updated user object
    console.log('Saving updated user:', user);
    const savedUser = saveUser(user);
    console.log('saveUser returned:', savedUser);

    // Verify the save worked
    const verifyUser = getUserById(userId);
    console.log('Verification - User from file:', verifyUser);
    if (!verifyUser || !verifyUser.wishlist || !verifyUser.wishlist.includes(productId)) {
      console.error('Wishlist save verification failed!');
      throw new Error('Failed to save wishlist to database');
    }

    console.log('SUCCESS: Wishlist saved!');
  } else {
    console.log('Product already in wishlist');
  }

  return user.wishlist;
}

// Remove product from wishlist
export function removeFromWishlist(userId, productId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.wishlist) {
    user.wishlist = [];
  }
  
  user.wishlist = user.wishlist.filter(id => id !== productId);
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  
  return user.wishlist;
}

// Check if product is in wishlist
export function isInWishlist(userId, productId) {
  const user = getUserById(userId);
  if (!user || !user.wishlist) {
    return false;
  }
  return user.wishlist.includes(productId);
}

