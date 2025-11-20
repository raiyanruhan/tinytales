# Security Implementation Guide

This document outlines the security features implemented in the TinyTales frontend application.

## Security Features

### 1. XSS Protection (Cross-Site Scripting)

**Implementation:**
- Uses DOMPurify library for HTML sanitization
- All user inputs are sanitized before display
- Text inputs are escaped to prevent script injection

**Files:**
- `src/utils/sanitize.ts` - Sanitization utilities
- Used in: Login, Signup, Checkout, and all form inputs

**Usage:**
```typescript
import { sanitizeText, sanitizeHtml, sanitizeUrl } from '@utils/sanitize';

// Sanitize plain text
const safeText = sanitizeText(userInput);

// Sanitize HTML content
const safeHtml = sanitizeHtml(userHtml);

// Sanitize URLs
const safeUrl = sanitizeUrl(userUrl);
```

### 2. CSRF Token Handling

**Implementation:**
- Automatic CSRF token generation and management
- Tokens stored in sessionStorage
- Automatically included in all authenticated requests
- Token regeneration on CSRF errors

**Files:**
- `src/utils/csrf.ts` - CSRF token management
- Integrated into all API services

**How it works:**
1. Token is generated on first request
2. Stored in sessionStorage
3. Automatically added to request headers as `X-CSRF-Token`
4. Backend validates token on state-changing operations

### 3. Content Security Policy (CSP)

**Implementation:**
- CSP meta tag in `index.html`
- Restricts resource loading to trusted sources
- Prevents inline script execution (with exceptions for Vite)
- Blocks frame embedding

**Current Policy:**
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Required for Vite dev mode
- `style-src 'self' 'unsafe-inline'` - Allow inline styles
- `img-src 'self' data: https: blob:` - Allow images from various sources
- `connect-src 'self' https://api.tinytalesearth.com` - API connections
- `frame-src 'none'` - Block all frames
- `upgrade-insecure-requests` - Force HTTPS

**Note:** For production, consider tightening CSP by removing `unsafe-inline` and `unsafe-eval` if possible.

### 4. Secure Token Storage

**Implementation:**
- Secure storage wrapper with httpOnly cookie support
- Fallback to localStorage for compatibility
- Automatic token cleanup on logout
- CSRF token clearing on logout

**Files:**
- `src/utils/secureStorage.ts` - Secure storage utilities
- `src/context/AuthContext.tsx` - Updated to use secure storage

**Features:**
- `storeToken()` - Securely stores authentication token
- `getToken()` - Retrieves token (checks httpOnly cookie first)
- `removeToken()` - Clears token from all storage
- `secureFetch()` - Wrapper for fetch with CSRF and cookie support

**httpOnly Cookie Support:**
- Backend must set httpOnly cookies via `Set-Cookie` header
- Frontend automatically includes cookies with `credentials: 'include'`
- Tokens in httpOnly cookies are not accessible to JavaScript (more secure)

## Security Best Practices

### Input Validation
- All user inputs are sanitized before processing
- Email addresses are validated and sanitized
- URLs are validated before use
- Form data is sanitized before submission

### API Requests
- All authenticated requests include CSRF tokens
- All requests use `credentials: 'include'` for cookie support
- Error handling prevents information leakage

### Token Management
- Tokens are stored securely
- Tokens are cleared on logout
- CSRF tokens are regenerated on errors

## Backend Requirements

For full security implementation, the backend should:

1. **CSRF Protection:**
   - Validate `X-CSRF-Token` header on state-changing requests
   - Return 403 with CSRF error message if invalid

2. **httpOnly Cookies:**
   - Set authentication token as httpOnly cookie on login
   - Include `SameSite=Strict` attribute
   - Use `Secure` flag in production (HTTPS only)

3. **CSP Headers:**
   - Set CSP headers in server response
   - Match or be stricter than frontend CSP

4. **Input Validation:**
   - Validate all inputs on server side
   - Sanitize inputs before database operations
   - Return appropriate error messages

## Testing Security

### XSS Testing
```javascript
// Try injecting scripts in inputs
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
```

### CSRF Testing
- Verify CSRF token is included in requests
- Verify backend rejects requests without valid token

### Token Security
- Verify tokens are not exposed in localStorage (use httpOnly cookies)
- Verify tokens are cleared on logout
- Verify tokens expire appropriately

## Future Enhancements

1. **Rate Limiting:** Implement client-side rate limiting for API calls
2. **Token Refresh:** Implement automatic token refresh before expiration
3. **Stricter CSP:** Remove `unsafe-inline` and `unsafe-eval` in production
4. **Subresource Integrity:** Add SRI for external scripts/stylesheets
5. **HSTS:** Implement HTTP Strict Transport Security headers

## Security Checklist

- [x] XSS protection (DOMPurify)
- [x] CSRF token handling
- [x] Content Security Policy
- [x] Secure token storage
- [x] Input sanitization
- [x] httpOnly cookie support
- [ ] Backend CSRF validation (backend task)
- [ ] Backend httpOnly cookie implementation (backend task)
- [ ] Rate limiting (future)
- [ ] Token refresh mechanism (future)

