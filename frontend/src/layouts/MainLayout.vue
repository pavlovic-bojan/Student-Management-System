<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="ui.toggleLeftDrawer"
          data-test="button-toggle-drawer"
        />
        <q-toolbar-title class="row items-center q-gutter-sm">
          <img
            src="/logo.png"
            alt="Student SMS logo"
            class="app-logo"
            data-test="app-logo"
          />
          <span>{{ t('appTitle') }}</span>
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
          class="tenant-select"
          style="min-width: 200px"
          data-test="tenant-select"
          :loading="tenantsStore.loading"
          @update:model-value="onTenantSelect"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="ui.leftDrawerOpen"
      show-if-above
      side="left"
      bordered
      data-test="drawer-main"
    >
      <q-list padding>
        <q-item-label header>{{ t('nav.title') }}</q-item-label>

        <q-item clickable v-ripple to="/" data-test="nav-tickets">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>{{ t('nav.tickets') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-notifications">
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>{{ t('nav.notifications') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-documents">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>{{ t('nav.documents') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/finance" data-test="nav-finance">
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>
          <q-item-section>{{ t('nav.finance') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple data-test="nav-calendar">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>{{ t('nav.calendar') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/students" data-test="nav-students">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>{{ t('nav.students') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/programs" data-test="nav-programs">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>{{ t('nav.programs') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/courses" data-test="nav-courses">
          <q-item-section avatar>
            <q-icon name="menu_book" />
          </q-item-section>
          <q-item-section>{{ t('nav.courses') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/exams" data-test="nav-exams">
          <q-item-section avatar>
            <q-icon name="quiz" />
          </q-item-section>
          <q-item-section>{{ t('nav.exams') }}</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/records" data-test="nav-records">
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

<style scoped>
.app-logo {
  height: 28px;
}
</style>
