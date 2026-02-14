import { StudentModel } from './students.model';
import { CreateStudentDto, UpdateStudentDto, AddStudentToTenantDto } from './students.dto';
import { StudentListItem } from './students.model';

export interface IStudentsRepository {
  listByTenant(tenantId: string): Promise<StudentListItem[]>;
  createPersonAndEnrollment(
    tenantId: string,
    dto: CreateStudentDto,
  ): Promise<StudentListItem>;
  findEnrollmentById(enrollmentId: string): Promise<StudentListItem | null>;
  findEnrollmentByStudentAndTenant(
    studentId: string,
    tenantId: string,
  ): Promise<{ id: string; studentId: string; tenantId: string; indexNumber: string; programId: string | null } | null>;
  updatePerson(studentId: string, data: UpdateStudentDto): Promise<StudentModel>;
  addStudentToTenant(
    studentId: string,
    tenantId: string,
    dto: AddStudentToTenantDto,
  ): Promise<StudentListItem>;
  deleteEnrollment(enrollmentId: string): Promise<void>;
}
