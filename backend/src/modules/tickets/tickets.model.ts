export interface TicketModel {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  page?: string | null;
  steps?: string | null;
  expectedActual?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdById: string;
  createdAt: Date;
}

