import jwt from 'jsonwebtoken';
import { getUserById, saveUser } from '../utils/users.js';

// Roles enum
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Admin email for backward compatibility (legacy admin check)
const ADMIN_EMAIL = 'raiyanbinrashid0@gmail.com';

// Check if user has required role
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = getUserById(decoded.userId);

      if (!user || !user.verified) {
        return res.status(401).json({ error: 'Invalid or unverified user' });
      }

      // Determine user role: check role field first, then fallback to email check for backward compatibility
      let userRole = user.role;
      
      // If no role is set, check if user is admin by email (backward compatibility)
      if (!userRole) {
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          userRole = ROLES.ADMIN;
          // Auto-update user role for future requests
          user.role = ROLES.ADMIN;
          user.updatedAt = new Date().toISOString();
          saveUser(user);
        } else {
          userRole = ROLES.USER;
        }
      }

      // Check if user has required role
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: userRole
        });
      }

      req.user = user;
      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Admin only middleware (convenience wrapper)
export const adminAuth = requireRole(ROLES.ADMIN);

// User or admin middleware
export const userAuth = requireRole(ROLES.USER, ROLES.ADMIN);

