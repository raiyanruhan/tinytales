import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - Additional DOMPurify options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string, options?: DOMPurify.Config): string {
  if (!dirty) return ''
  
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ...options
  }
  
  return DOMPurify.sanitize(dirty, defaultConfig)
}

/**
 * Sanitize plain text input (removes all HTML)
 * @param input - User input string
 * @returns Sanitized plain text
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  // Remove all HTML tags
  const textOnly = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
  
  // Additional safety: escape special characters
  return textOnly
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize URL to prevent XSS and malicious redirects
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  try {
    const parsed = new URL(url)
    
    // Only allow http, https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    // Additional validation: check for javascript: or data: in href
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('javascript:') || lowerUrl.includes('data:') || lowerUrl.includes('vbscript:')) {
      return ''
    }
    
    return parsed.toString()
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Sanitize user input for display in React (text content)
 * @param input - User input
 * @returns Safe text for React textContent
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return ''
  
  // For React, we typically don't need to escape when using textContent
  // But we'll sanitize to be safe
  return sanitizeText(input)
}

/**
 * Sanitize object values recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map((item: any) => 
          typeof item === 'string' ? sanitizeText(item) : item
        ) as any
      } else {
        sanitized[key] = sanitizeObject(sanitized[key]) as any
      }
    }
  }
  
  return sanitized
}

