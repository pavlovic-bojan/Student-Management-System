import { PrismaClient } from '@prisma/client';
import { IFinanceRepository } from './finance.repository.interface';
import { TuitionModel, PaymentModel } from './finance.model';
import { CreateTuitionDto, CreatePaymentDto } from './finance.dto';

export class FinanceRepository implements IFinanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTuition(tenantId: string, data: CreateTuitionDto): Promise<TuitionModel> {
    const row = await this.prisma.tuition.create({
      data: {
        ...data,
        amount: data.amount,
        tenantId,
      },
    });
    return { ...row, amount: Number(row.amount) };
  }

  async listTuitions(tenantId: string): Promise<TuitionModel[]> {
    const rows = await this.prisma.tuition.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
  }

  async createPayment(tenantId: string, data: CreatePaymentDto): Promise<PaymentModel> {
    const row = await this.prisma.payment.create({
      data: {
        ...data,
        amount: data.amount,
        paidAt: new Date(data.paidAt),
        tenantId,
      },
    });
    return { ...row, amount: Number(row.amount) };
  }

  async listPayments(tenantId: string): Promise<PaymentModel[]> {
    const rows = await this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { paidAt: 'desc' },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
  }
}
