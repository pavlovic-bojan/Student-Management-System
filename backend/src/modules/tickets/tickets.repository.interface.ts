import type { TicketModel } from './tickets.model';
import type { CreateTicketDto } from './tickets.dto';

export interface ITicketsRepository {
  createTicket(tenantId: string, userId: string, dto: CreateTicketDto): Promise<TicketModel>;
  findLastTicketForUser(userId: string): Promise<TicketModel | null>;
}

