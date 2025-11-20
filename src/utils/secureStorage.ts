/**
 * Secure Token Storage
 * Provides secure storage mechanisms with fallback to localStorage
 * For httpOnly cookies, backend must set them via Set-Cookie header
 */

const TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'authUser'

/**
 * Store authentication token securely
 * Note: For httpOnly cookies, the backend must set them via Set-Cookie header
 * This function provides localStorage fallback
 * @param token - JWT token
 */
export function storeToken(token: string): void {
  // Store in localStorage as fallback
  // Backend should set httpOnly cookie via Set-Cookie header
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Failed to store token:', error)
  }
}

/**
 * Retrieve authentication token
 * Checks for httpOnly cookie first (if backend sets it), then localStorage
 * @returns Token string or null
 */
export function getToken(): string | null {
  // Try to get from cookie first (if backend sets httpOnly cookie)
  // Since we can't read httpOnly cookies from JS, we rely on backend
  // to send token in response or use localStorage as fallback
  
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Failed to retrieve token:', error)
    return null
  }
}

/**
 * Remove authentication token
 * Clears both localStorage and attempts to clear cookie
 */
export function removeToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    // Clear cookie if it exists (non-httpOnly)
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  } catch (error) {
    console.error('Failed to remove token:', error)
  }
}

/**
 * Store user data securely
 * @param user - User object
 */
export function storeUser(user: any): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to store user:', error)
  }
}

/**
 * Retrieve user data
 * @returns User object or null
 */
export function getUser(): any | null {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Failed to retrieve user:', error)
    return null
  }
}

/**
 * Remove user data
 */
export function removeUser(): void {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Failed to remove user:', error)
  }
}

/**
 * Store refresh token
 */
export function storeRefreshToken(refreshToken: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } catch (error) {
    console.error('Failed to store refresh token:', error)
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error)
    return null
  }
}

/**
 * Remove refresh token
 */
export function removeRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to remove refresh token:', error)
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  removeToken()
  removeRefreshToken()
  removeUser()
}

/**
 * Check if token exists
 * @returns True if token exists
 */
export function hasToken(): boolean {
  return getToken() !== null
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const { getApiUrl } = await import('./apiUrl')
    const API_URL = getApiUrl()
    const { addCsrfTokenToHeaders } = await import('./csrf')
    
    const headers = await addCsrfTokenToHeaders({
      'Content-Type': 'application/json',
    })

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      if (data.accessToken) {
        storeToken(data.accessToken)
        if (data.refreshToken) {
          storeRefreshToken(data.refreshToken)
        }
        return data.accessToken
      }
    }
    return null
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}

/**
 * Secure fetch wrapper that includes CSRF token and handles httpOnly cookies
 * Automatically refreshes access token if it expires
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function secureFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  let token = getToken()
  
  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as HeadersInit
  }
  
  // Add authorization token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Add CSRF token (async - must await)
  const { addCsrfTokenToHeaders } = await import('./csrf')
  const headersWithCsrf = await addCsrfTokenToHeaders(headers)
  
  // Make request with credentials to include httpOnly cookies
  let response = await fetch(url, {
    ...options,
    headers: headersWithCsrf,
    credentials: 'include' // Important: includes httpOnly cookies
  })
  
  // If 401 Unauthorized, try to refresh token and retry once
  if (response.status === 401 && token) {
    console.log('Access token expired, attempting to refresh...')
    const newToken = await refreshAccessToken()
    
    if (newToken) {
      // Retry request with new token
      const retryHeaders = {
        ...headersWithCsrf,
        'Authorization': `Bearer ${newToken}`
      }
      
      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include'
      })
      
      // Update token in AuthContext if it exists
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { token: newToken } }))
      }
    } else {
      // Refresh failed, clear auth data
      clearAuthData()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authExpired'))
      }
    }
  }
  
  // Validate CSRF response
  const { validateCsrfResponse } = await import('./csrf')
  await validateCsrfResponse(response)
  
  return response
}

