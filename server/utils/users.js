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
    // Verify the write by reading back
    const verify = readFileSync(USERS_FILE, 'utf8');
    JSON.parse(verify);
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
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Ensure wishlist exists
  if (!user.wishlist) {
    user.wishlist = [];
  }

  // Check if product already in wishlist
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    user.updatedAt = new Date().toISOString();

    // Save the entire updated user object
    saveUser(user);

    // Verify the save worked
    const verifyUser = getUserById(userId);
    if (!verifyUser || !verifyUser.wishlist || !verifyUser.wishlist.includes(productId)) {
      throw new Error('Failed to save wishlist to database');
    }
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

// Update user role
export function updateUserRole(userId, role) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.role = role;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  return user;
}

// Save refresh token for user
export function saveRefreshToken(userId, refreshToken) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.refreshToken = refreshToken;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  return user;
}

// Get refresh token for user
export function getRefreshToken(userId) {
  const user = getUserById(userId);
  return user?.refreshToken || null;
}

// Clear refresh token
export function clearRefreshToken(userId) {
  const user = getUserById(userId);
  if (!user) {
    return;
  }
  user.refreshToken = null;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
}

// Increment failed login attempts
export function incrementFailedLoginAttempts(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000; // 30 minutes
  
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  
  if (user.failedLoginAttempts >= maxAttempts) {
    user.lockedUntil = new Date(Date.now() + lockoutDuration).toISOString();
  }
  
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  return user;
}

// Reset failed login attempts (on successful login)
export function resetFailedLoginAttempts(userId) {
  const user = getUserById(userId);
  if (!user) {
    return;
  }
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
}

// Check if account is locked
export function isAccountLocked(user) {
  if (!user.lockedUntil) {
    return false;
  }
  
  const lockedUntil = new Date(user.lockedUntil);
  const now = new Date();
  
  if (now > lockedUntil) {
    // Lockout expired, reset it
    user.lockedUntil = null;
    user.failedLoginAttempts = 0;
    user.updatedAt = new Date().toISOString();
    saveUser(user);
    return false;
  }
  
  return true;
}

// Set password reset token
export function setPasswordResetToken(userId, token, expiry) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.passwordResetToken = token;
  user.passwordResetExpiry = expiry;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
  return user;
}

// Get user by password reset token
export function getUserByPasswordResetToken(token) {
  const users = readUsers();
  return users.find(user => 
    user.passwordResetToken === token && 
    user.passwordResetExpiry &&
    new Date(user.passwordResetExpiry) > new Date()
  );
}

// Clear password reset token
export function clearPasswordResetToken(userId) {
  const user = getUserById(userId);
  if (!user) {
    return;
  }
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  user.updatedAt = new Date().toISOString();
  saveUser(user);
}

