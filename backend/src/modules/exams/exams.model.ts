export interface ExamPeriodModel {
  id: string;
  name: string;
  term: string;
  year: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamTermModel {
  id: string;
  examPeriodId: string;
  courseOfferingId: string;
  date: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
