/**
 * Get a user-friendly network error message
 */
export function getNetworkErrorMessage(): string {
  const isProduction = import.meta.env.PROD || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  
  if (isProduction) {
    return 'Network error: Unable to connect to server. Please check your internet connection and try again.';
  }
  
  return 'Network error: Unable to connect to server. Please make sure the backend server is running.';
}
