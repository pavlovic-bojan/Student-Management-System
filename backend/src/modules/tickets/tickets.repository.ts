import { PrismaClient } from '@prisma/client';
import type { ITicketsRepository } from './tickets.repository.interface';
import type { TicketModel, TicketListItem } from './tickets.model';
import type { CreateTicketDto, UpdateTicketDto } from './tickets.dto';

export class TicketsRepository implements ITicketsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTicket(tenantId: string, userId: string, dto: CreateTicketDto): Promise<TicketModel> {
    const row = await this.prisma.ticket.create({
      data: {
        tenantId,
        createdById: userId,
        subject: dto.subject,
        description: dto.description,
        page: dto.page,
        steps: dto.steps,
        expectedActual: dto.expectedActual,
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

  async listTicketsForTenant(
    tenantId: string,
    filters: { status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'; priorityOnly?: boolean },
    options?: { excludeReporterRole?: 'PLATFORM_ADMIN' },
  ): Promise<TicketListItem[]> {
    const where: any = { tenantId };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priorityOnly) {
      where.isPriority = true;
    }
    if (options?.excludeReporterRole) {
      where.createdBy = { role: { not: options.excludeReporterRole } };
    }

    const rows = await this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: true,
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      status: row.status as TicketListItem['status'],
      isPriority: row.isPriority,
      createdAt: row.createdAt,
      tenantId: row.tenantId,
      tenantName: row.tenant.name,
      reporterName:
        [row.createdBy.firstName, row.createdBy.lastName].filter(Boolean).join(' ') ||
        row.createdBy.email,
      reporterEmail: row.createdBy.email,
      reporterRole: row.createdBy.role as TicketListItem['reporterRole'],
    }));
  }

  async updateTicket(
    tenantId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketModel> {
    const existing = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, tenantId: true },
    });

    if (!existing || existing.tenantId !== tenantId) {
      throw new Error('Ticket not found for this tenant');
    }

    const row = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        isPriority: typeof dto.isPriority === 'boolean' ? dto.isPriority : undefined,
      },
    });

    return row;
  }
}

