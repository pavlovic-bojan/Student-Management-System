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
        <!-- Logo (Mobile) -->
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
                    {{ t('pages.auth.login.title') }}
                  </div>
                </div>
              </div>

              <q-form ref="formRef" class="q-gutter-md" @submit="handleEmailLogin" data-test="login-form">
                <q-input
                  data-test="input-login-email"
                  v-model="user.email"
                  :label="t('pages.auth.login.email')"
                  name="email"
                  type="email"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  data-test="input-login-password"
                  v-model="user.password"
                  :label="t('pages.auth.login.password')"
                  name="password"
                  type="password"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <div class="flex items-center justify-between">
                  <q-checkbox
                    v-model="rememberMe"
                    :label="t('pages.auth.login.rememberMe')"
                    color="primary"
                  />
                  <router-link
                    to="/auth/forgot-password"
                    class="text-sm text-primary"
                    style="text-decoration: none"
                  >
                    {{ t('pages.auth.login.forgotPassword') }}
                  </router-link>
                </div>

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
                    data-test="button-login-submit"
                    class="full-width"
                    color="primary"
                    :label="t('pages.auth.login.loginButton')"
                    rounded
                    type="submit"
                    :loading="auth.loading"
                    :disable="auth.loading"
                  />
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
import { reactive, ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const formRef = ref<{ validate: () => boolean } | null>(null);
const user = reactive({ email: '', password: '' });
const rememberMe = ref(false);

async function handleEmailLogin() {
  if (!formRef.value?.validate()) return;
  try {
    await auth.login(user.email, user.password);
    await nextTick();
    await new Promise((r) => setTimeout(r, 150));
    if (auth.isAuthenticated) {
      const redirectPath = (route.query.redirect as string) || '/';
      await router.replace(redirectPath);
    }
  } catch {
    // error shown via auth.error
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
