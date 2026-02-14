import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StudentsService } from './students.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

function resolveTenantIdForList(req: Request): string {
  const isPlatformAdmin = req.user?.role === 'PLATFORM_ADMIN';
  if (isPlatformAdmin) {
    const tenantId = req.query.tenantId as string | undefined;
    if (!tenantId) throw new ApiError('Platform Admin must provide tenantId query', 400);
    return tenantId;
  }
  const tenantId = req.tenantId;
  if (!tenantId) throw new ApiError('Missing tenant context', 400);
  return tenantId;
}

function resolveTenantIdForMutation(req: Request, bodyTenantId?: string): string {
  const isPlatformAdmin = req.user?.role === 'PLATFORM_ADMIN';
  if (isPlatformAdmin) {
    const tenantId = bodyTenantId ?? (req.query.tenantId as string | undefined);
    if (!tenantId) throw new ApiError('Platform Admin must provide tenantId', 400);
    return tenantId;
  }
  const tenantId = req.tenantId;
  if (!tenantId) throw new ApiError('Missing tenant context', 400);
  return tenantId;
}

export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  async listStudents(req: Request, res: Response): Promise<void> {
    const tenantId = resolveTenantIdForList(req);
    const data = await this.service.listStudents(tenantId);
    res.json({ data });
  }

  async createStudent(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const tenantId = resolveTenantIdForMutation(req, req.body.tenantId);
    const { tenantId: _skip, ...body } = req.body;
    const item = await this.service.createStudent(tenantId, body);
    res.status(201).json({ data: item });
  }

  async updateStudent(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const studentId = req.params.studentId;
    const user = await this.service.updateStudent(studentId, req.body);
    res.json({ data: user });
  }

  async deleteEnrollment(req: Request, res: Response): Promise<void> {
    const enrollmentId = req.params.enrollmentId;
    await this.service.deleteEnrollment(enrollmentId);
    res.status(204).send();
  }

  async addStudentToTenant(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const studentId = req.params.studentId;
    const tenantId = resolveTenantIdForMutation(req, req.body.tenantId);
    const { tenantId: _skip, ...body } = req.body;
    const item = await this.service.addStudentToTenant(studentId, tenantId, body);
    res.status(201).json({ data: item });
  }
}
