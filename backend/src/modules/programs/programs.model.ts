export interface ProgramModel {
  id: string;
  name: string;
  code: string;
  version: number;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
