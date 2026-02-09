export interface TuitionModel {
  id: string;
  tenantId: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentModel {
  id: string;
  tenantId: string;
  studentId: string;
  tuitionId: string;
  amount: number;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
