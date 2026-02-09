export interface CreateTenantDto {
  name: string;
  code: string;
}

export interface UpdateTenantDto {
  name?: string;
  isActive?: boolean;
}

