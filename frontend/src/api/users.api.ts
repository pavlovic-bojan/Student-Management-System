import { api } from './client';
import type { UserRole } from './auth.api';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  suspended: boolean;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  suspended?: boolean;
}

export const usersApi = {
  list(tenantId?: string): Promise<{ users: UserListItem[] }> {
    const params = tenantId ? { tenantId } : {};
    return api.get<{ users: UserListItem[] }>('/users', { params }).then((r) => r.data);
  },

  listPlatformAdmins(): Promise<{ users: UserListItem[] }> {
    return api.get<{ users: UserListItem[] }>('/users/platform-admins').then((r) => r.data);
  },

  update(id: string, data: UpdateUserRequest): Promise<UserListItem> {
    return api.patch<UserListItem>(`/users/${id}`, data).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`/users/${id}`);
  },
};
