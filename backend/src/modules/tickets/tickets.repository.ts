import { PrismaClient } from '@prisma/client';
import type { ITicketsRepository } from './tickets.repository.interface';
import type { TicketModel } from './tickets.model';
import type { CreateTicketDto } from './tickets.dto';

export class TicketsRepository implements ITicketsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTicket(tenantId: string, userId: string, dto: CreateTicketDto): Promise<TicketModel> {
    const row = await this.prisma.ticket.create({
      data: {
        tenantId,
        createdById: userId,
        subject: dto.subject,
        description: dto.description,
      },
    });
    return row;
  }

  async findLastTicketForUser(userId: string): Promise<TicketModel | null> {
    const row = await this.prisma.ticket.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
    return row ?? null;
  }
}

