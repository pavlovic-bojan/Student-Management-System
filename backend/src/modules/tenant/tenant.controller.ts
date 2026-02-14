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

  async updateTenant(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const id = req.params.id;
    const { name, code, isActive } = req.body;
    const payload: { name?: string; code?: string; isActive?: boolean } = {};
    if (name !== undefined) payload.name = name;
    if (code !== undefined) payload.code = code;
    if (isActive !== undefined) payload.isActive = Boolean(isActive);
    if (Object.keys(payload).length === 0) {
      throw new ApiError('At least one field (name, code, isActive) is required', 400);
    }
    const tenant = await this.tenantService.updateTenant(id, payload);
    res.json({ data: tenant });
  }
}

