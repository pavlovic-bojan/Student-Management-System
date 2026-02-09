import { ProgramModel } from './programs.model';
import { CreateProgramDto, UpdateProgramDto } from './programs.dto';

export interface IProgramsRepository {
  create(tenantId: string, data: CreateProgramDto): Promise<ProgramModel>;
  findById(tenantId: string, id: string): Promise<ProgramModel | null>;
  list(tenantId: string): Promise<ProgramModel[]>;
  update(tenantId: string, id: string, data: UpdateProgramDto): Promise<ProgramModel>;
}
