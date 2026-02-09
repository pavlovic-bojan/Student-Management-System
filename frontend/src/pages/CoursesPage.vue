<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('courses.title') }}</div>
      <q-btn
        color="primary"
        :label="t('courses.add')"
        data-test="button-add-course"
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
      v-else-if="store.courses.length"
      :rows="store.courses"
      :columns="columns"
      row-key="id"
      flat
      bordered
      data-test="courses-table"
      :rows-per-page-options="[10, 25, 50]"
    />
    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="menu_book" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('courses.empty') }}</div>
    </q-card>

    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-course"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('courses.add') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmit" data-test="form-add-course">
            <q-input
              v-model="form.name"
              :label="t('courses.name')"
              outlined
              dense
              data-test="input-course-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="form.code"
              :label="t('courses.code')"
              outlined
              dense
              data-test="input-course-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-select
              v-model="form.programId"
              :options="programOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              :label="t('courses.program')"
              outlined
              dense
              clearable
              data-test="select-course-program"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-course"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-course"
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
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useCoursesStore } from '@/stores/courses';
import { useProgramsStore } from '@/stores/programs';

const { t } = useI18n();
const auth = useAuthStore();
const store = useCoursesStore();
const programsStore = useProgramsStore();

const drawerOpen = ref(false);
const form = reactive({ name: '', code: '', programId: '' as string | null });

const programOptions = computed(() => programsStore.programs);

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
];

function onSubmit() {
  store
    .createCourse({
      name: form.name,
      code: form.code,
      programId: form.programId || undefined,
    })
    .then(() => {
      drawerOpen.value = false;
      form.name = '';
      form.code = '';
      form.programId = null;
    })
    .catch(() => {});
}

watch(
  () => auth.tenantId,
  (id) => {
    if (id) {
      store.fetchCourses();
      programsStore.fetchPrograms();
    } else {
      store.clearCourses();
    }
  },
);

onMounted(() => {
  if (auth.tenantId) {
    store.fetchCourses();
    programsStore.fetchPrograms();
  }
});
</script>
