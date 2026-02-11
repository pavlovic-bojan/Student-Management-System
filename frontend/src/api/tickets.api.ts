import { api } from './client';

export interface CreateTicketDto {
  subject: string;
  description: string;
}

export const ticketsApi = {
  async create(dto: CreateTicketDto): Promise<void> {
    await api.post('/tickets', dto);
  },
};

