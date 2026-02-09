import { api } from './client';

export const healthApi = {
  check: () => api.get<{ status: string }>('/health'),
};
