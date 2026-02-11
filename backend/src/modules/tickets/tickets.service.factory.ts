import { PrismaClient } from '@prisma/client';
import { TicketsService } from './tickets.service.refactored';
import { TicketsRepository } from './tickets.repository';

let cached: TicketsService | null = null;

export function createTicketsService(): TicketsService {
  if (!cached) {
    const prisma = new PrismaClient();
    const repo = new TicketsRepository(prisma);
    cached = new TicketsService(repo);
  }
  return cached;
}

