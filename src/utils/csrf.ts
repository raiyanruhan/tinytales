/**
 * CSRF Token Management
 * Works with backend CSRF implementation that uses httpOnly cookies
 * Backend generates tokens and sends them in X-CSRF-Token header
 */

const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_TOKEN_HEADER = 'X-CSRF-Token'

/**
 * Get CSRF token from backend
 * Makes a GET request to fetch the token from X-CSRF-Token header
 * @returns CSRF token string
 */
async function fetchCsrfTokenFromBackend(): Promise<string | null> {
  try {
    const { getApiUrl } = await import('./apiUrl')
    const API_URL = getApiUrl()
    
    // Extract base URL (remove /api if present)
    let baseUrl = API_URL
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4)
    }
    
    // Make a GET request to get CSRF token (backend generates it on all GET requests)
    // Try health endpoint first, then root
    let response: Response | null = null
    
    try {
      response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        credentials: 'include' // Important: includes httpOnly cookies
      })
    } catch (err) {
      // If health endpoint fails, try root
      try {
        response = await fetch(`${baseUrl}/`, {
          method: 'GET',
          credentials: 'include'
        })
      } catch (rootErr) {
        console.error('Failed to fetch CSRF token from both endpoints:', err, rootErr)
        return null
      }
    }
    
    if (!response) {
      return null
    }
    
    // Extract token from response header
    // Note: CORS might restrict access to custom headers
    // Backend must expose X-CSRF-Token in Access-Control-Expose-Headers
    const token = response.headers.get(CSRF_TOKEN_HEADER)
    
    if (!token) {
      console.warn('CSRF token not found in response headers')
      console.log('Response status:', response.status)
      console.log('Response URL:', response.url)
      
      // Try to get all headers (for debugging)
      const allHeaders: string[] = []
      response.headers.forEach((value, key) => {
        allHeaders.push(`${key}: ${value}`)
      })
      console.log('Available response headers:', allHeaders)
      
      // If token is not in headers, it might be a CORS issue
      // Backend needs to expose the header in Access-Control-Expose-Headers
      console.error('CSRF token header not accessible. Check backend CORS configuration.')
      console.error('Backend must expose X-CSRF-Token in Access-Control-Expose-Headers')
    }
    
    return token
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return null
  }
}

/**
 * Get or fetch CSRF token
 * First checks sessionStorage, then fetches from backend if needed
 * @returns CSRF token string or null
 */
export async function getCsrfToken(): Promise<string | null> {
  // Check if we have a cached token
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY)
  
  if (!token) {
    // Fetch token from backend
    token = await fetchCsrfTokenFromBackend()
    if (token) {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token)
    }
  }
  
  return token
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCsrfToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY)
}

/**
 * Refresh CSRF token from backend
 * Useful when token validation fails
 * @returns New CSRF token or null
 */
export async function refreshCsrfToken(): Promise<string | null> {
  clearCsrfToken()
  return await getCsrfToken()
}

/**
 * Get CSRF token header name
 * @returns Header name for CSRF token
 */
export function getCsrfHeaderName(): string {
  return CSRF_TOKEN_HEADER
}

/**
 * Add CSRF token to fetch request headers
 * Automatically fetches token if not available
 * @param headers - Existing headers object
 * @returns Headers with CSRF token
 */
export async function addCsrfTokenToHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
  let token = await getCsrfToken()
  
  // If token is not available, try to fetch it now
  if (!token) {
    console.log('CSRF token not found, fetching from backend...')
    token = await fetchCsrfTokenFromBackend()
    if (token) {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token)
      console.log('CSRF token fetched and stored')
    } else {
      console.error('Failed to fetch CSRF token from backend')
      // Don't throw error, just return headers without CSRF token
      // Backend will return 403 if CSRF is required
    }
  }
  
  const headersObj = headers instanceof Headers 
    ? Object.fromEntries(headers.entries())
    : Array.isArray(headers)
    ? Object.fromEntries(headers)
    : headers
    
  if (token) {
    return {
      ...headersObj,
      [CSRF_TOKEN_HEADER]: token
    }
  }
  
  return headersObj
}

/**
 * Validate CSRF token from server response
 * If server returns 403 with CSRF error, refresh token
 * @param response - Fetch response
 */
export async function validateCsrfResponse(response: Response): Promise<void> {
  if (response.status === 403) {
    try {
      const data = await response.json()
      if (data.error && (data.error.toLowerCase().includes('csrf') || data.error.toLowerCase().includes('token'))) {
        // Refresh token on CSRF error
        await refreshCsrfToken()
        throw new Error('CSRF token validation failed. Please try again.')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('CSRF')) {
        throw error
      }
      // If response is not JSON, continue
    }
  }
  
  // Update token from response header if present (backend may send new token)
  const newToken = response.headers.get(CSRF_TOKEN_HEADER)
  if (newToken) {
    sessionStorage.setItem(CSRF_TOKEN_KEY, newToken)
  }
}
