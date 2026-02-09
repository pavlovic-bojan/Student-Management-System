import { IStudentsRepository } from '../students.repository.interface';
import { CreateStudentDto } from '../students.dto';
import { StudentModel } from '../students.model';
import { ApiError } from '../../../middleware/errorHandler';

export class CreateStudentUseCase {
  constructor(private readonly repository: IStudentsRepository) {}

  async execute(tenantId: string, dto: CreateStudentDto): Promise<StudentModel> {
    const existing = await this.repository.list(tenantId);
    const duplicate = existing.find(
      (s) => s.indexNumber === dto.indexNumber,
    );
    if (duplicate) {
      throw new ApiError('Student index already exists', 409);
    }
    return this.repository.create(tenantId, dto);
  }
}

