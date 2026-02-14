<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('students.title') }}</div>
        <!-- Institution dropdown only for Platform Admin; School Admin / Professor use their auth tenantId -->
        <q-select
          v-if="auth.user?.role === 'PLATFORM_ADMIN'"
          v-model="selectedTenantId"
          :label="t('createUser.tenant')"
          :options="tenantSelectOptions"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          outlined
          dense
          :loading="tenantsStore.loading"
          style="min-width: 220px"
          data-test="select-tenant"
        />
        <q-input
          v-model="searchQuery"
          :placeholder="t('students.searchPlaceholder')"
          dense
          outlined
          clearable
          debounce="300"
          style="min-width: 280px"
          data-test="input-search-students"
        />
      </div>
      <q-btn
        color="primary"
        :label="t('students.add')"
        data-test="button-add-student"
        unelevated
        @click="openAddDrawer"
      />
    </div>

    <q-banner
      v-if="auth.user?.role === 'PLATFORM_ADMIN' && !selectedTenantId"
      class="bg-warning text-dark"
      rounded
      data-test="banner-select-tenant"
    >
      {{ t('users.selectTenant') }}
    </q-banner>
    <q-banner
      v-else-if="auth.user?.role !== 'PLATFORM_ADMIN' && !auth.tenantId"
      class="bg-warning text-dark"
      rounded
      data-test="banner-no-tenant"
    >
      {{ t('tenant.selectHint') }}
    </q-banner>

    <q-linear-progress
      v-else-if="effectiveTenantId && studentsStore.loading"
      indeterminate
      color="primary"
      class="q-mb-md"
    />
    <q-banner v-else-if="studentsStore.error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ studentsStore.error }}
    </q-banner>

    <q-table
      v-else-if="effectiveTenantId && studentsStore.students.length"
      :rows="filteredStudents"
      :columns="columns"
      row-key="enrollmentId"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="students-table"
    >
      <template #header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="col.name !== 'actions' ? 'cursor-pointer' : ''"
            @click="col.name !== 'actions' && props.setSort(col)"
          >
            <div class="row items-center no-wrap">
              <span>{{ col.label }}</span>
              <q-icon
                v-if="props.sortBy === col.name"
                :name="props.descending ? 'arrow_downward' : 'arrow_upward'"
                size="16px"
                class="q-ml-xs"
              />
            </div>
          </q-th>
        </q-tr>
      </template>
      <template #body-cell-name="props">
        <q-td :props="props" :data-test="`student-row-${props.row.enrollmentId}`">
          {{ props.row.firstName }} {{ props.row.lastName }}
        </q-td>
      </template>
      <template #body-cell-tenantName="props">
        <q-td :props="props">{{ props.row.tenantName ?? '—' }}</q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          {{ statusLabel(props.row.status) }}
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="edit"
              size="sm"
              :aria-label="t('students.edit')"
              @click="openEdit(props.row)"
              data-test="button-edit-student"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="sm"
              color="negative"
              :aria-label="t('students.delete')"
              @click="confirmDelete(props.row)"
              data-test="button-delete-student"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <q-card
      v-else-if="effectiveTenantId"
      flat
      bordered
      class="q-pa-lg text-center"
      data-test="empty-students"
    >
      <q-icon name="people_outline" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('students.empty') }}</div>
    </q-card>

    <!-- Drawer: Add student -->
    <q-drawer
      v-model="addDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-add-student"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('students.add') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="addDrawerOpen = false" />
          </div>
          <q-form ref="addFormRef" class="q-gutter-md" @submit.prevent="onSubmitAdd" data-test="form-add-student">
            <!-- Tenant (institution) only for Platform Admin; School Admin / Professor use auth tenantId -->
            <q-select
              v-if="auth.user?.role === 'PLATFORM_ADMIN'"
              v-model="addForm.tenantId"
              :options="tenantSelectOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              :label="t('createUser.tenant')"
              outlined
              dense
              clearable
              :rules="[(v: string) => (auth.user?.role === 'PLATFORM_ADMIN' ? !!v : true) || t('validation.required')]"
              data-test="select-add-tenant"
            />
            <q-input
              v-model="addForm.indexNumber"
              :label="t('students.indexNumber')"
              outlined
              dense
              data-test="input-index-number"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="addForm.firstName"
              :label="t('students.firstName')"
              outlined
              dense
              data-test="input-first-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="addForm.lastName"
              :label="t('students.lastName')"
              outlined
              dense
              data-test="input-last-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                :label="t('submitForm.submit')"
                :loading="studentsStore.loading"
                data-test="button-submit-student"
              />
              <q-btn flat :label="t('submitForm.cancel')" @click="addDrawerOpen = false" data-test="button-cancel-student" />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Drawer: Edit student -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-edit-student"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('students.edit') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="editDrawerOpen = false" />
          </div>
          <q-form v-if="editingStudent" ref="editFormRef" class="q-gutter-md" @submit.prevent="saveEdit" data-test="form-edit-student">
            <q-input
              v-model="editForm.firstName"
              :label="t('students.firstName')"
              outlined
              dense
              data-test="input-edit-firstName"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="editForm.lastName"
              :label="t('students.lastName')"
              outlined
              dense
              data-test="input-edit-lastName"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-select
              v-model="editForm.status"
              :label="t('students.status')"
              :options="statusOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              data-test="select-edit-status"
            />
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                :label="t('submitForm.submit')"
                :loading="saving"
                data-test="button-save-edit"
              />
              <q-btn flat :label="t('submitForm.cancel')" @click="editDrawerOpen = false" data-test="button-cancel-edit" />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Delete confirm -->
    <q-dialog v-model="deleteDialogOpen" persistent data-test="dialog-delete-student">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('students.delete') }}</div>
          <div class="q-pt-sm">
            {{ t('students.confirmDelete', { name: studentToDelete ? `${studentToDelete.firstName} ${studentToDelete.lastName}` : '' }) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('submitForm.cancel')" color="primary" v-close-popup data-test="button-cancel-delete" />
          <q-btn
            unelevated
            color="negative"
            :label="t('students.delete')"
            :loading="deleting"
            @click="doDelete"
            data-test="button-confirm-delete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useStudentsStore } from '@/stores/students';
import { useTenantsStore } from '@/stores/tenants';
import type { StudentListItem, StudentStatus } from '@/api/students.api';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();
const studentsStore = useStudentsStore();
const tenantsStore = useTenantsStore();

const searchQuery = ref('');
const addDrawerOpen = ref(false);
const editDrawerOpen = ref(false);
const addFormRef = ref<{ validate: () => boolean } | null>(null);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const deleteDialogOpen = ref(false);
const studentToDelete = ref<StudentListItem | null>(null);
const deleting = ref(false);
const editingStudent = ref<StudentListItem | null>(null);

const selectedTenantId = ref<string | null>(null);

const addForm = reactive({
  tenantId: '' as string | null,
  indexNumber: '',
  firstName: '',
  lastName: '',
});

const editForm = reactive({
  firstName: '',
  lastName: '',
  status: '' as StudentStatus,
});

const statusOptions = computed(() => [
  { label: t('students.statusActive'), value: 'ACTIVE' },
  { label: t('students.statusGraduated'), value: 'GRADUATED' },
  { label: t('students.statusDropped'), value: 'DROPPED' },
  { label: t('students.statusSuspended'), value: 'SUSPENDED' },
]);

const effectiveTenantId = computed(() =>
  auth.user?.role === 'PLATFORM_ADMIN' ? selectedTenantId.value : auth.tenantId ?? null,
);

const tenantSelectOptions = computed(() => tenantsStore.tenants);

const columns = computed(() => [
  { name: 'indexNumber', label: t('students.indexNumber'), field: 'indexNumber', align: 'left' as const, sortable: true },
  { name: 'name', label: t('users.name'), field: (row: StudentListItem) => `${row.firstName} ${row.lastName}`, align: 'left' as const, sortable: true },
  { name: 'tenantName', label: t('students.institution'), field: 'tenantName', align: 'left' as const, sortable: true },
  { name: 'status', label: t('students.status'), field: 'status', align: 'left' as const, sortable: true },
  { name: 'actions', label: '', field: () => '', align: 'right' as const },
]);

const filteredStudents = computed(() => {
  const list = studentsStore.students;
  if (!searchQuery.value) return list;
  const term = searchQuery.value.toLowerCase();
  return list.filter(
    (s) =>
      s.indexNumber.toLowerCase().includes(term) ||
      s.firstName.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term)
  );
});

function statusLabel(status: string): string {
  const key =
    status === 'ACTIVE'
      ? 'students.statusActive'
      : status === 'GRADUATED'
        ? 'students.statusGraduated'
        : status === 'DROPPED'
          ? 'students.statusDropped'
          : 'students.statusSuspended';
  return t(key);
}

function openAddDrawer() {
  addForm.tenantId = auth.user?.role === 'PLATFORM_ADMIN' ? selectedTenantId.value : null;
  addForm.indexNumber = '';
  addForm.firstName = '';
  addForm.lastName = '';
  addDrawerOpen.value = true;
}

function openEdit(row: StudentListItem) {
  editingStudent.value = row;
  editForm.firstName = row.firstName;
  editForm.lastName = row.lastName;
  editForm.status = (row.status as StudentStatus) || 'ACTIVE';
  editDrawerOpen.value = true;
}

function confirmDelete(row: StudentListItem) {
  studentToDelete.value = row;
  deleteDialogOpen.value = true;
}

async function onSubmitAdd() {
  if (!addFormRef.value?.validate()) return;
  try {
    await studentsStore.createStudent({
      indexNumber: addForm.indexNumber,
      firstName: addForm.firstName,
      lastName: addForm.lastName,
      tenantId:
        auth.user?.role === 'PLATFORM_ADMIN' ? addForm.tenantId ?? undefined : undefined,
    });
    addDrawerOpen.value = false;
    $q.notify({ type: 'positive', message: t('students.toastCreated', { index: addForm.indexNumber }) });
  } catch {
    // error in store
  }
}

async function saveEdit() {
  if (!editingStudent.value || !editFormRef.value?.validate()) return;
  saving.value = true;
  const studentId = editingStudent.value.studentId;
  const index = editingStudent.value.indexNumber;
  try {
    await studentsStore.updateStudent(studentId, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      status: editForm.status as StudentStatus,
    });
    editDrawerOpen.value = false;
    editingStudent.value = null;
    $q.notify({ type: 'positive', message: t('students.toastUpdated', { index }) });
  } catch {
    // error in store
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!studentToDelete.value) return;
  deleting.value = true;
  const index = studentToDelete.value.indexNumber;
  try {
    await studentsStore.deleteEnrollment(studentToDelete.value.enrollmentId);
    deleteDialogOpen.value = false;
    studentToDelete.value = null;
    $q.notify({ type: 'positive', message: t('students.toastDeleted', { index }) });
  } catch {
    // error in store
  } finally {
    deleting.value = false;
  }
}

watch(effectiveTenantId, (id) => {
  if (id) studentsStore.fetchStudents(auth.user?.role === 'PLATFORM_ADMIN' ? id : undefined);
  else studentsStore.clearStudents();
});

onMounted(() => {
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    tenantsStore.fetchTenants();
    selectedTenantId.value = auth.tenantId ?? null;
  }
  if (effectiveTenantId.value) {
    studentsStore.fetchStudents(
      auth.user?.role === 'PLATFORM_ADMIN' ? effectiveTenantId.value ?? undefined : undefined,
    );
  }
});
</script>
