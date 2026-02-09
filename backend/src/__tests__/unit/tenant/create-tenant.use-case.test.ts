import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTenantUseCase } from '../../../modules/tenant/use-cases/create-tenant.use-case';
import { ITenantRepository } from '../../../modules/tenant/tenant.repository.interface';
import { ApiError } from '../../../middleware/errorHandler';

describe('CreateTenantUseCase', () => {
  let useCase: CreateTenantUseCase;
  let mockRepository: ITenantRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByCode: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };
    useCase = new CreateTenantUseCase(mockRepository);
  });

  it('should create tenant when code does not exist', async () => {
    vi.mocked(mockRepository.findByCode).mockResolvedValue(null);
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 'tid-1',
      name: 'School A',
      code: 'SCH-A',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({ name: 'School A', code: 'SCH-A' });

    expect(mockRepository.findByCode).toHaveBeenCalledWith('SCH-A');
    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'School A',
      code: 'SCH-A',
    });
    expect(result).toMatchObject({ id: 'tid-1', name: 'School A', code: 'SCH-A' });
  });

  it('should throw ApiError 409 when tenant code already exists', async () => {
    vi.mocked(mockRepository.findByCode).mockResolvedValue({
      id: 'tid-existing',
      name: 'Existing',
      code: 'SCH-A',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({ name: 'School A', code: 'SCH-A' }),
    ).rejects.toThrow(ApiError);

    await expect(
      useCase.execute({ name: 'School A', code: 'SCH-A' }),
    ).rejects.toMatchObject({ statusCode: 409, message: 'Tenant code already exists' });

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
