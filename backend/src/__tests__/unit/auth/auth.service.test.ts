import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../../modules/auth/auth.service';
import { prisma } from '../../../prisma/client';
import bcrypt from 'bcrypt';

vi.mock('../../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed-${password}`)),
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('../../../config/env', () => ({
  env: { jwtSecret: 'test-jwt-secret-min-32-chars-long' },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should throw 409 when email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'existing@test.com',
        password: 'x',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ id: 't1', name: 'T', code: 'T' } as any);

      await expect(
        authService.register({
          email: 'existing@test.com',
          password: 'pass12345',
          firstName: 'X',
          lastName: 'Y',
          role: 'STUDENT',
          tenantId: 't1',
        })
      ).rejects.toMatchObject({ statusCode: 409, message: /already exists/ });

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw 404 when tenant not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null);

      await expect(
        authService.register({
          email: 'new@test.com',
          password: 'pass12345',
          firstName: 'X',
          lastName: 'Y',
          role: 'STUDENT',
          tenantId: 't-none',
        })
      ).rejects.toMatchObject({ statusCode: 404, message: /Tenant not found/ });

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should create user and return user + token when valid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ id: 't1', name: 'T', code: 'T' } as any);
      const created = {
        id: 'u-new',
        email: 'new@test.com',
        password: 'hashed-pass12345',
        firstName: 'X',
        lastName: 'Y',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.user.create).mockResolvedValue(created as any);

      const result = await authService.register({
        email: 'new@test.com',
        password: 'pass12345',
        firstName: 'X',
        lastName: 'Y',
        role: 'STUDENT',
        tenantId: 't1',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@test.com',
          firstName: 'X',
          lastName: 'Y',
          role: 'STUDENT',
          tenantId: 't1',
        }),
      });
      expect(result.user).toMatchObject({ id: 'u-new', email: 'new@test.com', role: 'STUDENT', tenantId: 't1' });
      expect(result.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw 401 when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@test.com', password: 'pass' })
      ).rejects.toMatchObject({ statusCode: 401, message: /Invalid email or password/ });
    });

    it('should throw 401 when password invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'u@test.com',
        password: 'hashed',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userTenants: [],
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ email: 'u@test.com', password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401, message: /Invalid email or password/ });
    });

    it('should throw 403 when account is suspended', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'u@test.com',
        password: 'hashed',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userTenants: [],
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        authService.login({ email: 'u@test.com', password: 'pass' })
      ).rejects.toMatchObject({ statusCode: 403, message: /suspended/ });
    });

    it('should return user + token when valid and not suspended', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        email: 'u@test.com',
        password: 'hashed',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userTenants: [],
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.login({ email: 'u@test.com', password: 'pass' });
      expect(result.user).toMatchObject({ id: 'u1', email: 'u@test.com', role: 'STUDENT', tenantId: 't1' });
      expect(result.token).toBeDefined();
    });
  });

  describe('listUsers', () => {
    it('should return users for tenant', async () => {
      const users = [
        {
          id: 'u1',
          email: 'a@test.com',
          firstName: 'A',
          lastName: 'B',
          role: 'STUDENT',
          tenantId: 't1',
          suspended: false,
          createdAt: new Date('2025-01-01'),
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(users as any);

      const result = await authService.listUsers('t1');
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1', NOT: { role: 'PLATFORM_ADMIN' } },
        select: expect.any(Object),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'u1', email: 'a@test.com', suspended: false });
      expect(result[0].createdAt).toBe(new Date('2025-01-01').toISOString());
    });
  });

  describe('listPlatformAdmins', () => {
    it('should return all Platform Admin users', async () => {
      const users = [
        {
          id: 'pa1',
          email: 'platform1@test.com',
          firstName: 'Platform',
          lastName: 'One',
          role: 'PLATFORM_ADMIN',
          tenantId: 't1',
          suspended: false,
          createdAt: new Date('2025-01-02'),
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(users as any);

      const result = await authService.listPlatformAdmins();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'PLATFORM_ADMIN',
          email: {
            notIn: ['tickets1@example.com', 'tickets3@example.com'],
          },
        },
        select: expect.any(Object),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'pa1', role: 'PLATFORM_ADMIN' });
      expect(result[0].createdAt).toBe(new Date('2025-01-02').toISOString());
    });
  });

  describe('updateUser', () => {
    it('should throw 404 when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.updateUser('u-none', { firstName: 'X' }, { role: 'PLATFORM_ADMIN', tenantId: 't1' })
      ).rejects.toMatchObject({ statusCode: 404, message: /User not found/ });
    });

    it('should throw 403 when School Admin edits user from other tenant', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u2',
        tenantId: 't-other',
        role: 'STUDENT',
      } as any);

      await expect(
        authService.updateUser('u2', { firstName: 'X' }, { role: 'SCHOOL_ADMIN', tenantId: 't1' })
      ).rejects.toMatchObject({ statusCode: 403, message: /your institution/ });
    });

    it('should update and return user when allowed', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u1',
        tenantId: 't1',
        role: 'STUDENT',
      } as any);
      const updated = {
        id: 'u1',
        email: 'u@test.com',
        firstName: 'New',
        lastName: 'Name',
        role: 'STUDENT',
        tenantId: 't1',
        suspended: false,
        createdAt: new Date('2025-01-01'),
      };
      vi.mocked(prisma.user.update).mockResolvedValue(updated as any);

      const result = await authService.updateUser(
        'u1',
        { firstName: 'New', lastName: 'Name' },
        { role: 'SCHOOL_ADMIN', tenantId: 't1' }
      );
      expect(result).toMatchObject({ firstName: 'New', lastName: 'Name' });
      expect(result.createdAt).toBe(updated.createdAt.toISOString());
    });
  });

  describe('deleteUser', () => {
    it('should throw 400 when deleting own account', async () => {
      await expect(
        authService.deleteUser('u1', { role: 'PLATFORM_ADMIN', tenantId: 't1', sub: 'u1' })
      ).rejects.toMatchObject({ statusCode: 400, message: /cannot delete your own/ });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should throw 404 when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.deleteUser('u-none', { role: 'PLATFORM_ADMIN', tenantId: 't1', sub: 'other' })
      ).rejects.toMatchObject({ statusCode: 404, message: /User not found/ });
    });

    it('should throw 403 when School Admin deletes user from other tenant', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u2',
        tenantId: 't-other',
        role: 'STUDENT',
      } as any);

      await expect(
        authService.deleteUser('u2', { role: 'SCHOOL_ADMIN', tenantId: 't1', sub: 'u1' })
      ).rejects.toMatchObject({ statusCode: 403, message: /your institution/ });
    });

    it('should delete user when allowed', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u2',
        tenantId: 't1',
        role: 'STUDENT',
      } as any);
      vi.mocked(prisma.user.delete).mockResolvedValue({} as any);

      await authService.deleteUser('u2', { role: 'SCHOOL_ADMIN', tenantId: 't1', sub: 'u1' });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u2' } });
    });
  });

  describe('createUserActionNotificationsForPlatformAdmins', () => {
    it('should not create notifications when actor is not Platform Admin', async () => {
      await authService.createUserActionNotificationsForPlatformAdmins(
        'actor-id',
        'SCHOOL_ADMIN',
        'CREATED',
        'target-id',
        [],
      );
      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });
  });
});
