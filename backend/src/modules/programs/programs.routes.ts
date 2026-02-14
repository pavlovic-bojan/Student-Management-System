import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, param } from 'express-validator';
import { createProgramsService } from './programs.service.factory';
import { ProgramsController } from './programs.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';

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
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.createProgram(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/programs/{id}:
   *   patch:
   *     summary: Update a program
   *     tags: [Programs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               code:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Program updated
   *       400:
   *         description: Validation error
   *       404:
   *         description: Program not found
   */
  router.patch(
    '/:id',
    authenticate,
    [
      param('id').isUUID().withMessage('Valid program id required'),
      body('name').optional().trim().notEmpty(),
      body('code').optional().trim().notEmpty(),
      body('isActive').optional().isBoolean(),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.updateProgram(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/programs/{id}:
   *   delete:
   *     summary: Delete a program
   *     tags: [Programs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Program deleted
   *       404:
   *         description: Program not found
   */
  router.delete(
    '/:id',
    authenticate,
    [param('id').isUUID().withMessage('Valid program id required')],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.deleteProgram(req, res).catch(next),
  );

  api.use('/programs', router);
}
