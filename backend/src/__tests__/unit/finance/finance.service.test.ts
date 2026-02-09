import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceService } from '../../../modules/finance/finance.service.refactored';
import { IFinanceRepository } from '../../../modules/finance/finance.repository.interface';

describe('FinanceService', () => {
  let service: FinanceService;
  let mockRepository: IFinanceRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      createTuition: vi.fn(),
      listTuitions: vi.fn(),
      createPayment: vi.fn(),
      listPayments: vi.fn(),
    };
    service = new FinanceService(mockRepository);
  });

  it('should list tuitions for tenant', async () => {
    const tuitions = [
      {
        id: 't1',
        tenantId,
        name: 'Tuition 2025',
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.listTuitions).mockResolvedValue(tuitions);

    const result = await service.listTuitions(tenantId);

    expect(mockRepository.listTuitions).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(tuitions);
  });

  it('should create tuition', async () => {
    vi.mocked(mockRepository.createTuition).mockResolvedValue({
      id: 't1',
      tenantId,
      name: 'Tuition 2025',
      amount: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createTuition(tenantId, {
      name: 'Tuition 2025',
      amount: 1000,
    });

    expect(mockRepository.createTuition).toHaveBeenCalledWith(tenantId, {
      name: 'Tuition 2025',
      amount: 1000,
    });
    expect(result).toMatchObject({ name: 'Tuition 2025', amount: 1000 });
  });

  it('should list payments for tenant', async () => {
    const payments = [
      {
        id: 'p1',
        tenantId,
        studentId: 's1',
        tuitionId: 't1',
        amount: 500,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.listPayments).mockResolvedValue(payments);

    const result = await service.listPayments(tenantId);

    expect(mockRepository.listPayments).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(payments);
  });

  it('should create payment', async () => {
    vi.mocked(mockRepository.createPayment).mockResolvedValue({
      id: 'p1',
      tenantId,
      studentId: 's1',
      tuitionId: 't1',
      amount: 500,
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createPayment(tenantId, {
      studentId: 's1',
      tuitionId: 't1',
      amount: 500,
      paidAt: '2025-01-15T10:00:00Z',
    });

    expect(mockRepository.createPayment).toHaveBeenCalledWith(tenantId, {
      studentId: 's1',
      tuitionId: 't1',
      amount: 500,
      paidAt: '2025-01-15T10:00:00Z',
    });
    expect(result).toMatchObject({ studentId: 's1', amount: 500 });
  });
});
