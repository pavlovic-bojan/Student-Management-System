import { Router, type Request, type Response, type NextFunction } from 'express';
import { body } from 'express-validator';
import { createCoursesService } from './courses.service.factory';
import { CoursesController } from './courses.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerCourseRoutes(api: Router): void {
  const router = Router();
  const service = createCoursesService();
  const controller = new CoursesController(service);

  /**
   * @swagger
   * /api/courses:
   *   get:
   *     summary: List courses for current tenant
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of courses
   */
  router.get(
    '/',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => controller.listCourses(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/courses:
   *   post:
   *     summary: Create a new course for current tenant
   *     tags: [Courses]
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
   *               programId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Course created
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
    (req: Request, res: Response, next: NextFunction) => controller.createCourse(req, res).catch(next),
  );

  api.use('/courses', router);
}
