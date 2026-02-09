import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentsService } from '../../../../modules/students/students.service.refactored';
import { IStudentsRepository } from '../../../../modules/students/students.repository.interface';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockRepository: IStudentsRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };
    service = new StudentsService(mockRepository);
  });

  it('should list students for tenant', async () => {
    const students = [
      {
        id: 's1',
        indexNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
        status: 'ACTIVE' as const,
        tenantId,
        programId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.list).mockResolvedValue(students);

    const result = await service.listStudents(tenantId);

    expect(mockRepository.list).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(students);
  });

  it('should create student via use case', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue([]);
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 's1',
      indexNumber: '2024-001',
      firstName: 'Jane',
      lastName: 'Doe',
      status: 'ACTIVE',
      tenantId,
      programId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createStudent(tenantId, {
      indexNumber: '2024-001',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(tenantId, {
      indexNumber: '2024-001',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(result).toMatchObject({
      indexNumber: '2024-001',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });
});
