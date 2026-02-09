import { PrismaClient } from '@prisma/client';
import { IStudentsRepository } from './students.repository.interface';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';
import { StudentModel } from './students.model';
import { ApiError } from '../../middleware/errorHandler';

export class StudentsRepository implements IStudentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tenantId: string, data: CreateStudentDto): Promise<StudentModel> {
    return this.prisma.student.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<StudentModel | null> {
    return this.prisma.student.findFirst({
      where: { id, tenantId },
    });
  }

  async list(tenantId: string): Promise<StudentModel[]> {
    return this.prisma.student.findMany({
      where: { tenantId },
      orderBy: { lastName: 'asc' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: UpdateStudentDto,
  ): Promise<StudentModel> {
    const existing = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new ApiError('Student not found', 404);
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }
}

