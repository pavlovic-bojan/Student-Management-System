import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentsService } from '../../../modules/students/students.service.refactored';
import { IStudentsRepository } from '../../../modules/students/students.repository.interface';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockRepository: IStudentsRepository;
  const tenantId = 'tenant-1';

  const listItem = {
    enrollmentId: 'e1',
    studentId: 's1',
    tenantId,
    indexNumber: '2024-001',
    firstName: 'John',
    lastName: 'Doe',
    status: 'ACTIVE',
    tenantName: 'School A',
    programId: null as string | null,
  };

  beforeEach(() => {
    mockRepository = {
      listByTenant: vi.fn(),
      createPersonAndEnrollment: vi.fn(),
      findEnrollmentById: vi.fn(),
      findEnrollmentByStudentAndTenant: vi.fn(),
      updatePerson: vi.fn(),
      addStudentToTenant: vi.fn(),
      deleteEnrollment: vi.fn(),
    };
    service = new StudentsService(mockRepository);
  });

  it('should list students for tenant', async () => {
    vi.mocked(mockRepository.listByTenant).mockResolvedValue([listItem]);

    const result = await service.listStudents(tenantId);

    expect(mockRepository.listByTenant).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual([listItem]);
  });

  it('should create student', async () => {
    vi.mocked(mockRepository.listByTenant).mockResolvedValue([]);
    vi.mocked(mockRepository.createPersonAndEnrollment).mockResolvedValue({
      ...listItem,
      firstName: 'Jane',
      lastName: 'Doe',
    });

    const result = await service.createStudent(tenantId, {
      indexNumber: '2024-001',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    expect(mockRepository.listByTenant).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.createPersonAndEnrollment).toHaveBeenCalledWith(tenantId, {
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

  it('should update student', async () => {
    const updated = {
      id: 's1',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'ACTIVE' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.updatePerson).mockResolvedValue(updated);

    const result = await service.updateStudent('s1', {
      firstName: 'Jane',
      lastName: 'Smith',
    });

    expect(mockRepository.updatePerson).toHaveBeenCalledWith('s1', {
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(result).toEqual(updated);
  });

  it('should delete enrollment', async () => {
    vi.mocked(mockRepository.deleteEnrollment).mockResolvedValue(undefined);

    await service.deleteEnrollment('e1');

    expect(mockRepository.deleteEnrollment).toHaveBeenCalledWith('e1');
  });
});
