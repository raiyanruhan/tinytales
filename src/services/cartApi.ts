import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';
import { secureFetch } from '@utils/secureStorage';

const API_URL = getApiUrl();

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const response = await secureFetch(url, {
      ...options,
      method: options.method || 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    throw error;
  }
}

export async function getSavedCart(userId: string): Promise<CartItem[] | null> {
  return fetchWithAuth(`${API_URL}/users/${userId}/cart`).then(data => data.cart);
}

export async function saveCart(userId: string, cartItems: CartItem[]): Promise<CartItem[]> {
  return fetchWithAuth(`${API_URL}/users/${userId}/cart`, {
    method: 'POST',
    body: JSON.stringify({ cartItems }),
  }).then(data => data.cart);
}

// Alias exports for consistency with other files
export const saveCartToServer = saveCart;
export const loadCartFromServer = getSavedCart;
