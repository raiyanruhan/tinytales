import { Category } from '@data/products';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ProductColor {
  name: string;
  images: string[];
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
  createdAt?: string;
  updatedAt?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
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

async function fetchFormData(url: string, formData: FormData) {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please make sure the backend server is running on http://localhost:3001');
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


