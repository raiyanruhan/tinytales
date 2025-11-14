/**
 * Get the full image URL, handling both local and production environments
 * @param url - The image URL (can be relative or absolute)
 * @returns The full image URL
 */
export function getImageUrl(url: string): string {
  if (!url) return '';
  
  // If already a full URL, handle protocol conversion for HTTPS pages
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If page is loaded over HTTPS, convert HTTP URLs to HTTPS to avoid mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      // Convert http://localhost:3001 to https://api.tinytalesearth.com for production
      if (url.includes('localhost:3001')) {
        return url.replace('http://localhost:3001', 'https://api.tinytalesearth.com');
      }
      // For other HTTP URLs, convert to HTTPS
      return url.replace('http://', 'https://');
    }
    return url;
  }

  // Get API base URL from environment variable
  let apiUrl = import.meta.env.VITE_API_URL;
  
  // If no env var, default to production API
  if (!apiUrl) {
    apiUrl = 'https://api.tinytalesearth.com/api';
  }
  
  // Remove /api suffix if present to get base URL
  const baseUrl = apiUrl.replace('/api', '');
  
  // Ensure url starts with /
  const path = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${path}`;
}

