<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('tenants.title') }}</div>
        <q-input
          v-model="searchQuery"
          :placeholder="t('tenants.searchPlaceholder')"
          dense
          outlined
          clearable
          debounce="300"
          style="min-width: 280px"
          data-test="input-search-tenants"
        />
      </div>
      <q-btn
        color="primary"
        :label="t('tenants.add')"
        data-test="button-add-tenant"
        unelevated
        @click="openAddDrawer"
      />
    </div>

    <q-linear-progress v-if="store.loading" indeterminate color="primary" class="q-mb-md" />
    <q-banner v-else-if="store.error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ store.error }}
    </q-banner>

    <q-table
      v-else-if="store.tenants.length"
      :rows="filteredTenants"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="tenants-table"
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
        <q-td :props="props" :data-test="`tenant-row-${props.row.id}`">{{ props.row.name }}</q-td>
      </template>
      <template #body-cell-isActive="props">
        <q-td :props="props">
          <q-icon :name="props.row.isActive ? 'check_circle' : 'cancel'" :color="props.row.isActive ? 'positive' : 'grey'" size="sm" />
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="edit"
            size="sm"
            :aria-label="t('tenants.edit')"
            @click="openEdit(props.row)"
            data-test="button-edit-tenant"
          />
        </q-td>
      </template>
    </q-table>

    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="business" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('tenants.empty') }}</div>
    </q-card>

    <!-- Drawer: Add tenant -->
    <q-drawer
      v-model="addDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-add-tenant"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('tenants.add') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="addDrawerOpen = false" />
          </div>
          <q-form ref="addFormRef" class="q-gutter-md" @submit.prevent="onSubmitAdd" data-test="form-add-tenant">
            <q-input
              v-model="addForm.name"
              :label="t('tenants.name')"
              outlined
              dense
              data-test="input-tenant-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="addForm.code"
              :label="t('tenants.code')"
              outlined
              dense
              data-test="input-tenant-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                :label="t('submitForm.submit')"
                :loading="store.loading"
                data-test="button-submit-tenant"
              />
              <q-btn flat :label="t('submitForm.cancel')" @click="addDrawerOpen = false" data-test="button-cancel-tenant" />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Drawer: Edit tenant -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-edit-tenant"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">{{ t('tenants.edit') }}</div>
            <q-btn flat round dense icon="close" :aria-label="t('submitForm.cancel')" @click="editDrawerOpen = false" />
          </div>
          <q-form v-if="editingTenant" ref="editFormRef" class="q-gutter-md" @submit.prevent="saveEdit" data-test="form-edit-tenant">
            <q-input
              v-model="editForm.name"
              :label="t('tenants.name')"
              outlined
              dense
              data-test="input-edit-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="editForm.code"
              :label="t('tenants.code')"
              outlined
              dense
              data-test="input-edit-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-checkbox
              v-model="editForm.isActive"
              :label="t('tenants.active')"
              color="primary"
              data-test="input-edit-active"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useTenantsStore } from '@/stores/tenants';
import type { Tenant } from '@/api/tenants.api';

const { t } = useI18n();
const $q = useQuasar();
const store = useTenantsStore();

const searchQuery = ref('');
const addDrawerOpen = ref(false);
const editDrawerOpen = ref(false);
const addFormRef = ref<{ validate: () => boolean } | null>(null);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const editingTenant = ref<Tenant | null>(null);

const addForm = reactive({ name: '', code: '' });
const editForm = reactive({ name: '', code: '', isActive: true });

const columns = computed(() => [
  { name: 'name', label: t('tenants.name'), field: 'name', align: 'left' as const, sortable: true },
  { name: 'code', label: t('tenants.code'), field: 'code', align: 'left' as const, sortable: true },
  { name: 'isActive', label: t('tenants.active'), field: 'isActive', align: 'center' as const, sortable: true },
  { name: 'actions', label: '', field: () => '', align: 'right' as const },
]);

const filteredTenants = computed(() => {
  const list = store.tenants;
  if (!searchQuery.value) return list;
  const term = searchQuery.value.toLowerCase();
  return list.filter(
    (t) => t.name.toLowerCase().includes(term) || t.code.toLowerCase().includes(term)
  );
});

function openAddDrawer() {
  addForm.name = '';
  addForm.code = '';
  addDrawerOpen.value = true;
}

function openEdit(row: Tenant) {
  editingTenant.value = row;
  editForm.name = row.name;
  editForm.code = row.code;
  editForm.isActive = row.isActive;
  editDrawerOpen.value = true;
}

async function onSubmitAdd() {
  if (!addFormRef.value?.validate()) return;
  try {
    const created = await store.createTenant(addForm.name, addForm.code);
    addDrawerOpen.value = false;
    $q.notify({ type: 'positive', message: t('tenants.toastCreated', { name: created.name }) });
  } catch {
    // error in store
  }
}

async function saveEdit() {
  if (!editingTenant.value || !editFormRef.value?.validate()) return;
  saving.value = true;
  const id = editingTenant.value.id;
  const name = editingTenant.value.name;
  try {
    await store.updateTenant(id, {
      name: editForm.name,
      code: editForm.code,
      isActive: editForm.isActive,
    });
    editDrawerOpen.value = false;
    editingTenant.value = null;
    $q.notify({ type: 'positive', message: t('tenants.toastUpdated', { name }) });
  } catch {
    // error in store
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  store.fetchTenants();
});
</script>
