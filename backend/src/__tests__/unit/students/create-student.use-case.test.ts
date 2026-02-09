import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStudentUseCase } from '../../../modules/students/use-cases/create-student.use-case';
import { IStudentsRepository } from '../../../modules/students/students.repository.interface';
import { ApiError } from '../../../middleware/errorHandler';

describe('CreateStudentUseCase', () => {
  let useCase: CreateStudentUseCase;
  let mockRepository: IStudentsRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };
    useCase = new CreateStudentUseCase(mockRepository);
  });

  it('should create student when index number is unique in tenant', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue([]);
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 's1',
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
      status: 'ACTIVE',
      tenantId,
      programId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(tenantId, {
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(mockRepository.list).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.create).toHaveBeenCalledWith(tenantId, {
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result).toMatchObject({
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should throw ApiError 409 when index number already exists in tenant', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue([
      {
        id: 's0',
        indexNumber: '2024-001',
        firstName: 'Existing',
        lastName: 'Student',
        status: 'ACTIVE',
        tenantId,
        programId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute(tenantId, {
        indexNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toThrow(ApiError);

    await expect(
      useCase.execute(tenantId, {
        indexNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Student index already exists',
    });

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
