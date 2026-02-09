import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TenantService } from './tenant.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  async createTenant(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const tenant = await this.tenantService.createTenant(req.body);
    res.status(201).json({ data: tenant });
  }

  async listTenants(_req: Request, res: Response): Promise<void> {
    const tenants = await this.tenantService.listTenants();
    res.json({ data: tenants });
  }
}

