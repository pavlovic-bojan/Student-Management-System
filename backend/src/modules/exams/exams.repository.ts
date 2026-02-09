import { PrismaClient } from '@prisma/client';
import { IExamsRepository } from './exams.repository.interface';
import { ExamPeriodModel, ExamTermModel } from './exams.model';
import { CreateExamPeriodDto, CreateExamTermDto } from './exams.dto';

export class ExamsRepository implements IExamsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPeriod(tenantId: string, data: CreateExamPeriodDto): Promise<ExamPeriodModel> {
    return this.prisma.examPeriod.create({
      data: { ...data, tenantId },
    });
  }

  async listPeriods(tenantId: string): Promise<ExamPeriodModel[]> {
    return this.prisma.examPeriod.findMany({
      where: { tenantId },
      orderBy: [{ year: 'desc' }, { term: 'asc' }],
    });
  }

  async createTerm(tenantId: string, data: CreateExamTermDto): Promise<ExamTermModel> {
    return this.prisma.examTerm.create({
      data: {
        ...data,
        date: new Date(data.date),
        tenantId,
      },
    });
  }

  async listTerms(tenantId: string): Promise<ExamTermModel[]> {
    return this.prisma.examTerm.findMany({
      where: { tenantId },
      orderBy: { date: 'asc' },
    });
  }
}
