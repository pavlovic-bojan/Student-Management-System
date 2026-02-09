import { prisma } from '../../prisma/client';
import { ExamsRepository } from './exams.repository';
import { ExamsService } from './exams.service.refactored';

export function createExamsService(): ExamsService {
  return new ExamsService(new ExamsRepository(prisma));
}
