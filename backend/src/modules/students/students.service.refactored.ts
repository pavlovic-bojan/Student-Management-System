import { IStudentsRepository } from './students.repository.interface';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';
import { StudentModel } from './students.model';
import { CreateStudentUseCase } from './use-cases';

export class StudentsService {
  private readonly createStudentUseCase: CreateStudentUseCase;

  constructor(private readonly repository: IStudentsRepository) {
    this.createStudentUseCase = new CreateStudentUseCase(repository);
  }

  async createStudent(
    tenantId: string,
    dto: CreateStudentDto,
  ): Promise<StudentModel> {
    return this.createStudentUseCase.execute(tenantId, dto);
  }

  async listStudents(tenantId: string): Promise<StudentModel[]> {
    return this.repository.list(tenantId);
  }
}

