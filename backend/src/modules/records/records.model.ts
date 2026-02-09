export interface TranscriptModel {
  id: string;
  tenantId: string;
  studentId: string;
  generatedAt: Date;
  gpa: number | null;
  createdAt: Date;
  updatedAt: Date;
}
