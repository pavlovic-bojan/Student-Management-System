export interface TicketModel {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  page?: string | null;
  steps?: string | null;
  expectedActual?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
   isPriority: boolean;
  createdById: string;
  createdAt: Date;
}

export interface TicketListItem {
  id: string;
  subject: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  isPriority: boolean;
  createdAt: Date;
  tenantId: string;
  tenantName: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'PROFESSOR' | 'STUDENT';
}

