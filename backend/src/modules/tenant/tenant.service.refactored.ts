import { ApiError } from '../../middleware/errorHandler';
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
    const existing = await this.tenantRepository.findById(id);
    if (!existing) throw new ApiError('Tenant not found', 404);
    if (dto.code !== undefined) {
      const byCode = await this.tenantRepository.findByCode(dto.code);
      if (byCode && byCode.id !== id) throw new ApiError('Tenant code already exists', 409);
    }
    return this.tenantRepository.update(id, dto);
  }
}

