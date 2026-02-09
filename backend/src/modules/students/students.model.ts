export interface StudentModel {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  programId?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

