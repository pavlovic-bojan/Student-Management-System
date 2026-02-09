<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('users.title') }}</div>
        <q-select
          v-if="auth.user?.role === 'PLATFORM_ADMIN'"
          v-model="selectedTenantId"
          :label="t('createUser.tenant')"
          :options="tenantsStore.tenants"
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
      </div>
      <q-btn
        color="primary"
        :label="t('users.createUser')"
        unelevated
        :to="{ name: 'create-user' }"
        data-test="button-create-user"
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

    <q-linear-progress v-else-if="loading" indeterminate color="primary" class="q-mb-md" />
    <q-banner v-else-if="error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ error }}
    </q-banner>

    <q-table
      v-else-if="users.length"
      :rows="users"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="users-table"
    >
      <template #body-cell-name="props">
        <q-td :props="props">
          {{ props.row.firstName }} {{ props.row.lastName }}
        </q-td>
      </template>
      <template #body-cell-role="props">
        <q-td :props="props">
          {{ roleLabel(props.row.role) }}
        </q-td>
      </template>
      <template #body-cell-suspended="props">
        <q-td :props="props">
          <q-chip v-if="props.row.suspended" color="negative" size="sm" dense>
            {{ t('users.suspended') }}
          </q-chip>
          <span v-else class="text-green">—</span>
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
              :aria-label="t('users.edit')"
              @click="openEdit(props.row)"
              data-test="button-edit-user"
            />
            <q-btn
              flat
              dense
              round
              :icon="props.row.suspended ? 'lock_open' : 'lock'"
              size="sm"
              :aria-label="props.row.suspended ? t('users.unsuspend') : t('users.suspend')"
              :disable="props.row.id === auth.user?.id"
              @click="toggleSuspend(props.row)"
              :data-test="props.row.suspended ? 'button-unsuspend' : 'button-suspend'"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="sm"
              color="negative"
              :aria-label="t('users.delete')"
              :disable="props.row.id === auth.user?.id"
              @click="confirmDelete(props.row)"
              data-test="button-delete-user"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-users">
      <q-icon name="people_outline" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('users.empty') }}</div>
    </q-card>

    <!-- Edit user dialog -->
    <q-dialog v-model="editDialogOpen" persistent data-test="dialog-edit-user">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">{{ t('users.edit') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="editFormRef" class="q-gutter-md" @submit="saveEdit">
            <q-input
              v-model="editForm.firstName"
              :label="t('createUser.firstName')"
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="input-edit-firstName"
            />
            <q-input
              v-model="editForm.lastName"
              :label="t('createUser.lastName')"
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="input-edit-lastName"
            />
            <q-select
              v-model="editForm.role"
              :label="t('createUser.role')"
              :options="editRoleOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              :rules="[(v: string) => !!v || t('validation.required')]"
              data-test="select-edit-role"
            />
            <q-checkbox v-model="editForm.suspended" :label="t('users.suspended')" data-test="checkbox-suspended" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('submitForm.cancel')" color="primary" v-close-popup data-test="button-cancel-edit" />
          <q-btn
            unelevated
            color="primary"
            :label="t('submitForm.submit')"
            :loading="saving"
            @click="saveEdit"
            data-test="button-save-edit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="deleteDialogOpen" persistent data-test="dialog-delete-user">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('users.delete') }}</div>
          <div class="q-pt-sm">{{ t('users.confirmDelete', { name: userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : '' }) }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('submitForm.cancel')" color="primary" v-close-popup data-test="button-cancel-delete" />
          <q-btn
            unelevated
            color="negative"
            :label="t('users.delete')"
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
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useTenantsStore } from '@/stores/tenants';
import { usersApi, type UserListItem, type UpdateUserRequest } from '@/api/users.api';
import type { UserRole } from '@/api/auth.api';

const { t } = useI18n();
const auth = useAuthStore();
const tenantsStore = useTenantsStore();

const users = ref<UserListItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedTenantId = ref<string | null>(null);
const editDialogOpen = ref(false);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const deleteDialogOpen = ref(false);
const userToDelete = ref<UserListItem | null>(null);
const deleting = ref(false);

const columns = [
  { name: 'name', label: () => t('users.name'), field: (row: UserListItem) => `${row.firstName} ${row.lastName}`, align: 'left' as const },
  { name: 'email', label: () => t('createUser.email'), field: 'email', align: 'left' as const },
  { name: 'role', label: () => t('createUser.role'), field: 'role', align: 'left' as const },
  { name: 'suspended', label: () => t('users.suspended'), field: 'suspended', align: 'center' as const },
  { name: 'actions', label: '', field: () => '', align: 'right' as const },
];

function roleLabel(role: UserRole): string {
  const key = role === 'PLATFORM_ADMIN' ? 'createUser.rolePlatformAdmin' : role === 'SCHOOL_ADMIN' ? 'createUser.roleSchoolAdmin' : role === 'PROFESSOR' ? 'createUser.roleProfessor' : 'createUser.roleStudent';
  return t(key);
}

const editRoleOptions = computed(() => {
  const base = [
    { label: t('createUser.roleSchoolAdmin'), value: 'SCHOOL_ADMIN' },
    { label: t('createUser.roleProfessor'), value: 'PROFESSOR' },
    { label: t('createUser.roleStudent'), value: 'STUDENT' },
  ];
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    return [{ label: t('createUser.rolePlatformAdmin'), value: 'PLATFORM_ADMIN' }, ...base];
  }
  return base;
});

const effectiveTenantId = computed(() => {
  if (auth.user?.role === 'PLATFORM_ADMIN') return selectedTenantId.value;
  return auth.tenantId ?? null;
});

async function fetchUsers() {
  const tenantId = effectiveTenantId.value;
  if (!tenantId) {
    users.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const res = await usersApi.list(tenantId);
    users.value = res.users;
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : t('users.loadError');
    error.value = msg ?? t('users.loadError');
    users.value = [];
  } finally {
    loading.value = false;
  }
}

watch(effectiveTenantId, (id) => {
  if (id) fetchUsers();
  else users.value = [];
});

onMounted(() => {
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    tenantsStore.fetchTenants();
    selectedTenantId.value = auth.tenantId ?? null;
  }
  if (effectiveTenantId.value) fetchUsers();
});

// Edit
const editingUser = ref<UserListItem | null>(null);
const editForm = reactive<UpdateUserRequest & { role: UserRole }>({
  firstName: '',
  lastName: '',
  role: 'STUDENT',
  suspended: false,
});

function openEdit(row: UserListItem) {
  editingUser.value = row;
  editForm.firstName = row.firstName;
  editForm.lastName = row.lastName;
  editForm.role = row.role;
  editForm.suspended = row.suspended;
  editDialogOpen.value = true;
}

async function saveEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !editingUser.value) return;
  saving.value = true;
  try {
    await usersApi.update(editingUser.value.id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      role: editForm.role,
      suspended: editForm.suspended,
    });
    editDialogOpen.value = false;
    await fetchUsers();
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : '';
    if (msg) error.value = msg;
  } finally {
    saving.value = false;
  }
}

function toggleSuspend(row: UserListItem) {
  if (row.id === auth.user?.id) return;
  usersApi
    .update(row.id, { suspended: !row.suspended })
    .then(() => fetchUsers())
    .catch((e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : '';
      if (msg) error.value = msg;
    });
}

function confirmDelete(row: UserListItem) {
  userToDelete.value = row;
  deleteDialogOpen.value = true;
}

async function doDelete() {
  if (!userToDelete.value) return;
  deleting.value = true;
  try {
    await usersApi.delete(userToDelete.value.id);
    deleteDialogOpen.value = false;
    userToDelete.value = null;
    await fetchUsers();
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : '';
    if (msg) error.value = msg;
  } finally {
    deleting.value = false;
  }
}
</script>
