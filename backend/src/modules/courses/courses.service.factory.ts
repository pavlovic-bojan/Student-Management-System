import { prisma } from '../../prisma/client';
import { CoursesRepository } from './courses.repository';
import { CoursesService } from './courses.service.refactored';

export function createCoursesService(): CoursesService {
  return new CoursesService(new CoursesRepository(prisma));
}
