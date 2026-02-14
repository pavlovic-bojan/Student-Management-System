import { PrismaClient } from '@prisma/client';
import { ICoursesRepository } from './courses.repository.interface';
import { CourseModel } from './courses.model';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';
import { ApiError } from '../../middleware/errorHandler';

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
    const existing = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new ApiError('Course not found', 404);
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new ApiError('Course not found', 404);
    await this.prisma.course.delete({
      where: { id },
    });
  }
}
