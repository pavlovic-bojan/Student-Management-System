import { IRecordsRepository } from './records.repository.interface';
import { TranscriptModel } from './records.model';
import { GenerateTranscriptDto } from './records.dto';

export class RecordsService {
  constructor(private readonly repository: IRecordsRepository) {}

  async generateTranscript(tenantId: string, dto: GenerateTranscriptDto): Promise<TranscriptModel> {
    return this.repository.createTranscript(tenantId, dto);
  }

  async listTranscripts(tenantId: string): Promise<TranscriptModel[]> {
    return this.repository.listTranscripts(tenantId);
  }

  async getTranscriptsByStudent(tenantId: string, studentId: string): Promise<TranscriptModel[]> {
    return this.repository.getByStudentId(tenantId, studentId);
  }
}
