import { api } from './client';

export interface Student {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  tenantId: string;
  programId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const studentsApi = {
  list: () => api.get<{ data: Student[] }>('/students'),
  create: (data: {
    indexNumber: string;
    firstName: string;
    lastName: string;
    programId?: string;
  }) => api.post<{ data: Student }>('/students', data),
};
