import { prisma } from '../../prisma/client';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service.refactored';

export function createTenantService(): TenantService {
  const repository = new TenantRepository(prisma);
  return new TenantService(repository);
}

