import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import csrf from 'csrf'
import cookieParser from 'cookie-parser'

const csrfProtection = new csrf()

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:
    process.env.NODE_ENV === 'production'
      ? 200
      : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' || req.path.startsWith('/uploads/')
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
})

export const stateChangeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
})

export const cookieParserMiddleware = cookieParser()

export const generateCSRFToken = (req, res, next) => {
  let secret = req.cookies['csrf-secret']

  if (!secret) {
    secret = csrfProtection.secretSync()
    res.cookie('csrf-secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })
  }

  const token = csrfProtection.create(secret)
  res.setHeader('X-CSRF-Token', token)
  req.csrfToken = token
  next()
}

export const verifyCSRF = (req, res, next) => {
  const secret = req.cookies['csrf-secret']
  const token = req.headers['x-csrf-token'] || req.body?._csrf

  if (!secret || !token) {
    return res.status(403).json({ error: 'CSRF token missing' })
  }

  if (!csrfProtection.verify(secret, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }

  next()
}

export const sanitizeInput = (fields) => {
  const validations = []

  if (fields.email) {
    validations.push(
      body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Invalid email format')
    )
  }

  if (fields.password) {
    validations.push(
      body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .escape()
    )
  }

  if (fields.name) {
    validations.push(
      body('name')
        .trim()
        .escape()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
    )
  }

  if (fields.other) {
    fields.other.forEach((field) => {
      validations.push(
        body(field)
          .optional()
          .trim()
          .escape()
      )
    })
  }

  return [
    ...validations,
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        })
      }
      next()
    }
  ]
}

export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim()
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key])
        }
      })
    }
    sanitize(req.body)
  }
  next()
}

