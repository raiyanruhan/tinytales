/**
 * Get the API URL, handling both local and production environments
 * Defaults to production API, can be overridden with VITE_API_URL environment variable
 */
export function getApiUrl(): string {
  // Check if environment variable is set (takes priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to production API
  // To use local backend, set VITE_API_URL=http://localhost:3001/api in .env
  return 'https://api.tinytalesearth.com/api';
}

