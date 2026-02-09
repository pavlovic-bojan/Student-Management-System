<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <q-header elevated class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-sm"
          @click="ui.toggleLeftDrawer"
          data-test="button-toggle-drawer"
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

        <q-select
          v-model="auth.tenantId"
          :options="tenantsStore.tenants"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          :label="t('tenant.select')"
          dense
          outlined
          dark
          borderless
          class="app-tenant-select"
          data-test="tenant-select"
          :loading="tenantsStore.loading"
          @update:model-value="onTenantSelect"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="ui.leftDrawerOpen"
      :width="280"
      side="left"
      bordered
      overlay
      class="app-nav-drawer"
      data-test="drawer-main"
    >
      <q-list padding class="app-nav-list">
        <q-item-label header class="app-nav-header">{{ t('nav.title') }}</q-item-label>

        <q-item clickable v-ripple to="/" active-class="app-nav-item-active" data-test="nav-tickets" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>{{ t('nav.tickets') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-notifications" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>{{ t('nav.notifications') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-documents" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>{{ t('nav.documents') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/finance" active-class="app-nav-item-active" data-test="nav-finance" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>
          <q-item-section>{{ t('nav.finance') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-calendar" class="app-nav-item">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>{{ t('nav.calendar') }}</q-item-section>
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
      </q-list>
    </q-drawer>

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

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useTenantsStore } from '@/stores/tenants';

const { t } = useI18n();
const ui = useUiStore();
const auth = useAuthStore();
const tenantsStore = useTenantsStore();

onMounted(() => {
  tenantsStore.fetchTenants();
});

function onTenantSelect(tenantId: string | null) {
  if (tenantId) auth.setCredentials(tenantId);
  else auth.clearCredentials();
}

const submitForm = reactive({
  subject: '',
  description: '',
});

function onSubmitForm() {
  // TODO: call tickets API when backend endpoint exists
  ui.closeSubmitDrawer();
  submitForm.subject = '';
  submitForm.description = '';
}
</script>

<style scoped lang="scss">
/* Layout-specific overrides only; main styles in app.scss */
</style>
