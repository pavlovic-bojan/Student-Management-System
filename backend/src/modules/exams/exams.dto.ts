export interface CreateExamPeriodDto {
  name: string;
  term: string;
  year: number;
}

export interface CreateExamTermDto {
  examPeriodId: string;
  courseOfferingId: string;
  date: string; // ISO date
}

export interface RegisterExamDto {
  studentId: string;
  examTermId: string;
}

export interface GradeExamDto {
  grade: number;
  status: 'REGISTERED' | 'ATTENDED' | 'PASSED' | 'FAILED' | 'CANCELLED';
}
