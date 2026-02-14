<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('courses.title') }}</div>
        <q-input
          v-model="searchQuery"
          :placeholder="t('courses.searchPlaceholder')"
          dense
          outlined
          clearable
          debounce="300"
          style="min-width: 280px"
          data-test="input-search-courses"
        />
      </div>
      <q-btn
        color="primary"
        :label="t('courses.add')"
        data-test="button-add-course"
        unelevated
        @click="openAddDrawer"
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
      :rows="filteredCourses"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="courses-table"
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
      <template #body-cell-programId="props">
        <q-td :props="props" :data-test="`course-row-${props.row.id}`">
          {{ programName(props.row.programId) }}
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
              :aria-label="t('courses.edit')"
              @click="openEdit(props.row)"
              data-test="button-edit-course"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="sm"
              color="negative"
              :aria-label="t('courses.delete')"
              @click="confirmDelete(props.row)"
              data-test="button-delete-course"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="menu_book" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('courses.empty') }}</div>
    </q-card>

    <!-- Drawer: Add course -->
    <q-drawer
      v-model="addDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-add-course"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('courses.add') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="addDrawerOpen = false" />
          </div>
          <q-form ref="addFormRef" class="q-gutter-md" @submit.prevent="onSubmitAdd" data-test="form-add-course">
            <q-input
              v-model="addForm.name"
              :label="t('courses.name')"
              outlined
              dense
              data-test="input-course-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="addForm.code"
              :label="t('courses.code')"
              outlined
              dense
              data-test="input-course-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-select
              v-model="addForm.programId"
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
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                :label="t('submitForm.submit')"
                :loading="store.loading"
                data-test="button-submit-course"
              />
              <q-btn flat :label="t('submitForm.cancel')" @click="addDrawerOpen = false" data-test="button-cancel-course" />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Drawer: Edit course -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-edit-course"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('courses.edit') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="editDrawerOpen = false" />
          </div>
          <q-form v-if="editingCourse" ref="editFormRef" class="q-gutter-md" @submit.prevent="saveEdit" data-test="form-edit-course">
            <q-input
              v-model="editForm.name"
              :label="t('courses.name')"
              outlined
              dense
              data-test="input-edit-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="editForm.code"
              :label="t('courses.code')"
              outlined
              dense
              data-test="input-edit-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-select
              v-model="editForm.programId"
              :options="programOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              :label="t('courses.program')"
              outlined
              dense
              clearable
              data-test="select-edit-program"
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
    <q-dialog v-model="deleteDialogOpen" persistent data-test="dialog-delete-course">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('courses.delete') }}</div>
          <div class="q-pt-sm">
            {{ t('courses.confirmDelete', { name: courseToDelete?.name ?? '' }) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('submitForm.cancel')" color="primary" v-close-popup data-test="button-cancel-delete" />
          <q-btn
            unelevated
            color="negative"
            :label="t('courses.delete')"
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
import { useCoursesStore } from '@/stores/courses';
import { useProgramsStore } from '@/stores/programs';
import type { Course } from '@/api/courses.api';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();
const store = useCoursesStore();
const programsStore = useProgramsStore();

const searchQuery = ref('');
const addDrawerOpen = ref(false);
const editDrawerOpen = ref(false);
const addFormRef = ref<{ validate: () => boolean } | null>(null);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const deleteDialogOpen = ref(false);
const courseToDelete = ref<Course | null>(null);
const deleting = ref(false);
const editingCourse = ref<Course | null>(null);

const addForm = reactive({ name: '', code: '', programId: '' as string | null });
const editForm = reactive({ name: '', code: '', programId: '' as string | null });

const programOptions = computed(() => programsStore.programs);

const columns = computed(() => [
  { name: 'name', label: t('courses.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'code', label: t('courses.code'), field: 'code', align: 'left' as const, sortable: true },
  { name: 'programId', label: t('courses.program'), field: 'programId', align: 'left' as const, sortable: true },
  { name: 'actions', label: '', field: () => '', align: 'right' as const },
]);

const filteredCourses = computed(() => {
  const list = store.courses;
  if (!searchQuery.value) return list;
  const term = searchQuery.value.toLowerCase();
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      programName(c.programId).toLowerCase().includes(term)
  );
});

function programName(programId: string | null | undefined): string {
  if (!programId) return '—';
  const p = programsStore.programs.find((x) => x.id === programId);
  return p?.name ?? programId;
}

function openAddDrawer() {
  addForm.name = '';
  addForm.code = '';
  addForm.programId = null;
  addDrawerOpen.value = true;
}

function openEdit(row: Course) {
  editingCourse.value = row;
  editForm.name = row.name;
  editForm.code = row.code;
  editForm.programId = row.programId ?? null;
  editDrawerOpen.value = true;
}

function confirmDelete(row: Course) {
  courseToDelete.value = row;
  deleteDialogOpen.value = true;
}

async function onSubmitAdd() {
  if (!addFormRef.value?.validate()) return;
  try {
    const created = await store.createCourse({
      name: addForm.name,
      code: addForm.code,
      programId: addForm.programId || undefined,
    });
    addDrawerOpen.value = false;
    $q.notify({ type: 'positive', message: t('courses.toastCreated', { name: created.name }) });
  } catch {
    // error in store
  }
}

async function saveEdit() {
  if (!editingCourse.value || !editFormRef.value?.validate()) return;
  saving.value = true;
  const id = editingCourse.value.id;
  const name = editingCourse.value.name;
  try {
    await store.updateCourse(id, {
      name: editForm.name,
      code: editForm.code,
      programId: editForm.programId,
    });
    editDrawerOpen.value = false;
    editingCourse.value = null;
    $q.notify({ type: 'positive', message: t('courses.toastUpdated', { name }) });
  } catch {
    // error in store
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!courseToDelete.value) return;
  deleting.value = true;
  const name = courseToDelete.value.name;
  try {
    await store.deleteCourse(courseToDelete.value.id);
    deleteDialogOpen.value = false;
    courseToDelete.value = null;
    $q.notify({ type: 'positive', message: t('courses.toastDeleted', { name }) });
  } catch {
    // error in store
  } finally {
    deleting.value = false;
  }
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
