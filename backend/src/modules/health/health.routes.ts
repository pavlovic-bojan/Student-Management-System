import { Router, Request, Response } from 'express';

export function registerHealthRoutes(api: Router): void {
  const router = Router();

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check for SMS backend API
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API is healthy
   */
  router.get('/', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  api.use('/health', router);
}

