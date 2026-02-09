import { ITenantRepository } from '../tenant.repository.interface';
import { CreateTenantDto } from '../tenant.dto';
import { TenantModel } from '../tenant.model';
import { ApiError } from '../../../middleware/errorHandler';

export class CreateTenantUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(dto: CreateTenantDto): Promise<TenantModel> {
    const existing = await this.tenantRepository.findByCode(dto.code);
    if (existing) {
      throw new ApiError('Tenant code already exists', 409);
    }
    return this.tenantRepository.create(dto);
  }
}

