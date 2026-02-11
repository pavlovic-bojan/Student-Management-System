export interface CreateTicketDto {
  subject: string;
  description: string;
  page?: string;
  steps?: string;
  expectedActual?: string;
}

