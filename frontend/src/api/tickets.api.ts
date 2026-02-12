import { api } from './client';

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface CreateTicketDto {
  subject: string;
  description: string;
  page?: string;
  steps?: string;
  expectedActual?: string;
}

export interface TicketListItem {
  id: string;
  subject: string;
  status: TicketStatus;
  isPriority: boolean;
  createdAt: string;
  tenantId: string;
  tenantName: string;
  reporterName: string;
  reporterEmail: string;
   reporterRole: 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'PROFESSOR' | 'STUDENT';
}

export const ticketsApi = {
  async create(dto: CreateTicketDto): Promise<void> {
    await api.post('/tickets', dto);
  },

  async list(params?: { status?: TicketStatus; priorityOnly?: boolean }): Promise<TicketListItem[]> {
    const res = await api.get('/tickets', {
      params: {
        status: params?.status,
        priorityOnly: params?.priorityOnly,
      },
    });
    return res.data.data as TicketListItem[];
  },

  async update(
    id: string,
    dto: { status?: TicketStatus; isPriority?: boolean },
  ): Promise<TicketListItem> {
    const res = await api.patch(`/tickets/${id}`, dto);
    return res.data.data as TicketListItem;
  },
};

