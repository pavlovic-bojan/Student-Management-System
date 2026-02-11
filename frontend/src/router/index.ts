import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { requireAuth, guestOnly, requireCanCreateUser, requireAdminOrSchoolAdmin } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    beforeEnter: guestOnly,
    children: [
      { path: '', redirect: { name: 'login' } },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('@/pages/StudentsPage.vue'),
      },
      {
        path: 'programs',
        name: 'programs',
        component: () => import('@/pages/ProgramsPage.vue'),
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/pages/CoursesPage.vue'),
      },
      {
        path: 'exams',
        name: 'exams',
        component: () => import('@/pages/ExamsPage.vue'),
      },
      {
        path: 'finance',
        name: 'finance',
        component: () => import('@/pages/FinancePage.vue'),
      },
      {
        path: 'records',
        name: 'records',
        component: () => import('@/pages/RecordsPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/pages/users/UsersPage.vue'),
        beforeEnter: requireAdminOrSchoolAdmin,
      },
      {
        path: 'users/create',
        name: 'create-user',
        component: () => import('@/pages/users/CreateUserPage.vue'),
        beforeEnter: requireCanCreateUser,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
