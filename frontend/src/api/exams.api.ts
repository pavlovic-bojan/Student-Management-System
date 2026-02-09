import { api } from './client';

export interface ExamPeriod {
  id: string;
  name: string;
  term: string;
  year: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamTerm {
  id: string;
  examPeriodId: string;
  courseOfferingId: string;
  date: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export const examsApi = {
  listPeriods: () => api.get<{ data: ExamPeriod[] }>('/exams/periods'),
  createPeriod: (data: { name: string; term: string; year: number }) =>
    api.post<{ data: ExamPeriod }>('/exams/periods', data),
  listTerms: () => api.get<{ data: ExamTerm[] }>('/exams/terms'),
  createTerm: (data: {
    examPeriodId: string;
    courseOfferingId: string;
    date: string;
  }) => api.post<{ data: ExamTerm }>('/exams/terms', data),
};
