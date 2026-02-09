export interface CourseModel {
  id: string;
  name: string;
  code: string;
  tenantId: string;
  programId?: string | null;
  professorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
