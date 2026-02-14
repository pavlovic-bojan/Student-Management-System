import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CoursesService } from './courses.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  async listCourses(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const list = await this.service.listCourses(tenantId);
    res.json({ data: list });
  }

  async createCourse(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const course = await this.service.createCourse(tenantId, req.body);
    res.status(201).json({ data: course });
  }

  async updateCourse(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError('Validation error', 400);
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    const course = await this.service.updateCourse(tenantId, req.params.id, req.body);
    res.json({ data: course });
  }

  async deleteCourse(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) throw new ApiError('Missing tenant context', 400);
    await this.service.deleteCourse(tenantId, req.params.id);
    res.status(204).send();
  }
}
