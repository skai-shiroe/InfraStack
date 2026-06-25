import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number;
  category_id: number | null;
  supplier_id: number | null;
  created_at: string;
  updated_at: string | null;
  category?: Category;
  supplier?: Supplier;
}

export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: 'entry' | 'exit';
  quantity: number;
  reason: string | null;
  created_at: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  client_id: number | null;
  total: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  items: SaleItem[];
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  recent_registrations: number;
  total_products: number;
  total_stock: number;
  total_sales: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Auth API
export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<LoginResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// Users API
export const usersAPI = {
  list: (skip = 0, limit = 100) =>
    api.get<User[]>('/users/', { params: { skip, limit } }),
  get: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: { email: string; name: string; password: string }) =>
    api.post<User>('/users/', data),
  update: (id: number, data: { email?: string; name?: string }) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  notify: (id: number) => api.post(`/users/${id}/notify`),
};

// Dashboard API
export const dashboardAPI = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
};

// Stock API
export const stockAPI = {
  products: {
    list: (skip = 0, limit = 100) =>
      api.get<Product[]>('/stock/products', { params: { skip, limit } }),
    get: (id: number) => api.get<Product>(`/stock/products/${id}`),
    create: (data: { name: string; description?: string; quantity?: number; unit?: string; price?: number; category_id?: number; supplier_id?: number }) =>
      api.post<Product>('/stock/products', data),
    update: (id: number, data: Partial<Product>) =>
      api.put<Product>(`/stock/products/${id}`, data),
    delete: (id: number) => api.delete(`/stock/products/${id}`),
  },
  movements: {
    list: (productId?: number) =>
      api.get<StockMovement[]>('/stock/movements', { params: { product_id: productId } }),
    create: (data: { product_id: number; movement_type: 'entry' | 'exit'; quantity: number; reason?: string }) =>
      api.post<StockMovement>('/stock/movements', data),
  },
  categories: {
    list: () => api.get<Category[]>('/stock/categories'),
    get: (id: number) => api.get<Category>(`/stock/categories/${id}`),
    create: (data: { name: string; description?: string }) =>
      api.post<Category>('/stock/categories', data),
    update: (id: number, data: { name?: string; description?: string }) =>
      api.put<Category>(`/stock/categories/${id}`, data),
    delete: (id: number) => api.delete(`/stock/categories/${id}`),
  },
  suppliers: {
    list: () => api.get<Supplier[]>('/stock/suppliers'),
    get: (id: number) => api.get<Supplier>(`/stock/suppliers/${id}`),
    create: (data: { name: string; contact?: string; email?: string; phone?: string; address?: string }) =>
      api.post<Supplier>('/stock/suppliers', data),
    update: (id: number, data: Partial<Supplier>) =>
      api.put<Supplier>(`/stock/suppliers/${id}`, data),
    delete: (id: number) => api.delete(`/stock/suppliers/${id}`),
  },
  clients: {
    list: () => api.get<Client[]>('/stock/clients'),
    get: (id: number) => api.get<Client>(`/stock/clients/${id}`),
    create: (data: { name: string; email?: string; phone?: string; address?: string }) =>
      api.post<Client>('/stock/clients', data),
    update: (id: number, data: Partial<Client>) =>
      api.put<Client>(`/stock/clients/${id}`, data),
    delete: (id: number) => api.delete(`/stock/clients/${id}`),
  },
  sales: {
    list: () => api.get<Sale[]>('/stock/sales'),
    get: (id: number) => api.get<Sale>(`/stock/sales/${id}`),
    create: (data: { client_id?: number; payment_method?: string; notes?: string; items: { product_id: number; quantity: number; unit_price: number }[] }) =>
      api.post<Sale>('/stock/sales', data),
  },
};