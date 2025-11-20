# CSRF Token Fix

## Problem
Frontend was getting "CSRF token not available" error because:
1. Backend wasn't exposing the `X-CSRF-Token` header in CORS
2. Browsers block access to custom headers unless explicitly exposed

## Solution
Updated `server/server.js` CORS configuration to expose the `X-CSRF-Token` header:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.tinytalesearth.com', 'https://tinytalesearth.com', 'tinytales-seven.vercel.app'] 
    : 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token'] // Expose CSRF token header to frontend
}));
```

## How It Works

1. **Backend generates CSRF token** on GET requests (via `generateCSRFToken` middleware)
2. **Backend sends token** in `X-CSRF-Token` response header
3. **CORS exposes the header** so frontend can read it
4. **Frontend stores token** in sessionStorage
5. **Frontend sends token** back in `X-CSRF-Token` request header on POST/PUT/DELETE
6. **Backend validates token** using `verifyCSRF` middleware

## Testing

1. Restart backend server
2. Open browser DevTools → Network tab
3. Make a GET request (e.g., to `/api/health`)
4. Check response headers - should see `X-CSRF-Token`
5. Make a POST request (e.g., login)
6. Check request headers - should see `X-CSRF-Token` included
7. Should no longer get 403 Forbidden errors

## Additional Frontend Improvements

- Added automatic CSRF token fetching on app load
- Added retry logic if CSRF validation fails
- Better error messages for CSRF failures
- Token refresh on validation errors

