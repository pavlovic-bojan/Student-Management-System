import { Router, Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { body, param, query } from 'express-validator';
import * as authService from './auth.service';
import { authenticate } from '../../middleware/authenticate';
import { requireCanCreateUser, requireAdminOrSchoolAdmin } from '../../middleware/requireAdminRole';
import { validateRequest } from '../../middleware/validateRequest';
import { ApiError } from '../../middleware/errorHandler';

export function registerAuthRoutes(api: Router): void {
  const router = Router();

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: List users for a tenant
   *     description: Platform Admin must pass tenantId query; School Admin uses own tenant. Only Platform Admin or School Admin.
   *     tags: [Auth, Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Required for Platform Admin; ignored for School Admin
   *     responses:
   *       200:
   *         description: List of users (id, email, firstName, lastName, role, tenantId, suspended, createdAt)
   *       400:
   *         description: Platform Admin did not provide tenantId
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Caller is not Platform Admin or School Admin
   */
  router.get(
    '/users',
    authenticate,
    requireAdminOrSchoolAdmin,
    [query('tenantId').optional().isUUID().withMessage('Valid tenantId required')],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const callerRole = req.user!.role;
        const tenantId =
          callerRole === 'PLATFORM_ADMIN'
            ? (req.query.tenantId as string | undefined)
            : req.user!.tenantId;
        if (callerRole === 'PLATFORM_ADMIN' && !tenantId) {
          return next(new ApiError('Platform Admin must provide tenantId query', 400));
        }
        const users = await authService.listUsers(tenantId!);
        res.json({ users });
      } catch (e: any) {
        next(e);
      }
    }
  );

  /**
   * @swagger
   * /api/users/platform-admins:
   *   get:
   *     summary: List all Platform Admin users
   *     description: Only callable by Platform Admin. Returns all users with role PLATFORM_ADMIN across all tenants.
   *     tags: [Auth, Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of Platform Admin users
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Caller is not Platform Admin
   */
  router.get(
    '/users/platform-admins',
    authenticate,
    requireAdminOrSchoolAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.user!.role !== 'PLATFORM_ADMIN') {
          return next(new ApiError('Only Platform Admin can list Platform Admin users', 403));
        }
        const users = await authService.listPlatformAdmins();
        res.json({ users });
      } catch (e: any) {
        next(e);
      }
    }
  );

  /**
   * @swagger
   * /api/users/{id}:
   *   patch:
   *     summary: Update user (edit, suspend)
   *     description: Platform Admin or School Admin; School Admin only for same tenant. Cannot set PLATFORM_ADMIN as School Admin.
   *     tags: [Auth, Users]
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
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [PLATFORM_ADMIN, SCHOOL_ADMIN, PROFESSOR, STUDENT]
   *               suspended:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Updated user
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Forbidden (e.g. School Admin editing other tenant or Platform Admin)
   *       404:
   *         description: User not found
   */
  router.patch(
    '/users/:id',
    authenticate,
    requireAdminOrSchoolAdmin,
    [
      param('id').isUUID().withMessage('Valid user id required'),
      body('firstName').optional().trim().notEmpty(),
      body('lastName').optional().trim().notEmpty(),
      body('role').optional().isIn(['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'PROFESSOR', 'STUDENT']),
      body('suspended').optional().isBoolean(),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const callerRole = req.user!.role;
        const changedFields = Object.keys(req.body).filter((k) =>
          ['firstName', 'lastName', 'role', 'suspended'].includes(k)
        );
        const user = await authService.updateUser(req.params.id, req.body, {
          role: callerRole,
          tenantId: req.user!.tenantId,
        });

        // If Platform Admin updated a user, notify School Admins of that tenant
        if (callerRole === 'PLATFORM_ADMIN') {
          await authService.createUserActionNotificationsForPlatformAdmins(
            req.user!.sub,
            callerRole as UserRole,
            'UPDATED',
            user.id,
            changedFields
          );
        }

        // If School Admin updated a user, notify that user
        if (callerRole === 'SCHOOL_ADMIN') {
          await authService.createUserEditedNotificationForUserBySchoolAdmin(
            req.user!.sub,
            user.id,
            changedFields
          );
        }

        res.json(user);
      } catch (e: any) {
        next(e);
      }
    }
  );

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete user
   *     description: Platform Admin or School Admin; School Admin only for same tenant. Cannot delete self or Platform Admin as School Admin.
   *     tags: [Auth, Users]
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
   *         description: User deleted
   *       400:
   *         description: Cannot delete your own account
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   */
  router.delete(
    '/users/:id',
    authenticate,
    requireAdminOrSchoolAdmin,
    [param('id').isUUID().withMessage('Valid user id required')],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await authService.deleteUser(req.params.id, {
          role: req.user!.role,
          tenantId: req.user!.tenantId,
          sub: req.user!.sub,
        });
        res.status(204).send();
      } catch (e: any) {
        next(e);
      }
    }
  );

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Create user (no public registration)
   *     description: Platform Admin any role/tenant; School Admin only SCHOOL_ADMIN/PROFESSOR/STUDENT in own tenant; Professor only STUDENT in own tenant(s).
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *               - role
   *               - tenantId
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 8
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [PLATFORM_ADMIN, SCHOOL_ADMIN, PROFESSOR, STUDENT]
   *               tenantId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: User created (returns user + token)
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Forbidden (e.g. Professor creating non-STUDENT, School Admin creating PLATFORM_ADMIN)
   *       404:
   *         description: Tenant not found
   *       409:
   *         description: Email already exists
   */
  router.post(
    '/auth/register',
    authenticate,
    requireCanCreateUser,
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('firstName').trim().notEmpty().withMessage('First name is required'),
      body('lastName').trim().notEmpty().withMessage('Last name is required'),
      body('role').isIn(['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'PROFESSOR', 'STUDENT']).withMessage('Invalid role'),
      body('tenantId').isUUID().withMessage('Valid tenant is required'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const callerRole = req.user!.role;
        const data = req.body as { email: string; password: string; firstName: string; lastName: string; role: string; tenantId: string };

        // Professor can only create students, and only for a tenant they belong to
        if (callerRole === 'PROFESSOR') {
          if (data.role !== 'STUDENT') {
            return next(new ApiError('Professor can only create students', 403));
          }
          const professorTenantIds = await authService.getTenantIdsForUser(req.user!.sub);
          if (!professorTenantIds.includes(data.tenantId)) {
            return next(new ApiError('Professor can only create students for their own institution(s)', 403));
          }
          const result = await authService.register({
            ...data,
            role: data.role as UserRole,
            tenantId: data.tenantId,
          });
          // No notifications for professor-created users (students only) per BRD.
          return res.status(201).json(result);
        }

        // School Admin cannot assign PLATFORM_ADMIN
        if (callerRole === 'SCHOOL_ADMIN' && data.role === 'PLATFORM_ADMIN') {
          return next(new ApiError('School Admin cannot create Platform Admin users', 403));
        }
        // School Admin can only create users in their own tenant
        const tenantId = callerRole === 'SCHOOL_ADMIN' ? req.user!.tenantId : data.tenantId;
        const result = await authService.register({
          ...data,
          role: data.role as UserRole,
          tenantId,
        });
        // If Platform Admin created a user, notify School Admins of that tenant
        if (callerRole === 'PLATFORM_ADMIN') {
          await authService.createUserActionNotificationsForPlatformAdmins(
            req.user!.sub,
            callerRole as UserRole,
            'CREATED',
            result.user.id,
            []
          );
        }
        res.status(201).json(result);
      } catch (e: any) {
        next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login
   *     description: Returns user and JWT. Returns 403 if account is suspended.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User and token
   *       401:
   *         description: Invalid email or password
   *       403:
   *         description: Account is suspended
   */
  router.post(
    '/auth/login',
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.login(req.body);
        res.json(result);
      } catch (e: any) {
        next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Forgot password
   *     tags: [Auth]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: Message (same whether email exists or not)
   */
  router.post(
    '/auth/forgot-password',
    [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.forgotPassword(req.body.email);
        res.json(result);
      } catch (e: any) {
        next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Current user
   *     description: Returns current user (including tenantIds for professors on multiple tenants).
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User object
   *       401:
   *         description: Missing or invalid token
   */
  router.get('/auth/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user!.sub);
      res.json({ user });
    } catch (e: any) {
      next(e);
    }
  });

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout (client should discard token)
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Message
   */
  router.post('/auth/logout', (_req: Request, res: Response) => {
    res.json({ message: 'Logged out' });
  });

  api.use(router);
}
