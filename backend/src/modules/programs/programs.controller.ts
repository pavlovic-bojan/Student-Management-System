import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ProgramsService } from './programs.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class ProgramsController {
  constructor(private readonly service: ProgramsService) {}

  async listPrograms(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listPrograms(tenantId);
    res.json({ data: list });
  }

  async createProgram(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const program = await this.service.createProgram(tenantId, req.body);
    res.status(201).json({ data: program });
  }
}
