import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ExamsService } from './exams.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  async listExamPeriods(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listExamPeriods(tenantId);
    res.json({ data: list });
  }

  async createExamPeriod(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const period = await this.service.createExamPeriod(tenantId, req.body);
    res.status(201).json({ data: period });
  }

  async listExamTerms(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listExamTerms(tenantId);
    res.json({ data: list });
  }

  async createExamTerm(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const term = await this.service.createExamTerm(tenantId, req.body);
    res.status(201).json({ data: term });
  }
}
