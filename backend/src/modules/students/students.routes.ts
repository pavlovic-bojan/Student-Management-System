import { Router, type Request, type Response, type NextFunction } from 'express';
import { body } from 'express-validator';
import { createStudentsService } from './students.service.factory';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/authenticate';

export function registerStudentRoutes(api: Router): void {
  const router = Router();
  const service = createStudentsService();
  const controller = new StudentsController(service);

  /**
   * @swagger
   * /api/students:
   *   get:
   *     summary: List students for current tenant
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of students
   */
  router.get(
    '/',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => controller.listStudents(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/students:
   *   post:
   *     summary: Create a new student for current tenant
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - indexNumber
   *               - firstName
   *               - lastName
   *             properties:
   *               indexNumber:
   *                 type: string
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               programId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Student created
   *       400:
   *         description: Validation error
   *       409:
   *         description: Student index already exists
   */
  router.post(
    '/',
    authenticate,
    [
      body('indexNumber')
        .trim()
        .notEmpty()
        .withMessage('indexNumber is required'),
      body('firstName').trim().notEmpty().withMessage('firstName is required'),
      body('lastName').trim().notEmpty().withMessage('lastName is required'),
    ],
    (req: Request, res: Response, next: NextFunction) => controller.createStudent(req, res).catch(next),
  );

  api.use('/students', router);
}

