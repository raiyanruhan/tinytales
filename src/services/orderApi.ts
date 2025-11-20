import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';
import { secureFetch } from '@utils/secureStorage';

const API_URL = getApiUrl();

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  streetAddress: string;
  country: string;
  regionState: string;
  cityArea: string;
  zipPostalCode: string;
  sameAddress?: boolean;
  deliveryInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  userId?: string;
  items: OrderItem[];
  shipping: {
    method: string;
    cost: number;
  };
  payment: {
    method: string;
  };
  address: OrderAddress;
  status: string;
  adminStatus?: string;
  shipperName?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export interface LocationData {
  districts: {
    [districtName: string]: string[];
  };
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const response = await secureFetch(url, {
      ...options,
      method: options.method || 'GET',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Request failed with status ${response.status}` };
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    // Re-throw the error with its message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}

export async function createOrder(orderData: {
  email: string;
  userId?: string;
  items: OrderItem[];
  shipping: { method: string; cost: number };
  payment: { method: string };
  address: OrderAddress;
}): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData),
  }).then(data => data.order);
}

export async function getOrders(): Promise<Order[]> {
  return fetchWithAuth(`${API_URL}/orders`).then(data => data.orders);
}

export async function getOrder(id: string): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders/${id}`).then(data => data.order);
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  return fetchWithAuth(`${API_URL}/orders/email/${encodeURIComponent(email)}`).then(data => data.orders);
}

export async function updateOrderStatus(
  id: string,
  status: string,
  adminStatus?: string,
  shipperName?: string
): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminStatus, shipperName }),
  }).then(data => data.order);
}

export async function approveOrder(id: string): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders/${id}/approve`, {
    method: 'PUT',
  }).then(data => data.order);
}

export async function refuseOrder(id: string, reason?: string): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders/${id}/refuse`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }).then(data => data.order);
}

export async function cancelOrder(id: string, reason?: string, userEmail?: string): Promise<Order> {
  return fetchWithAuth(`${API_URL}/orders/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason, email: userEmail }),
  }).then(data => data.order);
}

export async function getLocations(): Promise<LocationData> {
  try {
    const response = await fetch(`${API_URL}/locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    throw error;
  }
}

