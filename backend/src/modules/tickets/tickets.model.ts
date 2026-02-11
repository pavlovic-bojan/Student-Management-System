export interface TicketModel {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdById: string;
  createdAt: Date;
}

