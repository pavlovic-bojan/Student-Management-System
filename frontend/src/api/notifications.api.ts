import { api } from './client';

export type NotificationAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface UserActionNotification {
  id: string;
  type: 'USER_ACTION';
  action: NotificationAction;
  targetEmail?: string | null;
  actorRole?: string | null;
  actorName?: string | null;
  tenantName?: string | null;
  changedFields?: string[];
  createdAt: string;
  read: boolean;
}

export const notificationsApi = {
  async list(unreadOnly: boolean = true): Promise<{ notifications: UserActionNotification[] }> {
    return api
      .get<{ notifications: UserActionNotification[] }>('/notifications', {
        params: { unreadOnly },
      })
      .then((r) => r.data);
  },

  async markRead(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await api.post('/notifications/mark-read', { ids });
  },
};

