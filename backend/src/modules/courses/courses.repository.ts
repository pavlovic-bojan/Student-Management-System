import { PrismaClient } from '@prisma/client';
import { ICoursesRepository } from './courses.repository.interface';
import { CourseModel } from './courses.model';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';

export class CoursesRepository implements ICoursesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tenantId: string, data: CreateCourseDto): Promise<CourseModel> {
    return this.prisma.course.create({
      data: { ...data, tenantId },
    });
  }

  async findById(tenantId: string, id: string): Promise<CourseModel | null> {
    return this.prisma.course.findFirst({
      where: { id, tenantId },
    });
  }

  async list(tenantId: string): Promise<CourseModel[]> {
    return this.prisma.course.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async update(tenantId: string, id: string, data: UpdateCourseDto): Promise<CourseModel> {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }
}
