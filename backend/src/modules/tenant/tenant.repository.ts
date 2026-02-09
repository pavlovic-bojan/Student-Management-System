import { PrismaClient } from '@prisma/client';
import { ITenantRepository } from './tenant.repository.interface';
import { TenantModel } from './tenant.model';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';

export class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTenantDto): Promise<TenantModel> {
    const tenant = await this.prisma.tenant.create({ data });
    return tenant;
  }

  async findById(id: string): Promise<TenantModel | null> {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async findByCode(code: string): Promise<TenantModel | null> {
    return this.prisma.tenant.findUnique({ where: { code } });
  }

  async list(): Promise<TenantModel[]> {
    return this.prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  }

  async update(id: string, data: UpdateTenantDto): Promise<TenantModel> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}

