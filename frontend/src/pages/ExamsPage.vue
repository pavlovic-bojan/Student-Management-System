<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('exams.title') }}</div>
      <q-btn
        color="primary"
        :label="t('exams.addPeriod')"
        data-test="button-add-period"
        unelevated
        @click="drawerOpen = true"
      />
    </div>

    <q-banner v-if="!auth.tenantId" class="bg-warning text-dark" rounded data-test="banner-no-tenant">
      {{ t('tenant.selectHint') }}
    </q-banner>

    <q-linear-progress v-else-if="store.loading" indeterminate color="primary" class="q-mb-md" />
    <q-banner v-else-if="store.error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ store.error }}
    </q-banner>

    <template v-else>
      <div class="text-subtitle1 q-mb-sm">{{ t('exams.periods') }}</div>
      <q-table
        v-if="store.periods.length"
        :rows="store.periods"
        :columns="periodColumns"
        row-key="id"
        flat
        bordered
        data-test="periods-table"
        :rows-per-page-options="[10, 25]"
      />
      <q-card v-else flat bordered class="q-pa-lg text-center q-mb-md" data-test="empty-periods">
        <div class="text-body2">{{ t('exams.emptyPeriods') }}</div>
      </q-card>

      <div class="text-subtitle1 q-mb-sm q-mt-md">{{ t('exams.terms') }}</div>
      <q-table
        v-if="store.terms.length"
        :rows="store.terms"
        :columns="termColumns"
        row-key="id"
        flat
        bordered
        data-test="terms-table"
        :rows-per-page-options="[10, 25]"
      />
      <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-terms">
        <div class="text-body2">{{ t('exams.emptyTerms') }}</div>
      </q-card>
    </template>

    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-period"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('exams.addPeriod') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmit" data-test="form-add-period">
            <q-input
              v-model="form.name"
              :label="t('exams.name')"
              outlined
              dense
              data-test="input-period-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="form.term"
              :label="t('exams.term')"
              outlined
              dense
              data-test="input-period-term"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model.number="form.year"
              type="number"
              :label="t('exams.year')"
              outlined
              dense
              data-test="input-period-year"
              :rules="[(v: number) => (v >= 2000 && v <= 2100) || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-period"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-period"
                @click="drawerOpen = false"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useExamsStore } from '@/stores/exams';

const { t } = useI18n();
const auth = useAuthStore();
const store = useExamsStore();

const drawerOpen = ref(false);
const form = reactive({
  name: '',
  term: '',
  year: new Date().getFullYear(),
});

const periodColumns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'term', label: 'Term', field: 'term', align: 'left' as const },
  { name: 'year', label: 'Year', field: 'year', align: 'center' as const },
];

const termColumns = [
  { name: 'date', label: 'Date', field: (row: { date: string }) => row.date?.slice(0, 10) ?? '', align: 'left' as const },
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const },
];

function onSubmit() {
  store
    .createPeriod({
      name: form.name,
      term: form.term,
      year: form.year,
    })
    .then(() => {
      drawerOpen.value = false;
      form.name = '';
      form.term = '';
      form.year = new Date().getFullYear();
    })
    .catch(() => {});
}

watch(
  () => auth.tenantId,
  (id) => {
    if (id) store.fetchAll();
    else store.clearExams();
  },
);

onMounted(() => {
  if (auth.tenantId) store.fetchAll();
});
</script>
