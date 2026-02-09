import { ExamPeriodModel, ExamTermModel } from './exams.model';
import { CreateExamPeriodDto, CreateExamTermDto } from './exams.dto';

export interface IExamsRepository {
  createPeriod(tenantId: string, data: CreateExamPeriodDto): Promise<ExamPeriodModel>;
  listPeriods(tenantId: string): Promise<ExamPeriodModel[]>;
  createTerm(tenantId: string, data: CreateExamTermDto): Promise<ExamTermModel>;
  listTerms(tenantId: string): Promise<ExamTermModel[]>;
}
