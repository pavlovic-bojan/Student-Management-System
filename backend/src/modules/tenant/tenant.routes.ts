import { Router } from 'express';
import { body } from 'express-validator';
import { createTenantService } from './tenant.service.factory';
import { TenantController } from './tenant.controller';

export function registerTenantRoutes(api: Router): void {
  const router = Router();
  const service = createTenantService();
  const controller = new TenantController(service);

  /**
   * @swagger
   * /api/tenants:
   *   get:
   *     summary: List all tenants
   *     tags: [Tenants]
   *     responses:
   *       200:
   *         description: List of tenants
   */
  router.get('/', (req, res, next) =>
    controller.listTenants(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/tenants:
   *   post:
   *     summary: Create a new tenant
   *     tags: [Tenants]
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
   *         description: Tenant created
   *       400:
   *         description: Validation error
   *       409:
   *         description: Tenant code already exists
   */
  router.post(
    '/',
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('code').trim().notEmpty().withMessage('Code is required'),
    ],
    (req, res, next) => controller.createTenant(req, res).catch(next),
  );

  api.use('/tenants', router);
}

