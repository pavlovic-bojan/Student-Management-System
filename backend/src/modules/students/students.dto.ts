export interface CreateStudentDto {
  indexNumber: string;
  firstName: string;
  lastName: string;
  programId?: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  status?: 'ACTIVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  programId?: string | null;
}

