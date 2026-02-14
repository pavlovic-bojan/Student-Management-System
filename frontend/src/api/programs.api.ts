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

export interface UpdateProgramRequest {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export const programsApi = {
  list: () => api.get<{ data: Program[] }>('/programs'),
  create: (data: { name: string; code: string }) =>
    api.post<{ data: Program }>('/programs', data),
  update: (id: string, data: UpdateProgramRequest) =>
    api.patch<{ data: Program }>(`/programs/${id}`, data),
  delete: (id: string) => api.delete(`/programs/${id}`),
};
