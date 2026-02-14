<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('programs.title') }}</div>
        <q-input
          v-model="searchQuery"
          :placeholder="t('programs.searchPlaceholder')"
          dense
          outlined
          clearable
          debounce="300"
          style="min-width: 280px"
          data-test="input-search-programs"
        />
      </div>
      <q-btn
        color="primary"
        :label="t('programs.add')"
        data-test="button-add-program"
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
      v-else-if="store.programs.length"
      :rows="filteredPrograms"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="programs-table"
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
        <q-td :props="props" :data-test="`program-row-${props.row.id}`">{{ props.row.name }}</q-td>
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
              :aria-label="t('programs.edit')"
              @click="openEdit(props.row)"
              data-test="button-edit-program"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="sm"
              color="negative"
              :aria-label="t('programs.delete')"
              @click="confirmDelete(props.row)"
              data-test="button-delete-program"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="school" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('programs.empty') }}</div>
    </q-card>

    <!-- Drawer: Add program -->
    <q-drawer
      v-model="addDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-add-program"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('programs.add') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="addDrawerOpen = false" />
          </div>
          <q-form ref="addFormRef" class="q-gutter-md" @submit.prevent="onSubmitAdd" data-test="form-add-program">
            <q-input
              v-model="addForm.name"
              :label="t('programs.name')"
              outlined
              dense
              data-test="input-program-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="addForm.code"
              :label="t('programs.code')"
              outlined
              dense
              data-test="input-program-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                :label="t('submitForm.submit')"
                :loading="store.loading"
                data-test="button-submit-program"
              />
              <q-btn flat :label="t('submitForm.cancel')" @click="addDrawerOpen = false" data-test="button-cancel-program" />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Drawer: Edit program -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-edit-program"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('programs.edit') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="editDrawerOpen = false" />
          </div>
          <q-form v-if="editingProgram" ref="editFormRef" class="q-gutter-md" @submit.prevent="saveEdit" data-test="form-edit-program">
            <q-input
              v-model="editForm.name"
              :label="t('programs.name')"
              outlined
              dense
              data-test="input-edit-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="editForm.code"
              :label="t('programs.code')"
              outlined
              dense
              data-test="input-edit-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
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
    <q-dialog v-model="deleteDialogOpen" persistent data-test="dialog-delete-program">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('programs.delete') }}</div>
          <div class="q-pt-sm">
            {{ t('programs.confirmDelete', { name: programToDelete?.name ?? '' }) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('submitForm.cancel')" color="primary" v-close-popup data-test="button-cancel-delete" />
          <q-btn
            unelevated
            color="negative"
            :label="t('programs.delete')"
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
import { useProgramsStore } from '@/stores/programs';
import type { Program } from '@/api/programs.api';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();
const store = useProgramsStore();

const searchQuery = ref('');
const addDrawerOpen = ref(false);
const editDrawerOpen = ref(false);
const addFormRef = ref<{ validate: () => boolean } | null>(null);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const deleteDialogOpen = ref(false);
const programToDelete = ref<Program | null>(null);
const deleting = ref(false);
const editingProgram = ref<Program | null>(null);

const addForm = reactive({ name: '', code: '' });
const editForm = reactive({ name: '', code: '' });

const columns = computed(() => [
  { name: 'name', label: t('programs.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'code', label: t('programs.code'), field: 'code', align: 'left' as const, sortable: true },
  { name: 'version', label: t('programs.version'), field: 'version', align: 'center' as const, sortable: true },
  { name: 'actions', label: '', field: () => '', align: 'right' as const },
]);

const filteredPrograms = computed(() => {
  const list = store.programs;
  if (!searchQuery.value) return list;
  const term = searchQuery.value.toLowerCase();
  return list.filter(
    (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
  );
});

function openAddDrawer() {
  addForm.name = '';
  addForm.code = '';
  addDrawerOpen.value = true;
}

function openEdit(row: Program) {
  editingProgram.value = row;
  editForm.name = row.name;
  editForm.code = row.code;
  editDrawerOpen.value = true;
}

function confirmDelete(row: Program) {
  programToDelete.value = row;
  deleteDialogOpen.value = true;
}

async function onSubmitAdd() {
  if (!addFormRef.value?.validate()) return;
  try {
    const created = await store.createProgram({ name: addForm.name, code: addForm.code });
    addDrawerOpen.value = false;
    $q.notify({ type: 'positive', message: t('programs.toastCreated', { name: created.name }) });
  } catch {
    // error in store
  }
}

async function saveEdit() {
  if (!editingProgram.value || !editFormRef.value?.validate()) return;
  saving.value = true;
  const id = editingProgram.value.id;
  const name = editingProgram.value.name;
  try {
    await store.updateProgram(id, { name: editForm.name, code: editForm.code });
    editDrawerOpen.value = false;
    editingProgram.value = null;
    $q.notify({ type: 'positive', message: t('programs.toastUpdated', { name }) });
  } catch {
    // error in store
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!programToDelete.value) return;
  deleting.value = true;
  const name = programToDelete.value.name;
  try {
    await store.deleteProgram(programToDelete.value.id);
    deleteDialogOpen.value = false;
    programToDelete.value = null;
    $q.notify({ type: 'positive', message: t('programs.toastDeleted', { name }) });
  } catch {
    // error in store
  } finally {
    deleting.value = false;
  }
}

watch(
  () => auth.tenantId,
  (id) => {
    if (id) store.fetchPrograms();
    else store.clearPrograms();
  },
);

onMounted(() => {
  if (auth.tenantId) store.fetchPrograms();
});
</script>
