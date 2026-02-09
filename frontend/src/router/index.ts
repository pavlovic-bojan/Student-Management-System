import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DashboardPage from '@/pages/DashboardPage.vue';
import StudentsPage from '@/pages/StudentsPage.vue';
import ProgramsPage from '@/pages/ProgramsPage.vue';
import CoursesPage from '@/pages/CoursesPage.vue';
import ExamsPage from '@/pages/ExamsPage.vue';
import FinancePage from '@/pages/FinancePage.vue';
import RecordsPage from '@/pages/RecordsPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/students',
    name: 'students',
    component: StudentsPage,
  },
  {
    path: '/programs',
    name: 'programs',
    component: ProgramsPage,
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesPage,
  },
  {
    path: '/exams',
    name: 'exams',
    component: ExamsPage,
  },
  {
    path: '/finance',
    name: 'finance',
    component: FinancePage,
  },
  {
    path: '/records',
    name: 'records',
    component: RecordsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

