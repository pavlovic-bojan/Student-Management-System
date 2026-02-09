import { TranscriptModel } from './records.model';
import { GenerateTranscriptDto } from './records.dto';

export interface IRecordsRepository {
  createTranscript(tenantId: string, data: GenerateTranscriptDto): Promise<TranscriptModel>;
  listTranscripts(tenantId: string): Promise<TranscriptModel[]>;
  getByStudentId(tenantId: string, studentId: string): Promise<TranscriptModel[]>;
}
