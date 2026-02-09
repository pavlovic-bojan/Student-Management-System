import { StudentModel } from './students.model';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';

export interface IStudentsRepository {
  create(tenantId: string, data: CreateStudentDto): Promise<StudentModel>;
  findById(tenantId: string, id: string): Promise<StudentModel | null>;
  list(tenantId: string): Promise<StudentModel[]>;
  update(
    tenantId: string,
    id: string,
    data: UpdateStudentDto,
  ): Promise<StudentModel>;
}

