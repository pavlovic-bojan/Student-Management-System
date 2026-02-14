<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('records.title') }}</div>
      <q-btn
        color="primary"
        :label="t('records.generate')"
        data-test="button-generate-transcript"
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

    <q-table
      v-else-if="store.transcripts.length"
      :rows="store.transcripts"
      :columns="columns"
      row-key="id"
      flat
      bordered
      data-test="transcripts-table"
      :rows-per-page-options="[10, 25, 50]"
    >
      <template #body-cell-studentId="props">
        <q-td :data-test="`transcript-row-${props.row.id}`">{{ props.row.studentId }}</q-td>
      </template>
      <template #body-cell-generatedAt="props">
        <q-td>{{ props.row.generatedAt?.slice(0, 10) ?? '' }}</q-td>
      </template>
    </q-table>
    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="folder" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('records.empty') }}</div>
    </q-card>

    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-generate-transcript"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('records.generate') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmit" data-test="form-generate-transcript">
            <q-select
              v-model="form.studentId"
              :options="studentOptions"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              :label="t('records.student')"
              outlined
              dense
              data-test="select-transcript-student"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-transcript"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-transcript"
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useRecordsStore } from '@/stores/records';
import { useStudentsStore } from '@/stores/students';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();
const store = useRecordsStore();
const studentsStore = useStudentsStore();

const drawerOpen = ref(false);
const form = reactive({ studentId: '' });

const studentOptions = computed(() =>
  studentsStore.students.map((s) => ({
    id: s.id,
    label: `${s.indexNumber} ${s.firstName} ${s.lastName}`,
  })),
);

const columns = computed(() => [
  { name: 'studentId', label: t('records.student'), field: 'studentId', align: 'left' as const, sortable: true },
  { name: 'gpa', label: t('records.gpa'), field: 'gpa', align: 'center' as const, sortable: true },
  { name: 'generatedAt', label: t('records.generatedAt'), field: 'generatedAt', align: 'left' as const, sortable: true },
]);

async function onSubmit() {
  try {
    await store.generateTranscript(form.studentId);
    drawerOpen.value = false;
    form.studentId = '';
    $q.notify({ type: 'positive', message: t('records.toastGenerated') });
  } catch {
    // error in store
  }
}

watch(
  () => auth.tenantId,
  (id) => {
    if (id) {
      store.fetchTranscripts();
      studentsStore.fetchStudents();
    } else {
      store.clearRecords();
    }
  },
);

onMounted(() => {
  if (auth.tenantId) {
    store.fetchTranscripts();
    studentsStore.fetchStudents();
  }
});
</script>
