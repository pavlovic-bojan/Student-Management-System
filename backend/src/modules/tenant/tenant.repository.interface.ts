import { TenantModel } from './tenant.model';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';

export interface ITenantRepository {
  create(data: CreateTenantDto): Promise<TenantModel>;
  findById(id: string): Promise<TenantModel | null>;
  findByCode(code: string): Promise<TenantModel | null>;
  list(): Promise<TenantModel[]>;
  update(id: string, data: UpdateTenantDto): Promise<TenantModel>;
}

