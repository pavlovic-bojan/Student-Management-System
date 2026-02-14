import { PrismaClient } from '@prisma/client';
import { IStudentsRepository } from './students.repository.interface';
import { CreateStudentDto, UpdateStudentDto, AddStudentToTenantDto } from './students.dto';
import { StudentModel, StudentListItem } from './students.model';
import { ApiError } from '../../middleware/errorHandler';

export class StudentsRepository implements IStudentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByTenant(tenantId: string): Promise<StudentListItem[]> {
    const rows = await this.prisma.studentTenant.findMany({
      where: { tenantId },
      include: {
        student: true,
        tenant: { select: { name: true } },
      },
      orderBy: { student: { lastName: 'asc' } },
    });
    return rows.map((r) => ({
      enrollmentId: r.id,
      studentId: r.studentId,
      tenantId: r.tenantId,
      indexNumber: r.indexNumber,
      firstName: r.student.firstName,
      lastName: r.student.lastName,
      status: r.student.status,
      tenantName: r.tenant.name,
      programId: r.programId,
    }));
  }

  async createPersonAndEnrollment(
    tenantId: string,
    dto: CreateStudentDto,
  ): Promise<StudentListItem> {
    const student = await this.prisma.student.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    const enrollment = await this.prisma.studentTenant.create({
      data: {
        studentId: student.id,
        tenantId,
        indexNumber: dto.indexNumber,
        programId: dto.programId ?? null,
      },
      include: {
        student: true,
        tenant: { select: { name: true } },
      },
    });
    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      tenantId: enrollment.tenantId,
      indexNumber: enrollment.indexNumber,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      status: enrollment.student.status,
      tenantName: enrollment.tenant.name,
      programId: enrollment.programId,
    };
  }

  async findEnrollmentById(enrollmentId: string): Promise<StudentListItem | null> {
    const r = await this.prisma.studentTenant.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        tenant: { select: { name: true } },
      },
    });
    if (!r) return null;
    return {
      enrollmentId: r.id,
      studentId: r.studentId,
      tenantId: r.tenantId,
      indexNumber: r.indexNumber,
      firstName: r.student.firstName,
      lastName: r.student.lastName,
      status: r.student.status,
      tenantName: r.tenant.name,
      programId: r.programId,
    };
  }

  async findEnrollmentByStudentAndTenant(
    studentId: string,
    tenantId: string,
  ): Promise<{ id: string; studentId: string; tenantId: string; indexNumber: string; programId: string | null } | null> {
    const r = await this.prisma.studentTenant.findFirst({
      where: { studentId, tenantId },
    });
    return r;
  }

  async updatePerson(studentId: string, data: UpdateStudentDto): Promise<StudentModel> {
    const existing = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!existing) throw new ApiError('Student not found', 404);
    return this.prisma.student.update({
      where: { id: studentId },
      data,
    });
  }

  async addStudentToTenant(
    studentId: string,
    tenantId: string,
    dto: AddStudentToTenantDto,
  ): Promise<StudentListItem> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new ApiError('Student not found', 404);
    const enrollment = await this.prisma.studentTenant.create({
      data: {
        studentId,
        tenantId,
        indexNumber: dto.indexNumber,
        programId: dto.programId ?? null,
      },
      include: {
        student: true,
        tenant: { select: { name: true } },
      },
    });
    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      tenantId: enrollment.tenantId,
      indexNumber: enrollment.indexNumber,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      status: enrollment.student.status,
      tenantName: enrollment.tenant.name,
      programId: enrollment.programId,
    };
  }

  async deleteEnrollment(enrollmentId: string): Promise<void> {
    const existing = await this.prisma.studentTenant.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) throw new ApiError('Enrollment not found', 404);
    await this.prisma.studentTenant.delete({
      where: { id: enrollmentId },
    });
  }
}
