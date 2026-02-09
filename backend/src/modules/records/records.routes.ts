import { Router, type Request, type Response, type NextFunction } from 'express';
import { body } from 'express-validator';
import { createRecordsService } from './records.service.factory';
import { RecordsController } from './records.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerRecordsRoutes(api: Router): void {
  const router = Router();
  const service = createRecordsService();
  const controller = new RecordsController(service);

  /**
   * @swagger
   * /api/records/transcripts:
   *   get:
   *     summary: List transcripts for current tenant
   *     tags: [Records]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of transcripts
   */
  router.get(
    '/transcripts',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => controller.listTranscripts(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/records/transcripts:
   *   post:
   *     summary: Generate a new transcript for a student
   *     tags: [Records]
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
   *             properties:
   *               studentId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Transcript generated
   *       400:
   *         description: Validation error
   */
  router.post(
    '/transcripts',
    authenticate,
    [body('studentId').trim().notEmpty().withMessage('studentId is required')],
    (req: Request, res: Response, next: NextFunction) => controller.generateTranscript(req, res).catch(next),
  );

  api.use('/records', router);
}
