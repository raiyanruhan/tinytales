const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers as HeadersInit,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please make sure the backend server is running on http://localhost:3001');
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
