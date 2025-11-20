import { Category } from '@data/products';
import { getNetworkErrorMessage } from '@utils/apiError';
import { getApiUrl } from '@utils/apiUrl';

const API_URL = getApiUrl();

export interface ProductColor {
  name: string;
  images: string[];
}

export interface ImagePosition {
  x: number; // Percentage: 0-100
  y: number; // Percentage: 0-100
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  order?: number;
  badges?: string[];
  image: string;
  imagePosition?: ImagePosition;
  createdAt?: string;
  updatedAt?: string;
}

import { secureFetch } from '@utils/secureStorage';

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

async function fetchFormData(url: string, formData: FormData) {
  const { getToken } = await import('@utils/secureStorage');
  const { addCsrfTokenToHeaders } = await import('@utils/csrf');
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const headersWithCsrf = await addCsrfTokenToHeaders(headers);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headersWithCsrf,
      body: formData,
      credentials: 'include', // Include httpOnly cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(getNetworkErrorMessage());
    }
    throw error;
  }
}

export async function getProducts(): Promise<Product[]> {
  return fetchWithAuth(`${API_URL}/products`);
}

export async function getProduct(id: string): Promise<Product> {
  return fetchWithAuth(`${API_URL}/products/${id}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });
}

export async function reorderProducts(products: Array<{ id: string; order: number }>): Promise<Product[]> {
  const result = await fetchWithAuth(`${API_URL}/products/reorder`, {
    method: 'POST',
    body: JSON.stringify({ products }),
  });
  return result.products;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const result = await fetchFormData(`${API_URL}/upload`, formData);
  return result.files;
}


