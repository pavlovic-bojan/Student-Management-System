<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('submitForm.title') }}</div>
    </div>

    <q-card flat bordered class="q-pa-md">
      <q-form class="q-gutter-md" @submit.prevent="onSubmit">
        <q-input
          v-model="form.subject"
          :label="t('submitForm.subject')"
          outlined
          dense
          data-test="bug-subject"
        />
        <q-input
          v-model="form.page"
          :label="t('bugReport.page')"
          outlined
          dense
          data-test="bug-page"
        />
        <q-input
          v-model="form.steps"
          :label="t('bugReport.steps')"
          outlined
          dense
          type="textarea"
          rows="4"
          data-test="bug-steps"
        />
        <q-input
          v-model="form.expectedActual"
          :label="t('bugReport.expectedActual')"
          outlined
          dense
          type="textarea"
          rows="4"
          data-test="bug-expected-actual"
        />
        <q-input
          v-model="form.description"
          :label="t('submitForm.description')"
          outlined
          dense
          type="textarea"
          rows="3"
          data-test="bug-description"
        />

        <q-banner
          v-if="cooldownRemaining > 0"
          class="bg-warning text-dark"
          rounded
          data-test="bug-cooldown-banner"
        >
          {{ t('bugReport.cooldown', { seconds: cooldownRemaining }) }}
        </q-banner>

        <q-banner
          v-if="errorMessage"
          class="bg-negative text-white"
          rounded
          data-test="bug-error-banner"
        >
          {{ errorMessage }}
        </q-banner>

        <div class="row q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            :label="t('submitForm.submit')"
            unelevated
            :disable="isSubmitDisabled"
            :loading="submitting"
            data-test="bug-submit"
          />
          <q-btn
            flat
            :label="t('submitForm.cancel')"
            data-test="bug-cancel"
            @click="goBack"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { ticketsApi } from '@/api/tickets.api';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'bugReportLastAt';

const router = useRouter();
const { t } = useI18n();

const form = reactive({
  subject: '',
  page: '',
  steps: '',
  expectedActual: '',
  description: '',
});

const submitting = reactive({ value: false });
const errorMessage = ref<string | null>(null);

const lastSentAt = (() => {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  const n = raw ? Number(raw) : 0;
  return isNaN(n) ? 0 : n;
})();

const cooldownRemaining = computed(() => {
  const now = Date.now();
  const diff = lastSentAt ? COOLDOWN_SECONDS - Math.floor((now - lastSentAt) / 1000) : 0;
  return diff > 0 ? diff : 0;
});

const isSubmitDisabled = computed(() => cooldownRemaining.value > 0);

function saveLastSent() {
  const now = Date.now();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, String(now));
  }
}

function validateForm(): boolean {
  const errors: string[] = [];
  const subject = form.subject.trim();
  const description = form.description.trim();
  const steps = form.steps.trim();
  const expectedActual = form.expectedActual.trim();

  if (!subject || subject.length < 5 || subject.length > 200) {
    errors.push(t('validation.bugSubjectLength'));
  }

  if (!description || description.length < 10 || description.length > 2000) {
    errors.push(t('validation.bugDescriptionLength'));
  }

  if (!steps || steps.length < 5 || steps.length > 4000) {
    errors.push(t('validation.bugStepsLength'));
  }

  if (!expectedActual || expectedActual.length < 5 || expectedActual.length > 4000) {
    errors.push(t('validation.bugExpectedActualLength'));
  }

  if (errors.length > 0) {
    errorMessage.value = errors.join('\n');
    return false;
  }

  errorMessage.value = null;
  return true;
}

async function onSubmit() {
  if (!validateForm()) {
    return;
  }
  if (cooldownRemaining.value > 0) {
    errorMessage.value = t('bugReport.cooldown', { seconds: cooldownRemaining.value });
    return;
  }

  submitting.value = true;
  errorMessage.value = null;
  try {
    await ticketsApi.create({
      subject: form.subject,
      description: form.description || '',
      page: form.page || undefined,
      steps: form.steps || undefined,
      expectedActual: form.expectedActual || undefined,
    });
    saveLastSent();
    $q.notify({
      type: 'positive',
      message: t('bugReport.submitted'),
    });
    form.subject = '';
    form.page = '';
    form.steps = '';
    form.expectedActual = '';
    form.description = '';
    goBack();
  } catch (e) {
    const message = t('bugReport.submitError');
    errorMessage.value = message;
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push({ name: 'dashboard' });
}
</script>
