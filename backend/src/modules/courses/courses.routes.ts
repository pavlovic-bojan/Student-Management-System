import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, param } from 'express-validator';
import { createCoursesService } from './courses.service.factory';
import { CoursesController } from './courses.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';

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
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.createCourse(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/courses/{id}:
   *   patch:
   *     summary: Update a course
   *     tags: [Courses]
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
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               code:
   *                 type: string
   *               programId:
   *                 type: string
   *                 nullable: true
   *               professorId:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Course updated
   *       400:
   *         description: Validation error
   *       404:
   *         description: Course not found
   */
  router.patch(
    '/:id',
    authenticate,
    [
      param('id').isUUID().withMessage('Valid course id required'),
      body('name').optional().trim().notEmpty(),
      body('code').optional().trim().notEmpty(),
      body('programId').optional({ values: 'null' }),
      body('professorId').optional({ values: 'null' }),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.updateCourse(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/courses/{id}:
   *   delete:
   *     summary: Delete a course
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Course deleted
   *       404:
   *         description: Course not found
   */
  router.delete(
    '/:id',
    authenticate,
    [param('id').isUUID().withMessage('Valid course id required')],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.deleteCourse(req, res).catch(next),
  );

  api.use('/courses', router);
}
