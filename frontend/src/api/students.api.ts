import { api } from './client';

/** List row: one enrollment (student-in-tenant). */
export interface StudentListItem {
  enrollmentId: string;
  studentId: string;
  tenantId: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  tenantName: string;
  programId: string | null;
}

export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  status?: StudentStatus;
}

export const studentsApi = {
  list: (tenantId?: string) =>
    api.get<{ data: StudentListItem[] }>('/students', tenantId ? { params: { tenantId } } : undefined),
  create: (data: {
    indexNumber: string;
    firstName: string;
    lastName: string;
    programId?: string;
    tenantId?: string;
  }) => api.post<{ data: StudentListItem }>('/students', data),
  update: (studentId: string, data: UpdateStudentRequest) =>
    api.patch<{ data: { id: string; firstName: string; lastName: string; status: string } }>(`/students/${studentId}`, data),
  deleteEnrollment: (enrollmentId: string) =>
    api.delete(`/students/enrollments/${enrollmentId}`),
};
