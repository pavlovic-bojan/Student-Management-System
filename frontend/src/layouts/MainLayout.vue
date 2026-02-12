<template>
  <q-layout view="hHh Lpr fFf" class="app-layout">
    <!-- Sidebar (same pattern as Park: drawer first, header inside page-container) -->
    <q-drawer
      v-model="ui.leftDrawerOpen"
      :width="280"
      :breakpoint="999"
      bordered
      :behavior="$q.screen.width < 999 ? 'mobile' : 'desktop'"
      :persistent="$q.screen.width < 999"
      side="left"
      class="app-nav-drawer"
      data-test="sidebar"
    >
      <!-- Close button (only on mobile/tablet) -->
      <div v-if="$q.screen.width < 999" class="q-pa-md">
        <q-btn
          flat
          round
          icon="close"
          aria-label="Zatvori meni"
          @click="ui.closeLeftDrawer"
          size="lg"
          style="min-width: 56px; min-height: 56px; width: 56px; height: 56px;"
          data-test="button-close-sidebar"
        />
      </div>

      <q-list padding class="app-nav-list">
        <q-item-label header class="app-nav-header">{{ t('nav.title') }}</q-item-label>

        <q-item clickable v-ripple to="/" active-class="app-nav-item-active" data-test="nav-tickets" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>{{ t('nav.tickets') }}</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'notifications' }"
          active-class="app-nav-item-active"
          data-test="nav-notifications"
          class="app-nav-item"
        >
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>{{ t('nav.notifications') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/finance" active-class="app-nav-item-active" data-test="nav-finance" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>
          <q-item-section>{{ t('nav.finance') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/students" active-class="app-nav-item-active" data-test="nav-students" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>{{ t('nav.students') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/programs" active-class="app-nav-item-active" data-test="nav-programs" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>{{ t('nav.programs') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/courses" active-class="app-nav-item-active" data-test="nav-courses" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="menu_book" />
          </q-item-section>
          <q-item-section>{{ t('nav.courses') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/exams" active-class="app-nav-item-active" data-test="nav-exams" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="quiz" />
          </q-item-section>
          <q-item-section>{{ t('nav.exams') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/records" active-class="app-nav-item-active" data-test="nav-records" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>{{ t('nav.records') }}</q-item-section>
        </q-item>

        <q-item
          v-if="auth.user?.role === 'PLATFORM_ADMIN' || auth.user?.role === 'SCHOOL_ADMIN'"
          clickable
          v-ripple
          to="/users"
          active-class="app-nav-item-active"
          data-test="nav-users"
          class="app-nav-item"
        >
          <q-item-section avatar>
            <q-icon name="manage_accounts" />
          </q-item-section>
          <q-item-section>{{ t('nav.users') }}</q-item-section>
        </q-item>

        <q-item
          v-if="auth.user?.role === 'SCHOOL_ADMIN' || auth.user?.role === 'PROFESSOR'"
          clickable
          v-ripple
          to="/users/create"
          active-class="app-nav-item-active"
          data-test="nav-create-user"
          class="app-nav-item"
        >
          <q-item-section avatar>
            <q-icon name="person_add" />
          </q-item-section>
          <q-item-section>{{ auth.user?.role === 'PROFESSOR' ? t('nav.createStudent') : t('nav.createUser') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- Header inside page-container (full width of content area, right of sidebar) -->
      <q-header elevated bordered>
        <q-toolbar class="app-toolbar">
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Meni"
            class="q-mr-sm"
            @click="ui.toggleLeftDrawer"
            data-test="button-mobile-menu"
          />
          <q-toolbar-title class="app-toolbar-title">
            <img
              src="/logo.png"
              alt="Student SMS logo"
              class="app-logo"
              data-test="app-logo"
            />
            <span class="app-title-text">{{ t('appTitle') }}</span>
          </q-toolbar-title>

          <q-space />

          <!-- Language (left-most on the right side) -->
          <q-btn-dropdown
            flat
            dense
            no-icon-animation
            class="app-locale-btn"
            data-test="locale-menu"
          >
            <template #label>
              <span>{{ currentLocale.flag }}</span>
              <span v-if="currentLocale.short" class="q-ml-xs">{{ currentLocale.short }}</span>
            </template>
            <q-list class="q-pa-xs">
              <q-item
                v-for="opt in localeOptions"
                :key="opt.value"
                clickable
                v-ripple
                v-close-popup
                @click="setLocale(opt.value)"
              >
                <q-item-section avatar>
                  <span>{{ opt.flag }}</span>
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Theme toggle (light/dark) -->
          <DarkModeToggle />

          <!-- Notifications -->
          <q-btn
            flat
            round
            dense
            :aria-label="t('header.notifications')"
            class="q-ml-xs"
            data-test="button-notifications"
            @click="onNotificationsClick"
          >
            <q-icon name="notifications" />
            <q-badge
              v-if="notifications.unreadCount > 0"
              color="negative"
              floating
              rounded
              transparent
            >
              {{ notifications.unreadCount }}
            </q-badge>
            <q-tooltip>{{ t('header.notifications') }}</q-tooltip>
          </q-btn>

          <!-- User avatar + menu (right-most) -->
          <q-btn-dropdown
            v-model="userMenuOpen"
            flat
            dense
            no-icon-animation
            class="app-user-menu q-ml-xs"
            data-test="user-menu"
          >
            <template #label>
              <q-avatar color="primary" text-color="white" size="32px">
                {{ userInitials }}
              </q-avatar>
            </template>
            <q-list class="q-pa-sm">
              <q-item class="q-px-md q-py-sm" dense>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ userDisplayName }}</q-item-label>
                  <q-item-label caption>{{ roleLabel }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-ripple @click="goToProfile" data-test="user-menu-profile">
                <q-item-section avatar>
                  <q-icon name="person" size="sm" />
                </q-item-section>
                <q-item-section>{{ t('header.profile') }}</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="goToBugReport" data-test="user-menu-bug">
                <q-item-section avatar>
                  <q-icon name="bug_report" size="sm" />
                </q-item-section>
                <q-item-section>{{ t('header.reportBug') }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-ripple
                @click="onLogoutFromMenu"
                data-test="user-menu-logout"
                class="text-negative app-user-logout-item"
              >
                <q-item-section avatar>
                  <q-icon name="logout" size="sm" class="app-user-logout-icon" />
                </q-item-section>
                <q-item-section>{{ t('auth.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
      </q-header>

      <router-view />
    </q-page-container>

    <!-- Right drawer: Submit report form (BRD: use drawer instead of popup for forms) -->
    <q-drawer
      v-model="ui.submitDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-submit-form"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('submitForm.title') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmitForm" data-test="form-submit-ticket">
            <q-input
              v-model="submitForm.subject"
              :label="t('submitForm.subject')"
              outlined
              dense
              data-test="input-subject"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="submitForm.description"
              :label="t('submitForm.description')"
              outlined
              dense
              type="textarea"
              rows="4"
              data-test="input-description"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-form"
                unelevated
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-form"
                @click="ui.closeSubmitDrawer"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Right drawer: Create user (used from Users page) -->
    <q-drawer
      v-model="ui.createUserDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="480"
      data-test="drawer-create-user"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              {{
                auth.user?.role === 'PROFESSOR'
                  ? t('createUser.titleStudent')
                  : t('createUser.title')
              }}
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              :aria-label="t('submitForm.cancel')"
              @click="ui.closeCreateUserDrawer"
            />
          </div>

          <q-form class="q-gutter-md" @submit.prevent="onCreateUserSubmit" data-test="form-create-user">
            <q-input
              v-model="createUserForm.firstName"
              :label="t('createUser.firstName')"
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="input-firstName"
            />
            <q-input
              v-model="createUserForm.lastName"
              :label="t('createUser.lastName')"
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="input-lastName"
            />
            <q-input
              v-model="createUserForm.email"
              :label="t('createUser.email')"
              type="email"
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="input-email"
            />
            <q-select
              v-if="!isProfessor"
              v-model="createUserForm.role"
              :label="t('createUser.role')"
              :options="createUserRoleOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="select-role"
            />
            <q-select
              v-if="showCreateUserTenantSelect"
              v-model="createUserForm.tenantId"
              :label="t('createUser.tenant')"
              :options="createUserTenantOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              :loading="tenantsStore.loading"
              :rules="tenantFieldRules"
              data-test="select-tenant"
            />
            <q-input
              v-model="createUserForm.password"
              :label="t('createUser.password')"
              type="password"
              outlined
              dense
              :rules="[
                (v: string) => !!v || t('validation.required'),
                (v: string) => !v || v.length >= 8 || 'Min 8 znakova',
              ]"
              data-test="input-password"
            />

            <q-banner
              v-if="createUserError"
              class="bg-negative text-white rounded-borders q-mb-md"
              dense
            >
              {{ createUserError }}
            </q-banner>
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('createUser.submit')"
                :loading="createUserLoading"
                :disable="createUserLoading"
                data-test="button-submit-create-user"
              />
              <q-btn
                flat
                :label="t('createUser.back')"
                data-test="button-back-create-user"
                @click="ui.closeCreateUserDrawer"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

  </q-layout>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useTenantsStore } from '@/stores/tenants';
import { authApi } from '@/api/auth.api';
import { useNotificationsStore } from '@/stores/notifications';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';

const LOCALE_STORAGE_KEY = 'locale';

const router = useRouter();
const $q = useQuasar();
const { t, locale: i18nLocale } = useI18n();
const ui = useUiStore();
const auth = useAuthStore();
const tenantsStore = useTenantsStore();
const notifications = useNotificationsStore();

const tenantOptions = computed(() =>
  auth.tenantId
    ? tenantsStore.tenants.filter((t) => t.id === auth.tenantId)
    : tenantsStore.tenants
);

const localeOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧', short: '' },
  { value: 'sr-lat', label: 'Srpski (latinica)', flag: '🇷🇸', short: 'LAT' },
  { value: 'sr-cyr', label: 'Српски (ћирилица)', flag: '🇷🇸', short: 'ЋИР' },
];

const locale = computed(() => i18nLocale.value);

const currentLocale = computed(() => {
  return localeOptions.find((opt) => opt.value === locale.value) ?? localeOptions[0];
});

function setLocale(value: string) {
  i18nLocale.value = value;
  localStorage.setItem(LOCALE_STORAGE_KEY, value);
}

const userDisplayName = computed(() => {
  const u = auth.user;
  if (!u) return '';
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const userInitials = computed(() => {
  const u = auth.user;
  if (!u) return '?';
  const first = (u.firstName ?? '').trim();
  const last = (u.lastName ?? '').trim();
  const f = first.charAt(0);
  const l = last.charAt(0);
  const emailFirst = (u.email ?? '').trim().charAt(0) || '?';
  const initials = (f + l) || f || emailFirst;
  return initials.toUpperCase();
});

const roleLabel = computed(() => {
  const role = auth.user?.role;
  if (!role) return '';
  const keyMap: Record<string, string> = {
    PLATFORM_ADMIN: t('header.rolePlatformAdmin'),
    SCHOOL_ADMIN: t('header.roleSchoolAdmin'),
    PROFESSOR: t('header.roleProfessor'),
    STUDENT: t('header.roleStudent'),
  };
  return keyMap[role] ?? role;
});

const userMenuOpen = ref(false);

async function onLogoutFromMenu() {
  userMenuOpen.value = false;
  await handleLogout();
}

function goToProfile() {
  userMenuOpen.value = false;
  router.push({ name: 'profile' });
}

function goToBugReport() {
  userMenuOpen.value = false;
  router.push({ name: 'bug-report' });
}

// Auto-open sidebar on desktop (>= 999px), close on mobile (same as Park)
watch(
  () => $q.screen.width < 999,
  (isMobile) => {
    ui.leftDrawerOpen = !isMobile;
  },
  { immediate: true }
);

onMounted(() => {
  tenantsStore.fetchTenants();
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && ['en', 'sr-lat', 'sr-cyr'].includes(saved)) {
    i18nLocale.value = saved;
  }

  // Start simple polling for new relevant tickets (bug reports) for admins
  if (auth.user?.role === 'PLATFORM_ADMIN' || auth.user?.role === 'SCHOOL_ADMIN') {
    void notifications.pollTickets();
    setInterval(() => {
      void notifications.pollTickets();
    }, 30000);
  }
});

async function handleLogout() {
  await auth.logout();
  router.push('/auth/login');
}

const submitForm = reactive({
  subject: '',
  description: '',
});

const isPlatformAdmin = computed(() => auth.user?.role === 'PLATFORM_ADMIN');
const isProfessor = computed(() => auth.user?.role === 'PROFESSOR');

const createUserTenantOptions = computed(() => {
  if (isPlatformAdmin.value) return tenantsStore.tenants;
  if (isProfessor.value) {
    const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
    return tenantsStore.tenants.filter((t) => ids.includes(t.id));
  }
  return [];
});

const createUserForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: null as import('@/api/auth.api').UserRole | null,
  tenantId: null as string | null,
  password: '',
});

const showCreateUserTenantSelect = computed(() => {
  // Ako trenutni korisnik (creator) ima rolu PLATFORM_ADMIN i bira da kreira PLATFORM_ADMIN,
  // ne prikazujemo izbor institucije u UI (tenant se postavlja automatski).
  if (isPlatformAdmin.value && createUserForm.role === 'PLATFORM_ADMIN') {
    return false;
  }
  if (isPlatformAdmin.value) return true;
  if (isProfessor.value) {
    const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
    return ids.length > 1;
  }
  return false;
});

const tenantFieldRules = computed(() => {
  // Za PLATFORM_ADMIN rolu ne zahtevamo izbor institucije u formi
  if (isPlatformAdmin.value && createUserForm.role === 'PLATFORM_ADMIN') {
    return [];
  }
  return [(v: string) => !!v || t('validation.required')];
});

const createUserRoleOptions = computed(() => {
  const base = [
    { label: t('createUser.roleSchoolAdmin'), value: 'SCHOOL_ADMIN' },
    { label: t('createUser.roleProfessor'), value: 'PROFESSOR' },
    { label: t('createUser.roleStudent'), value: 'STUDENT' },
  ];
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    return [{ label: t('createUser.rolePlatformAdmin'), value: 'PLATFORM_ADMIN' }, ...base];
  }
  return base;
});

// Kada trenutni korisnik (platform admin) izabere da kreira PLATFORM_ADMIN,
// automatski setujemo tenantId na njegov tenant (da backend ostane konzistentan),
// ali bez forsiranja izbora institucije u UI.
watch(
  () => createUserForm.role,
  (newRole) => {
    if (isPlatformAdmin.value && newRole === 'PLATFORM_ADMIN') {
      createUserForm.tenantId = auth.tenantId ?? null;
    }
  }
);

const createUserLoading = ref(false);
const createUserError = ref<string | null>(null);

function onSubmitForm() {
  // TODO: call tickets API when backend endpoint exists
  ui.closeSubmitDrawer();
  submitForm.subject = '';
  submitForm.description = '';
}

function onNotificationsClick() {
  router.push({ name: 'notifications' });
}

async function onCreateUserSubmit() {
  if (!auth.user) return;

  const tenantId = isPlatformAdmin.value
    ? createUserForm.tenantId
    : isProfessor.value
      ? createUserForm.tenantId
      : auth.tenantId;
  const role = isProfessor.value ? 'STUDENT' : createUserForm.role;

  if (!role || !tenantId) return;

  createUserLoading.value = true;
  createUserError.value = null;

  try {
    const email = createUserForm.email;
    await authApi.register({
      email,
      password: createUserForm.password,
      firstName: createUserForm.firstName,
      lastName: createUserForm.lastName,
      role,
      tenantId,
    });
    createUserForm.firstName = '';
    createUserForm.lastName = '';
    createUserForm.email = '';
    createUserForm.role = isProfessor.value ? 'STUDENT' : null;
    createUserForm.tenantId = isPlatformAdmin.value || isProfessor.value ? null : auth.tenantId;
    if (isProfessor.value) {
      const ids = auth.user.tenantIds ?? (auth.user.tenantId ? [auth.user.tenantId] : []);
      if (ids.length === 1) createUserForm.tenantId = ids[0];
    }
    createUserForm.password = '';
    ui.closeCreateUserDrawer();
    const notify = ($q as any).notify;
    if (typeof notify === 'function') {
      notify({
        type: 'positive',
        message: t('users.toastCreated', { email }),
      });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-created'));
    }
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error
          ? e.message
          : 'Greška';
    createUserError.value = msg ?? 'Greška';
  } finally {
    createUserLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
/* Layout-specific overrides only; main styles in app.scss */
</style>
