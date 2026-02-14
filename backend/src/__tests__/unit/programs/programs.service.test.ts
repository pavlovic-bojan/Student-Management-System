import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgramsService } from '../../../modules/programs/programs.service.refactored';
import { IProgramsRepository } from '../../../modules/programs/programs.repository.interface';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let mockRepository: IProgramsRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new ProgramsService(mockRepository);
  });

  it('should list programs for tenant', async () => {
    const programs = [
      {
        id: 'p1',
        name: 'CS',
        code: 'CS',
        version: 1,
        isActive: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.list).mockResolvedValue(programs);

    const result = await service.listPrograms(tenantId);

    expect(mockRepository.list).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(programs);
  });

  it('should create program', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 'p1',
      name: 'Computer Science',
      code: 'CS',
      version: 1,
      isActive: true,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createProgram(tenantId, {
      name: 'Computer Science',
      code: 'CS',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(tenantId, {
      name: 'Computer Science',
      code: 'CS',
    });
    expect(result).toMatchObject({ name: 'Computer Science', code: 'CS' });
  });

  it('should update program', async () => {
    const updated = {
      id: 'p1',
      name: 'Computer Science Updated',
      code: 'CS',
      version: 1,
      isActive: true,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await service.updateProgram(tenantId, 'p1', {
      name: 'Computer Science Updated',
    });

    expect(mockRepository.update).toHaveBeenCalledWith(tenantId, 'p1', {
      name: 'Computer Science Updated',
    });
    expect(result).toEqual(updated);
  });

  it('should delete program', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

    await service.deleteProgram(tenantId, 'p1');

    expect(mockRepository.delete).toHaveBeenCalledWith(tenantId, 'p1');
  });
});
