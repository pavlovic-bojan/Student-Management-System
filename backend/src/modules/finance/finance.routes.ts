import { Router } from 'express';
import { body } from 'express-validator';
import { createFinanceService } from './finance.service.factory';
import { FinanceController } from './finance.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerFinanceRoutes(api: Router): void {
  const router = Router();
  const service = createFinanceService();
  const controller = new FinanceController(service);

  /**
   * @swagger
   * /api/finance/tuitions:
   *   get:
   *     summary: List tuitions for current tenant
   *     tags: [Finance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of tuitions
   */
  router.get(
    '/tuitions',
    authenticate,
    (req, res, next) => controller.listTuitions(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/finance/tuitions:
   *   post:
   *     summary: Create a new tuition
   *     tags: [Finance]
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
   *               - amount
   *             properties:
   *               name:
   *                 type: string
   *               amount:
   *                 type: number
   *     responses:
   *       201:
   *         description: Tuition created
   *       400:
   *         description: Validation error
   */
  router.post(
    '/tuitions',
    authenticate,
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    ],
    (req, res, next) => controller.createTuition(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/finance/payments:
   *   get:
   *     summary: List payments for current tenant
   *     tags: [Finance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of payments
   */
  router.get(
    '/payments',
    authenticate,
    (req, res, next) => controller.listPayments(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/finance/payments:
   *   post:
   *     summary: Create a new payment
   *     tags: [Finance]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - studentId
   *               - tuitionId
   *               - amount
   *               - paidAt
   *             properties:
   *               studentId:
   *                 type: string
   *               tuitionId:
   *                 type: string
   *               amount:
   *                 type: number
   *               paidAt:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Payment created
   *       400:
   *         description: Validation error
   */
  router.post(
    '/payments',
    authenticate,
    [
      body('studentId').trim().notEmpty().withMessage('studentId is required'),
      body('tuitionId').trim().notEmpty().withMessage('tuitionId is required'),
      body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
      body('paidAt').trim().notEmpty().withMessage('paidAt is required'),
    ],
    (req, res, next) => controller.createPayment(req, res).catch(next),
  );

  api.use('/finance', router);
}
