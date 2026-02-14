import { IProgramsRepository } from './programs.repository.interface';
import { ProgramModel } from './programs.model';
import { CreateProgramDto, UpdateProgramDto } from './programs.dto';

export class ProgramsService {
  constructor(private readonly repository: IProgramsRepository) {}

  async createProgram(tenantId: string, dto: CreateProgramDto): Promise<ProgramModel> {
    return this.repository.create(tenantId, dto);
  }

  async listPrograms(tenantId: string): Promise<ProgramModel[]> {
    return this.repository.list(tenantId);
  }

  async getProgramById(tenantId: string, id: string): Promise<ProgramModel | null> {
    return this.repository.findById(tenantId, id);
  }

  async updateProgram(tenantId: string, id: string, dto: UpdateProgramDto): Promise<ProgramModel> {
    return this.repository.update(tenantId, id, dto);
  }

  async deleteProgram(tenantId: string, id: string): Promise<void> {
    return this.repository.delete(tenantId, id);
  }
}
