import { prisma } from '../../prisma/client';
import type { NotificationDto, NotificationAction } from './notifications.dto';
import type { UserRole } from '@prisma/client';

export async function listNotificationsForUser(
  userId: string,
  unreadOnly: boolean = true
): Promise<NotificationDto[]> {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(
    (n: {
      id: string;
      userId: string;
      type: string;
      action: string;
      targetEmail: string | null;
      actorRole: UserRole | null;
      actorName: string | null;
      tenantName: string | null;
      changedFields: string[];
      createdAt: Date;
      read: boolean;
    }): NotificationDto => ({
      id: n.id,
      type: 'USER_ACTION',
      action: n.action as NotificationAction,
      targetEmail: n.targetEmail,
      actorRole: n.actorRole,
      actorName: n.actorName,
      tenantName: n.tenantName,
      changedFields: n.changedFields ?? [],
      createdAt: n.createdAt.toISOString(),
      read: n.read,
    })
  );
}

export async function markNotificationsRead(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.notification.updateMany({
    where: {
      userId,
      id: { in: ids },
      read: false,
    },
    data: { read: true },
  });
}

