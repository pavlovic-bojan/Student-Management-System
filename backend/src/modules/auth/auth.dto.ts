import { UserRole } from '@prisma/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  /** All tenant IDs the user belongs to (primary + additional). Used e.g. by professors on multiple universities. */
  tenantIds?: string[];
}

export interface LoginResponse {
  user: AuthUserResponse;
  token: string;
}

/** User list item (no password). */
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
