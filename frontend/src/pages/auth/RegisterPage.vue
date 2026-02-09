<template>
  <q-card class="q-ma-xl">
    <div class="row">
      <!-- Left Side - Branding (Desktop) -->
      <div class="col-0 col-sm-5 bg-primary rounded-left-borders xs-hide">
        <div class="row full-width q-px-xl q-pb-xl full-height flex flex-center">
          <div class="column items-center">
            <img
              src="/logo.png"
              alt="SMS Logo"
              class="auth-branding-logo q-mb-md"
            />
            <div class="text-h4 text-uppercase text-white font-bold text-center" style="min-width: 220px">
              {{ t('pages.auth.branding.welcomeTitle') }}
            </div>
            <div class="text-white q-my-sm text-subtitle1 text-center">
              {{ t('pages.auth.branding.welcomeSubtitle') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="col-12 col-sm-7">
        <div class="row q-ml-sm q-mt-sm sm-and-up-hide">
          <div class="col-12 text-subtitle1">
            <router-link class="text-primary" style="text-decoration: none" to="/">
              <img src="/logo.png" alt="SMS Logo" class="h-1 w-1 mx-auto object-contain" />
            </router-link>
          </div>
        </div>

        <div class="row q-pa-sm-sm q-pa-md">
          <div class="col-12">
            <q-card-section>
              <div class="q-mb-xl">
                <div class="flex justify-center">
                  <div class="text-h4 text-uppercase q-my-none text-weight-bold text-primary">
                    {{ t('pages.auth.register.title') }}
                  </div>
                </div>
              </div>

              <q-form ref="formRef" class="q-gutter-md" @submit="handleSubmit" data-test="register-form">
                <q-input
                  data-test="input-register-firstName"
                  v-model="user.firstName"
                  :label="t('pages.auth.register.firstName')"
                  outlined
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  data-test="input-register-lastName"
                  v-model="user.lastName"
                  :label="t('pages.auth.register.lastName')"
                  outlined
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  data-test="input-register-email"
                  v-model="user.email"
                  :label="t('pages.auth.register.email')"
                  type="email"
                  outlined
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-select
                  data-test="select-register-role"
                  v-model="user.role"
                  :label="t('pages.auth.register.role')"
                  :options="roleOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-select>

                <q-select
                  data-test="select-register-tenant"
                  v-model="user.tenantId"
                  :label="t('pages.auth.register.tenant')"
                  :options="tenantsStore.tenants"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  outlined
                  :loading="tenantsStore.loading"
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" />
                  </template>
                </q-select>

                <q-input
                  data-test="input-register-password"
                  v-model="user.password"
                  :label="t('pages.auth.register.password')"
                  type="password"
                  outlined
                  :rules="[
                    (v: string) => !!v || 'Required',
                    (v: string) => !v || v.length >= 8 || 'Min 8 characters',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  data-test="input-register-confirm-password"
                  v-model="user.confirmPassword"
                  :label="t('pages.auth.register.confirmPassword')"
                  type="password"
                  outlined
                  :rules="[
                    (v: string) => !!v || 'Required',
                    (v: string) => v === user.password || 'Passwords must match',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-banner
                  v-if="auth.error"
                  data-test="error-message"
                  class="bg-negative text-white rounded-lg"
                  dense
                >
                  <template v-slot:avatar>
                    <q-icon name="error" color="white" />
                  </template>
                  {{ auth.error }}
                </q-banner>

                <div>
                  <q-btn
                    data-test="button-register-submit"
                    class="full-width"
                    color="primary"
                    :label="t('pages.auth.register.registerButton')"
                    rounded
                    type="submit"
                    :loading="auth.loading"
                    :disable="auth.loading"
                  />
                </div>

                <div class="q-mt-lg">
                  <div class="q-mt-sm">
                    {{ t('pages.auth.register.haveAccount') }}
                    <router-link class="text-primary" to="/auth/login" style="text-decoration: none">
                      {{ t('pages.auth.register.login') }}
                    </router-link>
                  </div>
                </div>
              </q-form>
            </q-card-section>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useTenantsStore } from '@/stores/tenants';
import type { AuthUser } from '@/api/auth.api';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const tenantsStore = useTenantsStore();

const formRef = ref<{ validate: () => boolean } | null>(null);
const user = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: null as AuthUser['role'] | null,
  tenantId: null as string | null,
  password: '',
  confirmPassword: '',
});

const roleOptions = computed(() => [
  { label: t('pages.auth.register.rolePlatformAdmin'), value: 'PLATFORM_ADMIN' },
  { label: t('pages.auth.register.roleSchoolAdmin'), value: 'SCHOOL_ADMIN' },
  { label: t('pages.auth.register.roleProfessor'), value: 'PROFESSOR' },
  { label: t('pages.auth.register.roleStudent'), value: 'STUDENT' },
]);

onMounted(() => {
  tenantsStore.fetchTenants();
});

async function handleSubmit() {
  if (!formRef.value?.validate() || !user.role || !user.tenantId) return;
  try {
    await auth.register({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    });
    await nextTick();
    await new Promise((r) => setTimeout(r, 150));
    if (auth.isAuthenticated) {
      const redirectPath = (route.query.redirect as string) || '/';
      await router.replace(redirectPath);
    }
  } catch {
    // error via auth.error
  }
}
</script>

<style scoped>
.rounded-left-borders {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.auth-branding-logo {
  height: 140px;
  width: 160px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>
