import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

const SALT_ROUNDS = 10;
const testTenantCode = `AUTH-TEST-${Date.now()}`;
const platformAdminEmail = `platform-${Date.now()}@auth-test.edu`;
const schoolAdminEmail = `school-${Date.now()}@auth-test.edu`;
const professorEmail = `prof-${Date.now()}@auth-test.edu`;
const studentEmail = `student-${Date.now()}@auth-test.edu`;
const password = 'password123';

describe('Auth & Users API (integration)', () => {
  let tenantId: string;
  let platformAdminId: string;
  let schoolAdminId: string;
  let professorId: string;
  let studentId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Auth Test Tenant', code: testTenantCode },
    });
    tenantId = tenant.id;

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const platform = await prisma.user.create({
      data: {
        email: platformAdminEmail,
        password: hashed,
        firstName: 'Platform',
        lastName: 'Admin',
        role: 'PLATFORM_ADMIN',
        tenantId,
      },
    });
    platformAdminId = platform.id;

    const school = await prisma.user.create({
      data: {
        email: schoolAdminEmail,
        password: hashed,
        firstName: 'School',
        lastName: 'Admin',
        role: 'SCHOOL_ADMIN',
        tenantId,
      },
    });
    schoolAdminId = school.id;

    const prof = await prisma.user.create({
      data: {
        email: professorEmail,
        password: hashed,
        firstName: 'Prof',
        lastName: 'User',
        role: 'PROFESSOR',
        tenantId,
      },
    });
    professorId = prof.id;

    const student = await prisma.user.create({
      data: {
        email: studentEmail,
        password: hashed,
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
        tenantId,
      },
    });
    studentId = student.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: platformAdminEmail, password })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ email: platformAdminEmail, role: 'PLATFORM_ADMIN' });
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: platformAdminEmail, password: 'wrong' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should return 401 for unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });

    it('should return 403 when account is suspended', async () => {
      await prisma.user.update({
        where: { id: schoolAdminId },
        data: { suspended: true },
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: schoolAdminEmail, password })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/suspended/i);
      await prisma.user.update({
        where: { id: schoolAdminId },
        data: { suspended: false },
      });
    });
  });

  describe('POST /api/auth/register', () => {
    const newUserEmail = `newuser-${Date.now()}@auth-test.edu`;

    it('should return 201 when Platform Admin creates user (test bypass)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', platformAdminId)
        .set('x-test-role', 'PLATFORM_ADMIN')
        .send({
          email: newUserEmail,
          password: 'pass12345',
          firstName: 'New',
          lastName: 'User',
          role: 'STUDENT',
          tenantId,
        });
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ email: newUserEmail, role: 'STUDENT' });
      expect(res.body.token).toBeDefined();
    });

    it('should return 409 when email already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', platformAdminId)
        .set('x-test-role', 'PLATFORM_ADMIN')
        .send({
          email: newUserEmail,
          password: 'pass12345',
          firstName: 'Other',
          lastName: 'User',
          role: 'STUDENT',
          tenantId,
        });
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should return 403 when School Admin tries to create PLATFORM_ADMIN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN')
        .send({
          email: `other-${Date.now()}@test.edu`,
          password: 'pass12345',
          firstName: 'A',
          lastName: 'B',
          role: 'PLATFORM_ADMIN',
          tenantId,
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot create Platform Admin/i);
    });

    it('should return 403 when Professor tries to create non-STUDENT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', professorId)
        .set('x-test-role', 'PROFESSOR')
        .send({
          email: `prof-created-${Date.now()}@test.edu`,
          password: 'pass12345',
          firstName: 'A',
          lastName: 'B',
          role: 'PROFESSOR',
          tenantId,
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only create students/i);
    });
  });

  describe('GET /api/users', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should return 403 when caller is PROFESSOR', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', professorId)
        .set('x-test-role', 'PROFESSOR')
        .query({ tenantId });
      expect(res.status).toBe(403);
    });

    it('should return 200 and users when Platform Admin with tenantId', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', platformAdminId)
        .set('x-test-role', 'PLATFORM_ADMIN')
        .query({ tenantId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
      expect(res.body.users[0]).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        role: expect.any(String),
        tenantId,
        suspended: expect.any(Boolean),
        createdAt: expect.any(String),
      });
    });

    it('should return 200 when School Admin (uses own tenant)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should return 400 when Platform Admin omits tenantId', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', platformAdminId)
        .set('x-test-role', 'PLATFORM_ADMIN');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/tenantId/i);
    });
  });

  describe('GET /api/users/platform-admins', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/users/platform-admins');
      expect(res.status).toBe(401);
    });

    it('should return 403 when caller is SCHOOL_ADMIN', async () => {
      const res = await request(app)
        .get('/api/users/platform-admins')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN');
      expect(res.status).toBe(403);
    });

    it('should return 200 and list Platform Admin users when caller is PLATFORM_ADMIN', async () => {
      const res = await request(app)
        .get('/api/users/platform-admins')
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', platformAdminId)
        .set('x-test-role', 'PLATFORM_ADMIN');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(
        res.body.users.some(
          (u: any) => u.email === platformAdminEmail && u.role === 'PLATFORM_ADMIN'
        )
      ).toBe(true);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).patch(`/api/users/${studentId}`).send({ firstName: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('should return 200 and updated user when School Admin edits same-tenant user', async () => {
      const res = await request(app)
        .patch(`/api/users/${studentId}`)
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN')
        .send({ firstName: 'StudentUpdated' });
      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('StudentUpdated');
      expect(res.body.suspended).toBeDefined();
      await prisma.user.update({
        where: { id: studentId },
        data: { firstName: 'Student' },
      });
    });

    it('should return 200 when updating suspended flag', async () => {
      const res = await request(app)
        .patch(`/api/users/${studentId}`)
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN')
        .send({ suspended: true });
      expect(res.status).toBe(200);
      expect(res.body.suspended).toBe(true);
      await prisma.user.update({
        where: { id: studentId },
        data: { suspended: false },
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    let deleteTargetId: string;

    beforeAll(async () => {
      const hashed = await bcrypt.hash('pass12345', SALT_ROUNDS);
      const target = await prisma.user.create({
        data: {
          email: `delete-target-${Date.now()}@test.edu`,
          password: hashed,
          firstName: 'Delete',
          lastName: 'Target',
          role: 'STUDENT',
          tenantId,
        },
      });
      deleteTargetId = target.id;
    });

    it('should return 400 when deleting own account', async () => {
      const res = await request(app)
        .delete(`/api/users/${schoolAdminId}`)
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot delete your own/i);
    });

    it('should return 204 when School Admin deletes same-tenant user', async () => {
      const res = await request(app)
        .delete(`/api/users/${deleteTargetId}`)
        .set('x-test-tenant-id', tenantId)
        .set('x-test-user-id', schoolAdminId)
        .set('x-test-role', 'SCHOOL_ADMIN');
      expect(res.status).toBe(204);
      const gone = await prisma.user.findUnique({ where: { id: deleteTargetId } });
      expect(gone).toBeNull();
    });
  });
});
