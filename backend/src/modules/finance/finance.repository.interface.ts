import { TuitionModel, PaymentModel } from './finance.model';
import { CreateTuitionDto, CreatePaymentDto } from './finance.dto';

export interface IFinanceRepository {
  createTuition(tenantId: string, data: CreateTuitionDto): Promise<TuitionModel>;
  listTuitions(tenantId: string): Promise<TuitionModel[]>;
  createPayment(tenantId: string, data: CreatePaymentDto): Promise<PaymentModel>;
  listPayments(tenantId: string): Promise<PaymentModel[]>;
}
