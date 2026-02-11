import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import type { AuthUser } from '@/api/auth.api';

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('setCredentials stores user and token in state and localStorage', () => {
    const store = useAuthStore();
    const user: AuthUser = {
      id: 'u1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'SCHOOL_ADMIN',
      tenantId: 't1',
      tenantIds: ['t1'],
    };

    store.setCredentials(user, 'token-123');

    expect(store.user).toEqual(user);
    expect(store.token).toBe('token-123');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(localStorage.getItem('jwt_token')).toBe('token-123');
  });

  it('clearCredentials clears state and localStorage', () => {
    const store = useAuthStore();
    const user: AuthUser = {
      id: 'u1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PROFESSOR',
      tenantId: 't1',
      tenantIds: ['t1'],
    };

    store.setCredentials(user, 'token-abc');
    store.clearCredentials();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('initAuth hydrates state from localStorage', () => {
    const storedUser: AuthUser = {
      id: 'u2',
      email: 'stored@example.com',
      firstName: 'Stored',
      lastName: 'User',
      role: 'PLATFORM_ADMIN',
      tenantId: 't-main',
      tenantIds: ['t-main'],
    };
    localStorage.setItem('user', JSON.stringify(storedUser));
    localStorage.setItem('jwt_token', 'stored-token');

    const store = useAuthStore();
    expect(store.user).toEqual(storedUser);
    expect(store.token).toBe('stored-token');

    // After clearing and re-running initAuth
    store.user = null;
    store.token = null;
    store.initAuth();

    expect(store.user).toEqual(storedUser);
    expect(store.token).toBe('stored-token');
  });
});

