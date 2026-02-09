import { ITenantRepository } from './tenant.repository.interface';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
import { TenantModel } from './tenant.model';
import { CreateTenantUseCase } from './use-cases';

export class TenantService {
  private readonly createTenantUseCase: CreateTenantUseCase;

  constructor(private readonly tenantRepository: ITenantRepository) {
    this.createTenantUseCase = new CreateTenantUseCase(tenantRepository);
  }

  async createTenant(dto: CreateTenantDto): Promise<TenantModel> {
    return this.createTenantUseCase.execute(dto);
  }

  async listTenants(): Promise<TenantModel[]> {
    return this.tenantRepository.list();
  }

  async getTenantById(id: string): Promise<TenantModel | null> {
    return this.tenantRepository.findById(id);
  }

  async updateTenant(id: string, dto: UpdateTenantDto): Promise<TenantModel> {
    return this.tenantRepository.update(id, dto);
  }
}

