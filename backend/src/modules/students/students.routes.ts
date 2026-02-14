import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { createStudentsService } from './students.service.factory';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';

export function registerStudentRoutes(api: Router): void {
  const router = Router();
  const service = createStudentsService();
  const controller = new StudentsController(service);

  /**
   * @swagger
   * /api/students:
   *   get:
   *     summary: List students (enrollments) for current tenant
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tenantId
   *         schema: { type: string, format: uuid }
   *         description: Required for Platform Admin
   *     responses:
   *       200:
   *         description: List of students with enrollmentId, studentId, tenantId, indexNumber, firstName, lastName, status, tenantName, programId
   */
  router.get(
    '/',
    authenticate,
    [query('tenantId').optional().isUUID().withMessage('Valid tenantId required')],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.listStudents(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/students:
   *   post:
   *     summary: Create a new student and enroll in tenant
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
   *                 nullable: true
   *               tenantId:
   *                 type: string
   *                 format: uuid
   *                 description: Required for Platform Admin
   *     responses:
   *       201:
   *         description: Student created and enrolled
   *       400:
   *         description: Validation error
   *       409:
   *         description: Student index already exists in institution
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
      body('tenantId').optional().isUUID().withMessage('Valid tenantId required'),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.createStudent(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/students/{studentId}/tenants:
   *   post:
   *     summary: Add existing student to another institution (tenant)
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - indexNumber
   *             properties:
   *               indexNumber: { type: string }
   *               programId: { type: string, nullable: true }
   *               tenantId: { type: string, format: uuid, description: Required for Platform Admin }
   *     responses:
   *       201:
   *         description: Student enrolled in tenant
   *       400:
   *         description: Validation error
   *       404:
   *         description: Student not found
   *       409:
   *         description: Already enrolled or index exists in institution
   */
  router.post(
    '/:studentId/tenants',
    authenticate,
    [
      param('studentId').isUUID().withMessage('Valid studentId required'),
      body('indexNumber').trim().notEmpty().withMessage('indexNumber is required'),
      body('tenantId').optional().isUUID().withMessage('Valid tenantId required'),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.addStudentToTenant(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/students/enrollments/{enrollmentId}:
   *   delete:
   *     summary: Remove student from institution (delete enrollment)
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: enrollmentId
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       204:
   *         description: Enrollment deleted
   *       404:
   *         description: Enrollment not found
   */
  router.delete(
    '/enrollments/:enrollmentId',
    authenticate,
    [param('enrollmentId').isUUID().withMessage('Valid enrollmentId required')],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.deleteEnrollment(req, res).catch(next),
  );

  /**
   * @swagger
   * /api/students/{studentId}:
   *   patch:
   *     summary: Update student person data (name, status)
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName: { type: string }
   *               lastName: { type: string }
   *               status: { type: string, enum: [ACTIVE, GRADUATED, DROPPED, SUSPENDED] }
   *     responses:
   *       200:
   *         description: Student updated
   *       400:
   *         description: Validation error
   *       404:
   *         description: Student not found
   */
  router.patch(
    '/:studentId',
    authenticate,
    [
      param('studentId').isUUID().withMessage('Valid studentId required'),
      body('firstName').optional().trim().notEmpty(),
      body('lastName').optional().trim().notEmpty(),
      body('status').optional().isIn(['ACTIVE', 'GRADUATED', 'DROPPED', 'SUSPENDED']),
    ],
    validateRequest,
    (req: Request, res: Response, next: NextFunction) => controller.updateStudent(req, res).catch(next),
  );

  api.use('/students', router);
}
