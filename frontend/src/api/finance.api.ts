import { api } from './client';

export interface Tuition {
  id: string;
  tenantId: string;
  name: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  studentId: string;
  tuitionId: string;
  amount: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export const financeApi = {
  listTuitions: () => api.get<{ data: Tuition[] }>('/finance/tuitions'),
  createTuition: (data: { name: string; amount: number }) =>
    api.post<{ data: Tuition }>('/finance/tuitions', data),
  listPayments: () => api.get<{ data: Payment[] }>('/finance/payments'),
  createPayment: (data: {
    studentId: string;
    tuitionId: string;
    amount: number;
    paidAt: string;
  }) => api.post<{ data: Payment }>('/finance/payments', data),
};
