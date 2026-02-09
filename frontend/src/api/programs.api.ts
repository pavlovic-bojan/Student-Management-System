import { api } from './client';

export interface Program {
  id: string;
  name: string;
  code: string;
  tenantId: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const programsApi = {
  list: () => api.get<{ data: Program[] }>('/programs'),
  create: (data: { name: string; code: string }) =>
    api.post<{ data: Program }>('/programs', data),
};
