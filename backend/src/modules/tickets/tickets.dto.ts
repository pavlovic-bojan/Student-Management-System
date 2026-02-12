export interface CreateTicketDto {
  subject: string;
  description: string;
  page?: string;
  steps?: string;
  expectedActual?: string;
}

export interface UpdateTicketDto {
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  isPriority?: boolean;
}

