import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add tenant/auth headers from store when available (e.g. after login)
api.interceptors.request.use((config) => {
  const tenantId = sessionStorage.getItem('x-tenant-id');
  const token = sessionStorage.getItem('token');
  if (tenantId) config.headers.set('x-tenant-id', tenantId);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});
