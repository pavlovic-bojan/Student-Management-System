import { Router, Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { listNotificationsForUser, markNotificationsRead } from './notifications.service';

export function registerNotificationRoutes(api: Router): void {
  const router = Router();

  /**
   * @swagger
   * /api/notifications:
   *   get:
   *     summary: List notifications for current user
   *     description: Returns unread notifications about user actions (created/updated/deleted).
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: unreadOnly
   *         schema:
   *           type: boolean
   *         description: If true, only unread notifications are returned (default true).
   *     responses:
   *       200:
   *         description: List of notifications
   *       401:
   *         description: Missing or invalid token
   */
  router.get(
    '/notifications',
    authenticate,
    [query('unreadOnly').optional().isBoolean().toBoolean()],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const unreadOnly =
          typeof req.query.unreadOnly === 'boolean' ? (req.query.unreadOnly as boolean) : true;
        const notifications = await listNotificationsForUser(req.user!.sub, unreadOnly);
        res.json({ notifications });
      } catch (e: any) {
        next(e);
      }
    }
  );

  /**
   * @swagger
   * /api/notifications/mark-read:
   *   post:
   *     summary: Mark notifications as read
   *     description: Marks the given notification ids as read for the current user.
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       204:
   *         description: Notifications marked as read
   *       401:
   *         description: Missing or invalid token
   */
  router.post(
    '/notifications/mark-read',
    authenticate,
    [body('ids').isArray({ min: 1 }).withMessage('ids array is required')],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ids = req.body.ids as string[];
        await markNotificationsRead(req.user!.sub, ids);
        res.status(204).send();
      } catch (e: any) {
        next(e);
      }
    }
  );

  api.use(router);
}

