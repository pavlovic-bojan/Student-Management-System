<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ isProfessor ? t('createUser.titleStudent') : t('createUser.title') }}</div>

    <q-card flat bordered class="q-pa-md" style="max-width: 500px">
      <q-form ref="formRef" class="q-gutter-md" @submit="handleSubmit" data-test="form-create-user">
        <q-input
          v-model="user.firstName"
          :label="t('createUser.firstName')"
          outlined
          dense
          :rules="[(v: string) => !!v || t('validation.required')]"
          data-test="input-firstName"
        />
        <q-input
          v-model="user.lastName"
          :label="t('createUser.lastName')"
          outlined
          dense
          :rules="[(v: string) => !!v || t('validation.required')]"
          data-test="input-lastName"
        />
        <q-input
          v-model="user.email"
          :label="t('createUser.email')"
          type="email"
          outlined
          dense
          :rules="[(v: string) => !!v || t('validation.required')]"
          data-test="input-email"
        />
        <q-select
          v-if="!isProfessor"
          v-model="user.role"
          :label="t('createUser.role')"
          :options="roleOptions"
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
          v-if="showTenantSelect"
          v-model="user.tenantId"
          :label="t('createUser.tenant')"
          :options="tenantSelectOptions"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          outlined
          dense
          :loading="tenantsStore.loading"
          :rules="[(v: string) => !!v || t('validation.required')]"
          data-test="select-tenant"
        />
        <q-input
          v-model="user.password"
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
          v-if="error"
          class="bg-negative text-white rounded-borders q-mb-md"
          dense
        >
          {{ error }}
        </q-banner>
        <q-banner
          v-if="success"
          class="bg-positive text-white rounded-borders q-mb-md"
          dense
        >
          {{ t('createUser.success') }}
        </q-banner>

        <div class="row q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            :label="t('createUser.submit')"
            :loading="loading"
            :disable="loading"
            data-test="button-submit"
          />
          <q-btn
            flat
            :label="t('createUser.back')"
            to="/"
            data-test="button-back"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useTenantsStore } from '@/stores/tenants';
import { authApi } from '@/api/auth.api';
import type { AuthUser } from '@/api/auth.api';

const { t } = useI18n();
const auth = useAuthStore();
const tenantsStore = useTenantsStore();

const formRef = ref<{ validate: () => boolean } | null>(null);
const success = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const isPlatformAdmin = computed(() => auth.user?.role === 'PLATFORM_ADMIN');
const isProfessor = computed(() => auth.user?.role === 'PROFESSOR');

/** Professor sees tenant dropdown only when they belong to 2+ tenants. */
const showTenantSelect = computed(() => {
  if (isPlatformAdmin.value) return true;
  if (isProfessor.value) {
    const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
    return ids.length > 1;
  }
  return false;
});

/** For Platform Admin: all tenants. For Professor: only their tenant(s). */
const tenantSelectOptions = computed(() => {
  if (isPlatformAdmin.value) return tenantsStore.tenants;
  if (isProfessor.value) {
    const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
    return tenantsStore.tenants.filter((t) => ids.includes(t.id));
  }
  return [];
});

const user = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: null as AuthUser['role'] | null,
  tenantId: null as string | null,
  password: '',
});

const roleOptions = computed(() => {
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

onMounted(() => {
  tenantsStore.fetchTenants();
  if (isProfessor.value) {
    const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
    if (ids.length === 1) user.tenantId = ids[0];
    user.role = 'STUDENT';
  } else if (!isPlatformAdmin.value && auth.tenantId) {
    user.tenantId = auth.tenantId;
  }
});

async function handleSubmit() {
  if (!formRef.value?.validate()) return;
  const tenantId = isPlatformAdmin.value
    ? user.tenantId
    : isProfessor.value
      ? user.tenantId
      : auth.tenantId;
  const role = isProfessor.value ? 'STUDENT' : user.role;
  if (!role || !tenantId) return;
  loading.value = true;
  error.value = null;
  try {
    await authApi.register({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role,
      tenantId,
    });
    success.value = true;
    user.firstName = '';
    user.lastName = '';
    user.email = '';
    user.role = isProfessor.value ? 'STUDENT' : null;
    user.tenantId = isPlatformAdmin.value || isProfessor.value ? null : auth.tenantId;
    if (isProfessor.value) {
      const ids = auth.user?.tenantIds ?? (auth.user?.tenantId ? [auth.user.tenantId] : []);
      if (ids.length === 1) user.tenantId = ids[0];
    }
    user.password = '';
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error
          ? e.message
          : 'Greška';
    error.value = msg ?? 'Greška';
  } finally {
    loading.value = false;
  }
}
</script>
