import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../middleware/errorHandler';
import type { LoginRequest, RegisterRequest, AuthUserResponse, UserListItem, UpdateUserRequest } from './auth.dto';

const SALT_ROUNDS = 10;

function toAuthUser(
  user: { id: string; email: string; firstName: string; lastName: string; role: UserRole; tenantId: string },
  tenantIds?: string[]
): AuthUserResponse {
  const res: AuthUserResponse = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    tenantId: user.tenantId,
  };
  if (tenantIds && tenantIds.length > 0) res.tenantIds = tenantIds;
  return res;
}

function signToken(userId: string, tenantId: string, role: string): string {
  return jwt.sign(
    { sub: userId, tenantId, role },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

export async function register(data: RegisterRequest): Promise<{ user: AuthUserResponse; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError('User with this email already exists', 409);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: data.tenantId } });
  if (!tenant) {
    throw new ApiError('Tenant not found', 404);
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      tenantId: data.tenantId,
    },
  });

  const authUser = toAuthUser(user);
  const token = signToken(user.id, user.tenantId, user.role);
  return { user: authUser, token };
}

export async function login(data: LoginRequest): Promise<{ user: AuthUserResponse; token: string }> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { userTenants: { select: { tenantId: true } } },
  });
  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    throw new ApiError('Invalid email or password', 401);
  }
  if (user.suspended) {
    throw new ApiError('Account is suspended', 403);
  }

  const tenantIds = [user.tenantId, ...user.userTenants.map((ut: { tenantId: string }) => ut.tenantId)];
  const { password: _p, userTenants, ...rest } = user;
  const authUser = toAuthUser(rest, tenantIds);
  const token = signToken(user.id, user.tenantId, user.role);
  return { user: authUser, token };
}

/** Returns all tenant IDs the user belongs to (primary + UserTenant). */
export async function getTenantIdsForUser(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true, userTenants: { select: { tenantId: true } } },
  });
  if (!user) return [];
  const ids = new Set<string>([user.tenantId, ...user.userTenants.map((ut: { tenantId: string }) => ut.tenantId)]);
  return Array.from(ids);
}

export async function getMe(userId: string): Promise<AuthUserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      userTenants: { select: { tenantId: true } },
    },
  });
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const tenantIds = [user.tenantId, ...user.userTenants.map((ut: { tenantId: string }) => ut.tenantId)];
  const { userTenants, ...rest } = user;
  return toAuthUser(rest, tenantIds);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  // For now: always return same message (don't reveal if email exists)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // TODO: send reset email, store reset token
  }
  return { message: 'If an account with that email exists, a password reset link has been sent.' };
}

export async function createUserActionNotificationsForPlatformAdmins(
  actorId: string,
  actorRole: UserRole,
  action: 'CREATED' | 'UPDATED' | 'DELETED',
  targetUserId: string,
  changedFields: string[] = []
): Promise<void> {
  if (actorRole !== 'PLATFORM_ADMIN') return;

  const [actor, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: actorId },
      select: { firstName: true, lastName: true, role: true },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, tenantId: true },
    }),
  ]);

  if (!actor || !target) return;

  const tenant = await prisma.tenant.findUnique({
    where: { id: target.tenantId },
    select: { name: true },
  });

  const actorName = [actor.firstName, actor.lastName].filter(Boolean).join(' ') || null;
  const tenantName = tenant?.name ?? null;

  const schoolAdmins = await prisma.user.findMany({
    where: { tenantId: target.tenantId, role: 'SCHOOL_ADMIN', suspended: false },
    select: { id: true },
  });

  if (schoolAdmins.length === 0) return;

  await prisma.notification.createMany({
    data: schoolAdmins.map((sa) => ({
      userId: sa.id,
      type: 'USER_ACTION',
      action,
      targetEmail: target.email,
      actorRole: actor.role,
      actorName,
      tenantName,
      changedFields,
    })),
  });
}

export async function createUserEditedNotificationForUserBySchoolAdmin(
  actorId: string,
  targetUserId: string,
  changedFields: string[] = []
): Promise<void> {
  const [actor, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: actorId },
      select: { firstName: true, lastName: true, role: true, tenantId: true },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, tenantId: true },
    }),
  ]);

  if (!actor || !target) return;
  if (actor.role !== 'SCHOOL_ADMIN') return;

  const tenant = await prisma.tenant.findUnique({
    where: { id: target.tenantId },
    select: { name: true },
  });

  const actorName = [actor.firstName, actor.lastName].filter(Boolean).join(' ') || null;
  const tenantName = tenant?.name ?? null;

  await prisma.notification.create({
    data: {
      userId: target.id,
      type: 'USER_ACTION',
      action: 'UPDATED',
      targetEmail: target.email,
      actorRole: actor.role,
      actorName,
      tenantName,
      changedFields,
    },
  });
}

/** List users for a tenant. Platform Admin can pass any tenantId; School Admin only their own. */
export async function listUsers(tenantId: string): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      NOT: { role: 'PLATFORM_ADMIN' },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      suspended: true,
      createdAt: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });
  return users.map(
    (u: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      tenantId: string;
      suspended: boolean;
      createdAt: Date;
    }) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })
  );
}

/** List all Platform Admin users (only for Platform Admin callers). */
export async function listPlatformAdmins(): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    where: {
      role: 'PLATFORM_ADMIN',
      // Exclude test-only ticket users (non-UUID ids) from real admin list
      email: {
        notIn: ['tickets1@example.com', 'tickets3@example.com'],
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      suspended: true,
      createdAt: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });
  return users.map((u: { id: string; email: string; firstName: string; lastName: string; role: UserRole; tenantId: string; suspended: boolean; createdAt: Date }) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
}

/** Update user. Caller must be Platform Admin or School Admin; School Admin only for same tenant. */
export async function updateUser(
  userId: string,
  data: UpdateUserRequest,
  caller: { role: string; tenantId: string }
): Promise<UserListItem> {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new ApiError('User not found', 404);
  if (caller.role === 'SCHOOL_ADMIN' && target.tenantId !== caller.tenantId) {
    throw new ApiError('You can only edit users of your institution', 403);
  }
  if (target.role === 'PLATFORM_ADMIN' && caller.role !== 'PLATFORM_ADMIN') {
    throw new ApiError('Cannot edit Platform Admin', 403);
  }
  if (data.role !== undefined) {
    if (caller.role === 'SCHOOL_ADMIN' && data.role === 'PLATFORM_ADMIN') {
      throw new ApiError('School Admin cannot assign Platform Admin role', 403);
    }
    if (data.role && !['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'PROFESSOR', 'STUDENT'].includes(data.role)) {
      throw new ApiError('Invalid role', 400);
    }
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.role !== undefined && { role: data.role as UserRole }),
      ...(data.suspended !== undefined && { suspended: data.suspended }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      suspended: true,
      createdAt: true,
    },
  });
  return { ...updated, createdAt: updated.createdAt.toISOString() };
}

/** Delete user. Caller must be Platform Admin or School Admin; School Admin only for same tenant. */
export async function deleteUser(
  userId: string,
  caller: { role: string; tenantId: string; sub: string }
): Promise<void> {
  if (userId === caller.sub) throw new ApiError('You cannot delete your own account', 400);
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new ApiError('User not found', 404);
  if (caller.role === 'SCHOOL_ADMIN' && target.tenantId !== caller.tenantId) {
    throw new ApiError('You can only delete users of your institution', 403);
  }
  if (target.role === 'PLATFORM_ADMIN' && caller.role !== 'PLATFORM_ADMIN') {
    throw new ApiError('Cannot delete Platform Admin', 403);
  }
  await createUserActionNotificationsForPlatformAdmins(
    caller.sub,
    caller.role as UserRole,
    'DELETED',
    userId
  );
  await prisma.user.delete({ where: { id: userId } });
}
