import { PrismaClient } from '@prisma/client';
import { IRecordsRepository } from './records.repository.interface';
import { TranscriptModel } from './records.model';
import { GenerateTranscriptDto } from './records.dto';

export class RecordsRepository implements IRecordsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTranscript(tenantId: string, data: GenerateTranscriptDto): Promise<TranscriptModel> {
    return this.prisma.transcript.create({
      data: {
        tenantId,
        studentId: data.studentId,
      },
    });
  }

  async listTranscripts(tenantId: string): Promise<TranscriptModel[]> {
    return this.prisma.transcript.findMany({
      where: { tenantId },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getByStudentId(tenantId: string, studentId: string): Promise<TranscriptModel[]> {
    return this.prisma.transcript.findMany({
      where: { tenantId, studentId },
      orderBy: { generatedAt: 'desc' },
    });
  }
}
