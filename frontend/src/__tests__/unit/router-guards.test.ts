import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  requireAuth,
  guestOnly,
  requireAdminOrSchoolAdmin,
  requireCanCreateUser,
} from '@/router/guards';

describe('router guards', () => {
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    next = vi.fn();
  });

  describe('requireAuth', () => {
    it('calls next() when authenticated', () => {
      const auth = useAuthStore();
      auth.user = {
        id: '1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        role: 'SCHOOL_ADMIN',
        tenantId: 't1',
        tenantIds: ['t1'],
      };
      auth.token = 'token';

      requireAuth(
        { fullPath: '/students' } as any,
        {} as any,
        next,
      );

      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('redirects to login with redirect query when not authenticated', () => {
      const auth = useAuthStore();
      auth.user = null;
      auth.token = null;

      requireAuth(
        { fullPath: '/students' } as any,
        {} as any,
        next,
      );

      expect(next).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/students' } });
    });
  });

  describe('guestOnly', () => {
    it('calls next() when not authenticated', () => {
      const auth = useAuthStore();
      auth.user = null;
      auth.token = null;

      guestOnly({ query: {} } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('redirects to redirect query or / when authenticated', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      guestOnly({ query: { redirect: '/profile' } } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith('/profile');
    });

    it('redirects to / when authenticated and no redirect query', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      guestOnly({ query: {} } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith('/');
    });
  });

  describe('requireAdminOrSchoolAdmin', () => {
    it('redirects to login when not authenticated', () => {
      const auth = useAuthStore();
      auth.user = null;
      auth.token = null;

      requireAdminOrSchoolAdmin({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/users' } });
    });

    it('calls next() when user is PLATFORM_ADMIN', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PLATFORM_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      requireAdminOrSchoolAdmin({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('calls next() when user is SCHOOL_ADMIN', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      requireAdminOrSchoolAdmin({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('redirects to tickets when user is PROFESSOR', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PROFESSOR', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      requireAdminOrSchoolAdmin({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith({ name: 'tickets' });
    });
  });

  describe('requireCanCreateUser', () => {
    it('calls next() when user is PROFESSOR', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PROFESSOR', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      requireCanCreateUser({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('redirects to tickets when user is STUDENT', () => {
      const auth = useAuthStore();
      auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'STUDENT', tenantId: 't1', tenantIds: ['t1'] };
      auth.token = 'token';

      requireCanCreateUser({ fullPath: '/users' } as any, {} as any, next);

      expect(next).toHaveBeenCalledWith({ name: 'tickets' });
    });
  });
});
