import { prisma } from '../../prisma/client';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service.refactored';

export function createFinanceService(): FinanceService {
  return new FinanceService(new FinanceRepository(prisma));
}
