import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoursesService } from '../../../../modules/courses/courses.service.refactored';
import { ICoursesRepository } from '../../../../modules/courses/courses.repository.interface';

describe('CoursesService', () => {
  let service: CoursesService;
  let mockRepository: ICoursesRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };
    service = new CoursesService(mockRepository);
  });

  it('should list courses for tenant', async () => {
    const courses = [
      {
        id: 'c1',
        name: 'Math',
        code: 'MATH',
        tenantId,
        programId: null,
        professorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.list).mockResolvedValue(courses);

    const result = await service.listCourses(tenantId);

    expect(mockRepository.list).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(courses);
  });

  it('should create course', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 'c1',
      name: 'Physics',
      code: 'PHYS',
      tenantId,
      programId: null,
      professorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createCourse(tenantId, {
      name: 'Physics',
      code: 'PHYS',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(tenantId, {
      name: 'Physics',
      code: 'PHYS',
    });
    expect(result).toMatchObject({ name: 'Physics', code: 'PHYS' });
  });

  it('should get course by id', async () => {
    const course = {
      id: 'c1',
      name: 'Math',
      code: 'MATH',
      tenantId,
      programId: null,
      professorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(course);

    const result = await service.getCourseById(tenantId, 'c1');

    expect(mockRepository.findById).toHaveBeenCalledWith(tenantId, 'c1');
    expect(result).toEqual(course);
  });
});
