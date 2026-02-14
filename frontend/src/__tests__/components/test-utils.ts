import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import type { Component } from 'vue';
import { Quasar } from 'quasar';
import { i18n } from '@/i18n';
import { useAuthStore } from '@/stores/auth';

export function useTestPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export function useAuthenticatedAuth() {
  const auth = useAuthStore();
  auth.user = {
    id: '1',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'SCHOOL_ADMIN',
    tenantId: 't1',
    tenantIds: ['t1'],
  };
  auth.token = 'test-token';
  return auth;
}

export function createTestRouter(routes: { path: string; name?: string; component: Component }[]) {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.map((r) => ({
      path: r.path,
      name: r.name,
      component: r.component,
    })),
  });
}

export const globalPluginsBase = [Quasar, i18n];
