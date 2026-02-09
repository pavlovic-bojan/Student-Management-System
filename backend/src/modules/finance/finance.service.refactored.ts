import { IFinanceRepository } from './finance.repository.interface';
import { TuitionModel, PaymentModel } from './finance.model';
import { CreateTuitionDto, CreatePaymentDto } from './finance.dto';

export class FinanceService {
  constructor(private readonly repository: IFinanceRepository) {}

  async createTuition(tenantId: string, dto: CreateTuitionDto): Promise<TuitionModel> {
    return this.repository.createTuition(tenantId, dto);
  }

  async listTuitions(tenantId: string): Promise<TuitionModel[]> {
    return this.repository.listTuitions(tenantId);
  }

  async createPayment(tenantId: string, dto: CreatePaymentDto): Promise<PaymentModel> {
    return this.repository.createPayment(tenantId, dto);
  }

  async listPayments(tenantId: string): Promise<PaymentModel[]> {
    return this.repository.listPayments(tenantId);
  }
}
