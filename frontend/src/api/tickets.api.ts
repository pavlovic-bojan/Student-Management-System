import { api } from './client';

export interface CreateTicketDto {
  subject: string;
  description: string;
  page?: string;
  steps?: string;
  expectedActual?: string;
}

export const ticketsApi = {
  async create(dto: CreateTicketDto): Promise<void> {
    await api.post('/tickets', dto);
  },
};

