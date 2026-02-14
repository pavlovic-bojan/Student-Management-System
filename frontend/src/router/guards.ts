import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function requireAuth(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (auth.isAuthenticated) {
    next();
  } else {
    next({ name: 'login', query: { redirect: _to.fullPath } });
  }
}

/** Only Platform Admin can access (e.g. tenant management) */
export function requirePlatformAdmin(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    next();
  } else {
    next({ name: 'tickets' });
  }
}

/** Only Platform Admin or School Admin can access */
export function requireAdminOrSchoolAdmin(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  const role = auth.user?.role;
  if (role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN') {
    next();
  } else {
    next({ name: 'tickets' });
  }
}

/** Platform Admin, School Admin, or Professor can access (e.g. create user / create student) */
export function requireCanCreateUser(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  const role = auth.user?.role;
  if (role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'PROFESSOR') {
    next();
  } else {
    next({ name: 'tickets' });
  }
}

export function guestOnly(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  if (auth.isAuthenticated) {
    const redirectPath = (_to.query.redirect as string) || '/';
    next(redirectPath);
  } else {
    next();
  }
}
