import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentsService } from '../../../modules/students/students.service.refactored';
import { IStudentsRepository } from '../../../modules/students/students.repository.interface';
import { ApiError } from '../../../middleware/errorHandler';

describe('StudentsService.createStudent', () => {
  let service: StudentsService;
  let mockRepository: IStudentsRepository;
  const tenantId = 'tenant-1';

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

  it('should create student when index number is unique in tenant', async () => {
    vi.mocked(mockRepository.listByTenant).mockResolvedValue([]);
    vi.mocked(mockRepository.createPersonAndEnrollment).mockResolvedValue({
      enrollmentId: 'e1',
      studentId: 's1',
      tenantId,
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
      status: 'ACTIVE',
      tenantName: 'School A',
      programId: null,
    });

    const result = await service.createStudent(tenantId, {
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(mockRepository.listByTenant).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.createPersonAndEnrollment).toHaveBeenCalledWith(tenantId, {
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result).toMatchObject({
      indexNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
      enrollmentId: 'e1',
      studentId: 's1',
    });
  });

  it('should throw ApiError 409 when index number already exists in institution', async () => {
    vi.mocked(mockRepository.listByTenant).mockResolvedValue([
      {
        enrollmentId: 'e0',
        studentId: 's0',
        tenantId,
        indexNumber: '2024-001',
        firstName: 'Existing',
        lastName: 'Student',
        status: 'ACTIVE',
        tenantName: 'School A',
        programId: null,
      },
    ]);

    await expect(
      service.createStudent(tenantId, {
        indexNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toThrow(ApiError);

    await expect(
      service.createStudent(tenantId, {
        indexNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Student index already exists in this institution',
    });

    expect(mockRepository.createPersonAndEnrollment).not.toHaveBeenCalled();
  });
});
