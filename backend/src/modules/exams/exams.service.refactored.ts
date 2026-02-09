import { IExamsRepository } from './exams.repository.interface';
import { ExamPeriodModel, ExamTermModel } from './exams.model';
import { CreateExamPeriodDto, CreateExamTermDto } from './exams.dto';

export class ExamsService {
  constructor(private readonly repository: IExamsRepository) {}

  async createExamPeriod(tenantId: string, dto: CreateExamPeriodDto): Promise<ExamPeriodModel> {
    return this.repository.createPeriod(tenantId, dto);
  }

  async listExamPeriods(tenantId: string): Promise<ExamPeriodModel[]> {
    return this.repository.listPeriods(tenantId);
  }

  async createExamTerm(tenantId: string, dto: CreateExamTermDto): Promise<ExamTermModel> {
    return this.repository.createTerm(tenantId, dto);
  }

  async listExamTerms(tenantId: string): Promise<ExamTermModel[]> {
    return this.repository.listTerms(tenantId);
  }
}
