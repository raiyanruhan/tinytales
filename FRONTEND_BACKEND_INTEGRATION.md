# Frontend-Backend Integration Guide

## CSRF Token Flow

The backend uses the `csrf` library which requires a specific flow:

1. **Backend generates CSRF secret** (stored in httpOnly cookie `csrf-secret`)
2. **Backend generates CSRF token** from secret (sent in `X-CSRF-Token` header on GET requests)
3. **Frontend fetches token** by making a GET request (e.g., to `/api/health`)
4. **Frontend stores token** in sessionStorage
5. **Frontend sends token** in `X-CSRF-Token` header on POST/PUT/DELETE requests
6. **Backend validates token** against the secret

## Token Format Changes

The backend now returns:
- `accessToken` (instead of `token`) - expires in 15 minutes
- `refreshToken` - expires in 30 days

The frontend has been updated to handle both formats for backward compatibility.

## API Endpoints

### Authentication Endpoints (require CSRF token)

All POST endpoints require CSRF token in `X-CSRF-Token` header:

- `POST /api/auth/signup` - Requires CSRF token
- `POST /api/auth/signin` - Requires CSRF token
- `POST /api/auth/verify-email` - Requires CSRF token
- `POST /api/auth/resend-code` - Requires CSRF token
- `POST /api/auth/refresh-token` - Requires CSRF token
- `POST /api/auth/logout` - Requires CSRF token

### GET Endpoints (generate CSRF token)

- `GET /api/health` - Returns CSRF token in header
- `GET /api/auth/verify-token` - Does NOT require CSRF (read-only)

## Frontend Implementation

### CSRF Token Management

The frontend automatically:
1. Fetches CSRF token on app initialization (`main.tsx`)
2. Stores token in sessionStorage
3. Includes token in all POST/PUT/DELETE requests
4. Refreshes token if validation fails

### Usage Example

```typescript
import { addCsrfTokenToHeaders, validateCsrfResponse } from '@utils/csrf';

// In your component
const headers = await addCsrfTokenToHeaders({
  'Content-Type': 'application/json',
});

const response = await fetch(`${API_URL}/auth/signin`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ email, password }),
  credentials: 'include', // Important for httpOnly cookies
});

await validateCsrfResponse(response);
```

## Common Issues

### 403 Forbidden Error

**Cause:** CSRF token missing or invalid

**Solution:**
1. Make sure frontend fetches CSRF token before making POST requests
2. Check that `credentials: 'include'` is set in fetch options
3. Verify backend is setting `csrf-secret` cookie
4. Check browser console for CSRF token errors

### Token Not Found

**Cause:** Frontend hasn't fetched CSRF token yet

**Solution:**
- The app automatically fetches token on load
- If needed, manually call `getCsrfToken()` before making requests

### CORS Issues

**Cause:** Backend CORS not configured for frontend origin

**Solution:**
- Check `server/server.js` CORS configuration
- Ensure `credentials: true` is set in CORS config
- Verify frontend origin is in allowed origins list

## Testing

1. **Test CSRF Flow:**
   - Open browser DevTools → Network tab
   - Make a GET request (should see `X-CSRF-Token` in response headers)
   - Make a POST request (should see `X-CSRF-Token` in request headers)

2. **Test Authentication:**
   - Try logging in
   - Check that CSRF token is included in request
   - Verify response includes `accessToken` and `refreshToken`

3. **Test Token Refresh:**
   - Wait for access token to expire (15 minutes)
   - Frontend should automatically refresh using refresh token

## Backend Requirements

The backend must:
1. Set `csrf-secret` cookie on first request
2. Generate CSRF tokens on GET requests
3. Validate CSRF tokens on POST/PUT/DELETE requests
4. Return proper error messages for CSRF failures

## Environment Variables

Frontend `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

Backend `.env`:
```
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret (optional)
NODE_ENV=development
PORT=3001
```

