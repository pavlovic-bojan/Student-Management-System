export interface CreateTuitionDto {
  name: string;
  amount: number;
}

export interface CreatePaymentDto {
  studentId: string;
  tuitionId: string;
  amount: number;
  paidAt: string; // ISO date
}
