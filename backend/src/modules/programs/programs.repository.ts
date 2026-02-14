import { PrismaClient } from '@prisma/client';
import { IProgramsRepository } from './programs.repository.interface';
import { ProgramModel } from './programs.model';
import { CreateProgramDto, UpdateProgramDto } from './programs.dto';
import { ApiError } from '../../middleware/errorHandler';

export class ProgramsRepository implements IProgramsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tenantId: string, data: CreateProgramDto): Promise<ProgramModel> {
    return this.prisma.program.create({
      data: { ...data, tenantId },
    });
  }

  async findById(tenantId: string, id: string): Promise<ProgramModel | null> {
    return this.prisma.program.findFirst({
      where: { id, tenantId },
    });
  }

  async list(tenantId: string): Promise<ProgramModel[]> {
    return this.prisma.program.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async update(tenantId: string, id: string, data: UpdateProgramDto): Promise<ProgramModel> {
    const existing = await this.prisma.program.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new ApiError('Program not found', 404);
    return this.prisma.program.update({
      where: { id },
      data,
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.program.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new ApiError('Program not found', 404);
    await this.prisma.program.delete({
      where: { id },
    });
  }
}
