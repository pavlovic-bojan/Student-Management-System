<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('students.title') }}</div>
      <q-btn
        color="primary"
        :label="t('students.add')"
        data-test="button-add-student"
        unelevated
        @click="studentDrawerOpen = true"
      />
    </div>

    <q-banner v-if="!auth.tenantId" class="bg-warning text-dark" rounded data-test="banner-no-tenant">
      {{ t('tenant.selectHint') }}
    </q-banner>

    <q-linear-progress v-else-if="studentsStore.loading" indeterminate color="primary" class="q-mb-md" />
    <q-banner v-else-if="studentsStore.error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ studentsStore.error }}
    </q-banner>

    <q-list v-else-if="studentsStore.students.length" bordered separator data-test="students-list">
      <q-item v-for="s in studentsStore.students" :key="s.id" data-test="student-item">
        <q-item-section>
          <q-item-label>{{ s.firstName }} {{ s.lastName }}</q-item-label>
          <q-item-label caption>{{ s.indexNumber }} · {{ s.status }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-students">
      <q-icon name="people_outline" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('students.empty') }}</div>
    </q-card>

    <!-- Drawer: Add student form (BRD: use drawer for forms) -->
    <q-drawer
      v-model="studentDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-student"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('students.add') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmitStudent" data-test="form-add-student">
            <q-input
              v-model="form.indexNumber"
              :label="t('students.indexNumber')"
              outlined
              dense
              data-test="input-index-number"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="form.firstName"
              :label="t('students.firstName')"
              outlined
              dense
              data-test="input-first-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="form.lastName"
              :label="t('students.lastName')"
              outlined
              dense
              data-test="input-last-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-student"
                unelevated
                :loading="studentsStore.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-student"
                @click="studentDrawerOpen = false"
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
import { useStudentsStore } from '@/stores/students';

const { t } = useI18n();
const auth = useAuthStore();
const studentsStore = useStudentsStore();

const studentDrawerOpen = ref(false);
const form = reactive({
  indexNumber: '',
  firstName: '',
  lastName: '',
});

function onSubmitStudent() {
  studentsStore
    .createStudent({
      indexNumber: form.indexNumber,
      firstName: form.firstName,
      lastName: form.lastName,
    })
    .then(() => {
      studentDrawerOpen.value = false;
      form.indexNumber = '';
      form.firstName = '';
      form.lastName = '';
    })
    .catch(() => {});
}

watch(
  () => auth.tenantId,
  (tenantId) => {
    if (tenantId) studentsStore.fetchStudents();
    else studentsStore.clearStudents();
  },
);

onMounted(() => {
  if (auth.tenantId) studentsStore.fetchStudents();
});
</script>
