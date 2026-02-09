import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { FinanceService } from './finance.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  async listTuitions(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listTuitions(tenantId);
    res.json({ data: list });
  }

  async createTuition(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const tuition = await this.service.createTuition(tenantId, req.body);
    res.status(201).json({ data: tuition });
  }

  async listPayments(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listPayments(tenantId);
    res.json({ data: list });
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const payment = await this.service.createPayment(tenantId, req.body);
    res.status(201).json({ data: payment });
  }
}
