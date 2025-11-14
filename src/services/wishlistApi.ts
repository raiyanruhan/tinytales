import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';

const API_URL = getApiUrl();

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  console.log('fetchWithAuth - Token exists:', !!token);
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers as HeadersInit,
  };

  console.log('Making request to:', url, 'with method:', options.method || 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error('Wishlist API error:', error, 'Status:', response.status);
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    console.error('Wishlist API fetch error:', error);
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
  console.log('Add to wishlist response:', response);
  const wishlist = response.wishlist || [];
  console.log('Wishlist array:', wishlist, 'Contains productId?', wishlist.includes(productId));
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

