export interface CreateProgramDto {
  name: string;
  code: string;
}

export interface UpdateProgramDto {
  name?: string;
  code?: string;
  isActive?: boolean;
}
