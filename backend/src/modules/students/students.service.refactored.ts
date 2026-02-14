import { IStudentsRepository } from './students.repository.interface';
import { CreateStudentDto, UpdateStudentDto, AddStudentToTenantDto } from './students.dto';
import { StudentModel, StudentListItem } from './students.model';
import { ApiError } from '../../middleware/errorHandler';

export class StudentsService {
  constructor(private readonly repository: IStudentsRepository) {}

  async listStudents(tenantId: string): Promise<StudentListItem[]> {
    return this.repository.listByTenant(tenantId);
  }

  async createStudent(
    tenantId: string,
    dto: CreateStudentDto,
  ): Promise<StudentListItem> {
    const existing = await this.repository.listByTenant(tenantId);
    const duplicate = existing.find((s) => s.indexNumber === dto.indexNumber);
    if (duplicate) {
      throw new ApiError('Student index already exists in this institution', 409);
    }
    return this.repository.createPersonAndEnrollment(tenantId, dto);
  }

  async updateStudent(
    studentId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentModel> {
    return this.repository.updatePerson(studentId, dto);
  }

  async addStudentToTenant(
    studentId: string,
    tenantId: string,
    dto: AddStudentToTenantDto,
  ): Promise<StudentListItem> {
    const existing = await this.repository.findEnrollmentByStudentAndTenant(
      studentId,
      tenantId,
    );
    if (existing) {
      throw new ApiError(
        'Student is already enrolled in this institution',
        409,
      );
    }
    const list = await this.repository.listByTenant(tenantId);
    const duplicateIndex = list.find((s) => s.indexNumber === dto.indexNumber);
    if (duplicateIndex) {
      throw new ApiError('Index number already exists in this institution', 409);
    }
    return this.repository.addStudentToTenant(studentId, tenantId, dto);
  }

  async deleteEnrollment(enrollmentId: string): Promise<void> {
    return this.repository.deleteEnrollment(enrollmentId);
  }
}
