import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { requireAdminOrSchoolAdmin } from '../../middleware/requireAdminRole';
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
   *               page:
   *                 type: string
   *                 maxLength: 255
   *               steps:
   *                 type: string
   *                 minLength: 5
   *                 maxLength: 4000
   *               expectedActual:
   *                 type: string
   *                 minLength: 5
   *                 maxLength: 4000
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
      body('page')
        .optional()
        .isString()
        .isLength({ max: 255 })
        .withMessage('Page must be at most 255 characters'),
      body('steps')
        .optional()
        .isString()
        .isLength({ min: 5, max: 4000 })
        .withMessage('Steps must be between 5 and 4000 characters when provided'),
      body('expectedActual')
        .optional()
        .isString()
        .isLength({ min: 5, max: 4000 })
        .withMessage('Expected vs actual must be between 5 and 4000 characters when provided'),
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
          page: req.body.page,
          steps: req.body.steps,
          expectedActual: req.body.expectedActual,
        });
        res.status(201).json({ data: ticket });
      } catch (e: any) {
        next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/tickets:
   *   get:
   *     summary: List bug report tickets for current tenant
   *     description: Platform/School admins can see all tickets for their tenant, with optional filters.
   *     tags: [Tickets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [NEW, IN_PROGRESS, RESOLVED]
   *         required: false
   *         description: Optional status filter.
   *       - in: query
   *         name: priorityOnly
   *         schema:
   *           type: boolean
   *         required: false
   *         description: If true, only priority tickets are returned.
   *     responses:
   *       200:
   *         description: List of tickets
   *       400:
   *         description: Validation error
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Forbidden
   */
  router.get(
    '/',
    authenticate,
    requireAdminOrSchoolAdmin,
    [
      query('status')
        .optional()
        .isIn(['NEW', 'IN_PROGRESS', 'RESOLVED'])
        .withMessage('Invalid status filter'),
      query('priorityOnly')
        .optional()
        .isBoolean()
        .withMessage('priorityOnly must be boolean'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenantId = req.tenantId;
        if (!tenantId) {
          return res.status(400).json({ message: 'Tenant context is required' });
        }
        const status = req.query.status as 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | undefined;
        const priorityOnly =
          typeof req.query.priorityOnly !== 'undefined'
            ? String(req.query.priorityOnly) === 'true'
            : false;

        const tickets = await service.listTickets(tenantId, { status, priorityOnly });
        res.status(200).json({ data: tickets });
      } catch (e) {
        next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/tickets/{id}:
   *   patch:
   *     summary: Update ticket status or priority
   *     description: Platform/School admins can change status and mark/unmark priority.
   *     tags: [Tickets]
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
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [NEW, IN_PROGRESS, RESOLVED]
   *               isPriority:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Updated ticket
   *       400:
   *         description: Validation error
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Ticket not found
   */
  router.patch(
    '/:id',
    authenticate,
    requireAdminOrSchoolAdmin,
    [
      param('id').isString().isUUID().withMessage('Invalid ticket id'),
      body('status')
        .optional()
        .isIn(['NEW', 'IN_PROGRESS', 'RESOLVED'])
        .withMessage('Invalid ticket status'),
      body('isPriority')
        .optional()
        .isBoolean()
        .withMessage('isPriority must be boolean'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenantId = req.tenantId;
        if (!tenantId) {
          return res.status(400).json({ message: 'Tenant context is required' });
        }
        const ticketId = req.params.id;
        const updated = await service.updateTicket(tenantId, ticketId, {
          status: req.body.status,
          isPriority: typeof req.body.isPriority === 'boolean' ? req.body.isPriority : undefined,
        });
        res.status(200).json({ data: updated });
      } catch (e: any) {
        next(e);
      }
    },
  );

  api.use('/tickets', router);
}

