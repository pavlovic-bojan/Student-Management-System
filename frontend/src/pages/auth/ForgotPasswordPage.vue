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
                    {{ t('pages.auth.forgotPassword.title') }}
                  </div>
                </div>
              </div>

              <q-banner
                v-if="success"
                data-test="success-message"
                class="bg-positive text-white rounded-lg q-mb-md"
                dense
              >
                <template v-slot:avatar>
                  <q-icon name="check_circle" color="white" />
                </template>
                {{ t('pages.auth.forgotPassword.success') }}
              </q-banner>

              <q-form
                v-if="!success"
                ref="formRef"
                class="q-gutter-md"
                @submit="handleSubmit"
                data-test="forgot-password-form"
              >
                <q-input
                  data-test="input-forgot-password-email"
                  v-model="user.email"
                  :label="t('pages.auth.forgotPassword.email')"
                  type="email"
                  outlined
                  :rules="[(v: string) => !!v || 'Required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <div class="text-body2 text-grey-7">
                  {{ t('pages.auth.forgotPassword.instructions') }}
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
                    data-test="button-forgot-password-submit"
                    class="full-width"
                    color="primary"
                    :label="t('pages.auth.forgotPassword.sendResetLink')"
                    rounded
                    type="submit"
                    :loading="auth.loading"
                    :disable="auth.loading"
                  />
                </div>

                <div class="q-mt-lg">
                  <div class="q-mt-sm text-center">
                    <router-link class="text-primary" to="/auth/login" style="text-decoration: none">
                      {{ t('pages.auth.forgotPassword.backToLogin') }}
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
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const auth = useAuthStore();

const formRef = ref<{ validate: () => boolean } | null>(null);
const user = reactive({ email: '' });
const success = ref(false);

async function handleSubmit() {
  if (!formRef.value?.validate()) return;
  try {
    await auth.forgotPassword(user.email);
    success.value = true;
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
