import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add tenant/auth headers: JWT from localStorage (Park-style), tenant from user
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user?.tenantId) config.headers.set('x-tenant-id', user.tenantId);
    } catch {
      // ignore
    }
  }
  return config;
});

// On 401 Unauthorized: clear auth and redirect to login (Park-style)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth/login') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(err);
  }
);
