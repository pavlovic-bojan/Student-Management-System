import { api } from './client';

export interface Course {
  id: string;
  name: string;
  code: string;
  tenantId: string;
  programId?: string | null;
  professorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const coursesApi = {
  list: () => api.get<{ data: Course[] }>('/courses'),
  create: (data: { name: string; code: string; programId?: string }) =>
    api.post<{ data: Course }>('/courses', data),
};
