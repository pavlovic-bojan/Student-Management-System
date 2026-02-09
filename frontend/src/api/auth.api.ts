import { api } from './client';

export type UserRole = 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'PROFESSOR' | 'STUDENT';

export interface AuthUser {
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
  user: AuthUser;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<{ user: AuthUser }>('/auth/me');
    return response.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
