import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';
import { secureFetch } from '@utils/secureStorage';

const API_URL = getApiUrl();

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { getToken } = await import('@utils/secureStorage');
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Use secure fetch which includes CSRF token and httpOnly cookie support
  try {
    const response = await secureFetch(url, {
      ...options,
      method: options.method || 'GET',
      body: options.body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    throw error;
  }
}

export async function getWishlist(userId: string): Promise<string[]> {
  return fetchWithAuth(`${API_URL}/users/${userId}/wishlist`).then(data => data.wishlist || []);
}

export async function addToWishlist(userId: string, productId: string): Promise<string[]> {
  const response = await fetchWithAuth(`${API_URL}/users/${userId}/wishlist`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  const wishlist = response.wishlist || [];
  if (!Array.isArray(wishlist)) {
    throw new Error('Invalid wishlist response from server');
  }
  return wishlist;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<string[]> {
  return fetchWithAuth(`${API_URL}/users/${userId}/wishlist/${productId}`, {
    method: 'DELETE',
  }).then(data => data.wishlist || []);
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  return fetchWithAuth(`${API_URL}/users/${userId}/wishlist/${productId}`).then(data => data.inWishlist || false);
}
