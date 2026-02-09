export interface CreateCourseDto {
  name: string;
  code: string;
  programId?: string;
}

export interface UpdateCourseDto {
  name?: string;
  code?: string;
  programId?: string | null;
  professorId?: string | null;
}
