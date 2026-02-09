import { api } from './client';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const tenantsApi = {
  list: () => api.get<{ data: Tenant[] }>('/tenants'),
  create: (data: { name: string; code: string }) =>
    api.post<{ data: Tenant }>('/tenants', data),
};
