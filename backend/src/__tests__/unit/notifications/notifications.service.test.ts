import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notificationsService from '../../../modules/notifications/notifications.service';
import { prisma } from '../../../prisma/client';

vi.mock('../../../prisma/client', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('notifications.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listNotificationsForUser', () => {
    it('should list unread notifications for user', async () => {
      const now = new Date('2025-01-01T10:00:00Z');
      vi.mocked(prisma.notification.findMany).mockResolvedValue([
        {
          id: 'n1',
          userId: 'u1',
          type: 'USER_ACTION',
          action: 'UPDATED',
          targetEmail: 'user@test.com',
          actorRole: 'PLATFORM_ADMIN',
          actorName: 'Platform Admin',
          tenantName: 'Tenant 1',
          changedFields: ['firstName'],
          createdAt: now,
          read: false,
        } as any,
      ]);

      const result = await notificationsService.listNotificationsForUser('u1', true);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', read: false },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'n1',
        type: 'USER_ACTION',
        action: 'UPDATED',
        targetEmail: 'user@test.com',
        actorRole: 'PLATFORM_ADMIN',
        actorName: 'Platform Admin',
        tenantName: 'Tenant 1',
        changedFields: ['firstName'],
        read: false,
      });
      expect(result[0].createdAt).toBe(now.toISOString());
    });
  });

  describe('markNotificationsRead', () => {
    it('should update notifications as read', async () => {
      await notificationsService.markNotificationsRead('u1', ['n1', 'n2']);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'u1',
          id: { in: ['n1', 'n2'] },
          read: false,
        },
        data: { read: true },
      });
    });
  });
});

