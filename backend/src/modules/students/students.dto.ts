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
}

export interface AddStudentToTenantDto {
  indexNumber: string;
  programId?: string;
}
