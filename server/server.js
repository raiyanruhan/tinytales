import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import orderRoutes from './routes/orders.js';
import locationRoutes from './routes/locations.js';
import userRoutes from './routes/users.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  helmetMiddleware,
  generalRateLimiter,
  authRateLimiter,
  stateChangeRateLimiter,
  cookieParserMiddleware,
  generateCSRFToken,
  sanitizeBody
} from './middleware/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware - Applied early
app.use(helmetMiddleware);
app.use(cookieParserMiddleware);
app.use(sanitizeBody);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.tinytalesearth.com', 'https://tinytalesearth.com', 'tinytales-seven.vercel.app'] 
    : 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token'] // Expose CSRF token header to frontend
}));
app.use(express.json());

// General rate limiting
app.use(generalRateLimiter);

// CSRF token generation for GET requests
app.get('*', generateCSRFToken);

// Serve static files from uploads directory
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes with security middleware
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', stateChangeRateLimiter, uploadRoutes);
// Orders: Only apply rate limiting to state-changing operations (handled in middleware)
app.use('/api/orders', orderRoutes);
app.use('/api/locations', locationRoutes);
// Users: Only apply rate limiting to state-changing operations (handled in middleware)
app.use('/api/users', userRoutes);

// Root route for cPanel health check
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TinyTales API</title>
      </head>
      <body>
        <h1>TinyTales API Server</h1>
        <p>Status: Running</p>
        <p>API Health: <a href="/api/health">/api/health</a></p>
      </body>
    </html>
  `);
});

// Health check
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({ 
    status: 'ok', 
    message: 'TinyTales API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


