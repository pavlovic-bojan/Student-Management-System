import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, param } from 'express-validator';
import { createTenantService } from './tenant.service.factory';
import { TenantController } from './tenant.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePlatformAdmin } from '../../middleware/requireAdminRole';
import { validateRequest } from '../../middleware/validateRequest';

export function registerTenantRoutes(api: Router): void {
  const router = Router();
  const service = createTenantService();
  const controller = new TenantController(service);

  /**
   * @swagger
   * /api/tenants:
   *   get:
   *     summary: List all tenants (Platform Admin only)
   *     tags: [Tenants]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200: { description: List of tenants }
   *       401: { description: Missing or invalid token }
   *       403: { description: Forbidden – only Platform Admin }
   */
  router.get(
    '/',
    authenticate,
    requirePlatformAdmin,
    (req: Request, res: Response, next: NextFunction) =>
      controller.listTenants(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/tenants:
   *   post:
   *     summary: Create a new tenant (Platform Admin only)
   *     tags: [Tenants]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, code]
   *             properties:
   *               name: { type: string }
   *               code: { type: string }
   *     responses:
   *       201: { description: Tenant created }
   *       400: { description: Validation error }
   *       401: { description: Missing or invalid token }
   *       403: { description: Forbidden – only Platform Admin }
   *       409: { description: Tenant code already exists }
   */
  router.post(
    '/',
    authenticate,
    requirePlatformAdmin,
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('code').trim().notEmpty().withMessage('Code is required'),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.createTenant(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/tenants/{id}:
   *   patch:
   *     summary: Update tenant (name, code, isActive) – Platform Admin only
   *     tags: [Tenants]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               code: { type: string }
   *               isActive: { type: boolean }
   *     responses:
   *       200: { description: Tenant updated }
   *       400: { description: Validation error or no fields provided }
   *       401: { description: Missing or invalid token }
   *       403: { description: Forbidden – only Platform Admin }
   *       404: { description: Tenant not found }
   *       409: { description: Tenant code already exists }
   */
  router.patch(
    '/:id',
    authenticate,
    requirePlatformAdmin,
    [
      param('id').isUUID().withMessage('Valid tenant id required'),
      body('name').optional().trim().notEmpty(),
      body('code').optional().trim().notEmpty(),
      body('isActive').optional().isBoolean(),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.updateTenant(req, res).catch(next),
  );

  api.use('/tenants', router);
}

