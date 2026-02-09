import { Router, type Request, type Response, type NextFunction } from 'express';
import { body } from 'express-validator';
import { createProgramsService } from './programs.service.factory';
import { ProgramsController } from './programs.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerProgramRoutes(api: Router): void {
  const router = Router();
  const service = createProgramsService();
  const controller = new ProgramsController(service);

  /**
   * @swagger
   * /api/programs:
   *   get:
   *     summary: List programs for current tenant
   *     tags: [Programs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of programs
   */
  router.get(
    '/',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => controller.listPrograms(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/programs:
   *   post:
   *     summary: Create a new program for current tenant
   *     tags: [Programs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - code
   *             properties:
   *               name:
   *                 type: string
   *               code:
   *                 type: string
   *     responses:
   *       201:
   *         description: Program created
   *       400:
   *         description: Validation error
   */
  router.post(
    '/',
    authenticate,
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('code').trim().notEmpty().withMessage('Code is required'),
    ],
    (req: Request, res: Response, next: NextFunction) => controller.createProgram(req, res).catch(next),
  );

  api.use('/programs', router);
}
