import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StudentsService } from './students.service.refactored';
import { ApiError } from '../../middleware/errorHandler';

export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  async listStudents(req: Request, res: Response): Promise<void> {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new ApiError('Missing tenant context', 400);
    }
    const students = await this.service.listStudents(tenantId);
    res.json({ data: students });
  }

  async createStudent(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400);
    }
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new ApiError('Missing tenant context', 400);
    }
    const student = await this.service.createStudent(tenantId, req.body);
    res.status(201).json({ data: student });
  }
}

