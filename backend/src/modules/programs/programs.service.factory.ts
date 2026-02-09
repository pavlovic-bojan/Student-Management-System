import { prisma } from '../../prisma/client';
import { ProgramsRepository } from './programs.repository';
import { ProgramsService } from './programs.service.refactored';

export function createProgramsService(): ProgramsService {
  return new ProgramsService(new ProgramsRepository(prisma));
}
