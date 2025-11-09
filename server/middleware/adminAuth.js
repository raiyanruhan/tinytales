import jwt from 'jsonwebtoken';
import { getUserById } from '../utils/users.js';

const ADMIN_EMAIL = 'raiyanbinrashid0@gmail.com';

export function adminAuth(req, res, next) {
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

    if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}


