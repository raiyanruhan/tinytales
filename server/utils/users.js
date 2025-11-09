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
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
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
    users[existingIndex] = userData;
  } else {
    users.push(userData);
  }
  
  writeUsers(users);
  return userData;
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

