import { Router, type Request, type Response, type NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { createTicketsService } from './tickets.service.factory';

export function registerTicketsRoutes(api: Router): void {
  const router = Router();
  const service = createTicketsService();

  /**
   * @swagger
   * /api/tickets:
   *   post:
   *     summary: Submit a bug report / ticket
   *     description: Any authenticated user can submit a bug report for their current tenant. Basic rate limiting applies per user.
   *     tags: [Tickets]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - subject
   *               - description
   *             properties:
   *               subject:
   *                 type: string
   *                 minLength: 5
   *                 maxLength: 200
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 2000
   *     responses:
   *       201:
   *         description: Ticket created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Missing or invalid token
   *       429:
   *         description: Too many requests (cooldown not expired)
   */
  router.post(
    '/',
    authenticate,
    [
      body('subject')
        .isString()
        .isLength({ min: 5, max: 200 })
        .withMessage('Subject must be between 5 and 200 characters'),
      body('description')
        .isString()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenantId = req.tenantId;
        if (!tenantId) {
          return res.status(400).json({ message: 'Tenant context is required' });
        }
        const userId = req.user!.sub;
        const ticket = await service.createTicket(tenantId, userId, {
          subject: req.body.subject,
          description: req.body.description,
        });
        res.status(201).json({ data: ticket });
      } catch (e: any) {
        next(e);
      }
    },
  );

  api.use('/tickets', router);
}

