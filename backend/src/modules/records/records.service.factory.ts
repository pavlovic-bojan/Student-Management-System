import { prisma } from '../../prisma/client';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service.refactored';

export function createRecordsService(): RecordsService {
  return new RecordsService(new RecordsRepository(prisma));
}
