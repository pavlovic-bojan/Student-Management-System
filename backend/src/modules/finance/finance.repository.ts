import { PrismaClient } from '@prisma/client';
import { IFinanceRepository } from './finance.repository.interface';
import { TuitionModel, PaymentModel } from './finance.model';
import { CreateTuitionDto, CreatePaymentDto } from './finance.dto';

export class FinanceRepository implements IFinanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTuition(tenantId: string, data: CreateTuitionDto): Promise<TuitionModel> {
    return this.prisma.tuition.create({
      data: {
        ...data,
        amount: data.amount,
        tenantId,
      },
    });
  }

  async listTuitions(tenantId: string): Promise<TuitionModel[]> {
    return this.prisma.tuition.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createPayment(tenantId: string, data: CreatePaymentDto): Promise<PaymentModel> {
    return this.prisma.payment.create({
      data: {
        ...data,
        amount: data.amount,
        paidAt: new Date(data.paidAt),
        tenantId,
      },
    });
  }

  async listPayments(tenantId: string): Promise<PaymentModel[]> {
    return this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { paidAt: 'desc' },
    });
  }
}
