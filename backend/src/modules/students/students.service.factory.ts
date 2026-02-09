import { prisma } from '../../prisma/client';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service.refactored';

export function createStudentsService(): StudentsService {
  const repository = new StudentsRepository(prisma);
  return new StudentsService(repository);
}

