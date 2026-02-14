import type { TicketModel, TicketListItem } from './tickets.model';
import type { CreateTicketDto, UpdateTicketDto } from './tickets.dto';

export interface ITicketsRepository {
  createTicket(tenantId: string, userId: string, dto: CreateTicketDto): Promise<TicketModel>;
  findLastTicketForUser(userId: string): Promise<TicketModel | null>;
  listTicketsForTenant(
    tenantId: string,
    filters: { status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'; priorityOnly?: boolean },
    options?: { excludeReporterRole?: 'PLATFORM_ADMIN' },
  ): Promise<TicketListItem[]>;
  updateTicket(
    tenantId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketModel>;
}

