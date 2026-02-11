import type { ITicketsRepository } from './tickets.repository.interface';
import type { TicketModel } from './tickets.model';
import type { CreateTicketDto } from './tickets.dto';
import { ApiError } from '../../middleware/errorHandler';

const COOLDOWN_SECONDS = 60;

export class TicketsService {
  constructor(private readonly repo: ITicketsRepository) {}

  async createTicket(tenantId: string, userId: string, dto: CreateTicketDto): Promise<TicketModel> {
    const trimmedSubject = dto.subject.trim();
    const trimmedDescription = dto.description.trim();

    if (!trimmedSubject || trimmedSubject.length < 5 || trimmedSubject.length > 200) {
      throw new ApiError('Subject must be between 5 and 200 characters', 400);
    }

    if (!trimmedDescription || trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
      throw new ApiError('Description must be between 10 and 2000 characters', 400);
    }

    const last = await this.repo.findLastTicketForUser(userId);
    if (last) {
      const now = Date.now();
      const diffSeconds = (now - last.createdAt.getTime()) / 1000;
      if (diffSeconds < COOLDOWN_SECONDS) {
        throw new ApiError('Please wait before submitting another report', 429);
      }
    }

    return this.repo.createTicket(tenantId, userId, {
      subject: trimmedSubject,
      description: trimmedDescription,
    });
  }
}

