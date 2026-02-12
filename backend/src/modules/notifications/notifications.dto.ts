import type { UserRole } from '@prisma/client';

export type NotificationAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface NotificationDto {
  id: string;
  type: 'USER_ACTION';
  action: NotificationAction;
  targetEmail?: string | null;
  actorRole?: UserRole | null;
  actorName?: string | null;
  tenantName?: string | null;
  changedFields?: string[];
  createdAt: string;
  read: boolean;
}

