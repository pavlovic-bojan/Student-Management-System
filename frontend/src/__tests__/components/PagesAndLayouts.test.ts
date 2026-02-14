import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Quasar } from 'quasar';
import { i18n } from '@/i18n';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      post: vi.fn().mockResolvedValue({ data: { data: null } }),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    }),
  },
}));
import AuthLayout from '@/layouts/AuthLayout.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import LoginPage from '@/pages/auth/LoginPage.vue';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue';
import RegisterPage from '@/pages/auth/RegisterPage.vue';
import StudentsPage from '@/pages/StudentsPage.vue';
import UsersPage from '@/pages/users/UsersPage.vue';
import ProgramsPage from '@/pages/ProgramsPage.vue';
import TenantsPage from '@/pages/TenantsPage.vue';
import CoursesPage from '@/pages/CoursesPage.vue';
import ExamsPage from '@/pages/ExamsPage.vue';
import FinancePage from '@/pages/FinancePage.vue';
import RecordsPage from '@/pages/RecordsPage.vue';
import TicketsPage from '@/pages/TicketsPage.vue';
import NotificationsPage from '@/pages/NotificationsPage.vue';
import BugReportPage from '@/pages/BugReportPage.vue';
import ProfilePage from '@/pages/ProfilePage.vue';

const basePlugins = [Quasar, i18n];

async function mountWithRouter(component: any, routePath: string, pinia?: ReturnType<typeof createPinia>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: routePath, name: 'test', component }],
  });
  await router.push(routePath);
  const plugins = pinia ? [...basePlugins, router, pinia] : [...basePlugins, router];
  return mount(component, {
    global: {
      plugins,
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

describe('AuthLayout', () => {
  it('mounts without error', async () => {
    const child = { template: '<div>Child</div>' };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/auth',
          component: AuthLayout,
          children: [{ path: 'login', component: child }],
        },
      ],
    });
    await router.push('/auth/login');
    const wrapper = mount(AuthLayout, {
      global: {
        plugins: [...basePlugins, router],
      },
    });
    expect(wrapper.findComponent(AuthLayout).exists()).toBe(true);
  });
});

describe('LoginPage', () => {
  it('mounts and shows login form', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = await mountWithRouter(LoginPage, '/auth/login', pinia);
    expect(wrapper.find('[data-test="login-form"]').exists()).toBe(true);
  });
});

describe('ForgotPasswordPage', () => {
  it('mounts without error', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = await mountWithRouter(ForgotPasswordPage, '/auth/forgot-password', pinia);
    expect(wrapper.find('form').exists()).toBe(true);
  });
});

describe('RegisterPage', () => {
  it('mounts without error', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = await mountWithRouter(RegisterPage, '/auth/register', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('MainLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
  });

  it('mounts and shows sidebar', async () => {
    const home = { template: '<div>Home</div>' };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: MainLayout,
          children: [{ path: '', component: home }],
        },
      ],
    });
    await router.push('/');
    const pinia = createPinia();
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [...basePlugins, router, pinia],
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });
    expect(wrapper.find('[data-test="sidebar"]').exists()).toBe(true);
  });
});

describe('StudentsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(StudentsPage, '/students', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('UsersPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(UsersPage, '/users', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('ProgramsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(ProgramsPage, '/programs', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('TenantsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PLATFORM_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(TenantsPage, '/tenants', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('CoursesPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(CoursesPage, '/courses', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('ExamsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(ExamsPage, '/exams', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('FinancePage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(FinancePage, '/finance', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('RecordsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(RecordsPage, '/records', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('TicketsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(TicketsPage, '/', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('NotificationsPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(NotificationsPage, '/notifications', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('BugReportPage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(BugReportPage, '/bug-report', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('ProfilePage', () => {
  let pinia: ReturnType<typeof createPinia>;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
  });

  it('mounts without error', async () => {
    const wrapper = await mountWithRouter(ProfilePage, '/profile', pinia);
    expect(wrapper.exists()).toBe(true);
  });
});
