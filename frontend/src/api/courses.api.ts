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

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  programId?: string | null;
  professorId?: string | null;
}

export const coursesApi = {
  list: () => api.get<{ data: Course[] }>('/courses'),
  create: (data: { name: string; code: string; programId?: string }) =>
    api.post<{ data: Course }>('/courses', data),
  update: (id: string, data: UpdateCourseRequest) =>
    api.patch<{ data: Course }>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};
