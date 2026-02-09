import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamsService } from '../../../../modules/exams/exams.service.refactored';
import { IExamsRepository } from '../../../../modules/exams/exams.repository.interface';

describe('ExamsService', () => {
  let service: ExamsService;
  let mockRepository: IExamsRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      createPeriod: vi.fn(),
      listPeriods: vi.fn(),
      createTerm: vi.fn(),
      listTerms: vi.fn(),
    };
    service = new ExamsService(mockRepository);
  });

  it('should list exam periods for tenant', async () => {
    const periods = [
      {
        id: 'ep1',
        name: 'Jan 2025',
        term: 'WINTER',
        year: 2025,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.listPeriods).mockResolvedValue(periods);

    const result = await service.listExamPeriods(tenantId);

    expect(mockRepository.listPeriods).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(periods);
  });

  it('should create exam period', async () => {
    vi.mocked(mockRepository.createPeriod).mockResolvedValue({
      id: 'ep1',
      name: 'Jan 2025',
      term: 'WINTER',
      year: 2025,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createExamPeriod(tenantId, {
      name: 'Jan 2025',
      term: 'WINTER',
      year: 2025,
    });

    expect(mockRepository.createPeriod).toHaveBeenCalledWith(tenantId, {
      name: 'Jan 2025',
      term: 'WINTER',
      year: 2025,
    });
    expect(result).toMatchObject({ name: 'Jan 2025', term: 'WINTER', year: 2025 });
  });

  it('should list exam terms for tenant', async () => {
    const terms = [
      {
        id: 'et1',
        examPeriodId: 'ep1',
        courseOfferingId: 'co1',
        date: new Date(),
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.listTerms).mockResolvedValue(terms);

    const result = await service.listExamTerms(tenantId);

    expect(mockRepository.listTerms).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(terms);
  });
});
