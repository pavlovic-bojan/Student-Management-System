import { Router } from 'express';
import { body } from 'express-validator';
import { createExamsService } from './exams.service.factory';
import { ExamsController } from './exams.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerExamRoutes(api: Router): void {
  const router = Router();
  const service = createExamsService();
  const controller = new ExamsController(service);

  /**
   * @swagger
   * /api/exams/periods:
   *   get:
   *     summary: List exam periods for current tenant
   *     tags: [Exams]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of exam periods
   */
  router.get(
    '/periods',
    authenticate,
    (req, res, next) => controller.listExamPeriods(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/exams/periods:
   *   post:
   *     summary: Create a new exam period
   *     tags: [Exams]
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
   *               - term
   *               - year
   *             properties:
   *               name:
   *                 type: string
   *               term:
   *                 type: string
   *               year:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Exam period created
   *       400:
   *         description: Validation error
   */
  router.post(
    '/periods',
    authenticate,
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('term').trim().notEmpty().withMessage('Term is required'),
      body('year').isInt({ min: 2000, max: 2100 }).withMessage('Year is required'),
    ],
    (req, res, next) => controller.createExamPeriod(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/exams/terms:
   *   get:
   *     summary: List exam terms for current tenant
   *     tags: [Exams]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of exam terms
   */
  router.get(
    '/terms',
    authenticate,
    (req, res, next) => controller.listExamTerms(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/exams/terms:
   *   post:
   *     summary: Create a new exam term
   *     tags: [Exams]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - examPeriodId
   *               - courseOfferingId
   *               - date
   *             properties:
   *               examPeriodId:
   *                 type: string
   *               courseOfferingId:
   *                 type: string
   *               date:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Exam term created
   *       400:
   *         description: Validation error
   */
  router.post(
    '/terms',
    authenticate,
    [
      body('examPeriodId').trim().notEmpty().withMessage('examPeriodId is required'),
      body('courseOfferingId').trim().notEmpty().withMessage('courseOfferingId is required'),
      body('date').trim().notEmpty().withMessage('date is required'),
    ],
    (req, res, next) => controller.createExamTerm(req, res).catch(next),
  );

  api.use('/exams', router);
}
