import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RecordsService } from './records.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class RecordsController {
  constructor(private readonly service: RecordsService) {}

  async listTranscripts(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listTranscripts(tenantId);
    res.json({ data: list });
  }

  async generateTranscript(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const transcript = await this.service.generateTranscript(tenantId, req.body);
    res.status(201).json({ data: transcript });
  }
}
