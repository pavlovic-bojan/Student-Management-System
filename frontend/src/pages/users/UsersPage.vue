<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h6">{{ t('users.title') }}</div>
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
          :placeholder="t('users.searchPlaceholder')"
          dense
          outlined
          clearable
          debounce="300"
          style="min-width: 330px"
        />
      </div>
      <q-btn
        color="primary"
        :label="t('users.createUser')"
        unelevated
        @click="openCreateUserDrawer"
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
      :rows="filteredUsers"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      data-test="users-table"
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

    <!-- Edit user drawer -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      :width="420"
      data-test="drawer-edit-user"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              {{ t('users.edit') }}
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              :aria-label="t('submitForm.cancel')"
              @click="editDrawerOpen = false"
            />
          </div>

          <q-form ref="editFormRef" class="q-gutter-md" @submit.prevent="saveEdit">
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
            <q-checkbox
              v-model="editForm.suspended"
              :label="t('users.suspended')"
              data-test="checkbox-suspended"
            />

            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                type="submit"
                unelevated
                color="primary"
                :label="t('submitForm.submit')"
                :loading="saving"
                data-test="button-save-edit"
              />
              <q-btn
                flat
                :label="t('submitForm.cancel')"
                color="primary"
                @click="editDrawerOpen = false"
                data-test="button-cancel-edit"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useTenantsStore } from '@/stores/tenants';
import { usersApi, type UserListItem, type UpdateUserRequest } from '@/api/users.api';
import type { UserRole } from '@/api/auth.api';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();
const ui = useUiStore();
const tenantsStore = useTenantsStore();

const PLATFORM_OPTION_ID = '__platform_admins__';

const users = ref<UserListItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedTenantId = ref<string | null>(null);
const editDrawerOpen = ref(false);
const editFormRef = ref<{ validate: () => boolean } | null>(null);
const saving = ref(false);
const deleteDialogOpen = ref(false);
const userToDelete = ref<UserListItem | null>(null);
const deleting = ref(false);

// Global search (name / email)
const searchQuery = ref('');

const columns = computed(() => [
  {
    name: 'name',
    label: t('users.name'),
    field: (row: UserListItem) => `${row.firstName} ${row.lastName}`,
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'email',
    label: t('createUser.email'),
    field: 'email',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'role',
    label: t('createUser.role'),
    field: 'role',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'suspended',
    label: t('users.suspended'),
    field: 'suspended',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: () => '',
    align: 'right' as const,
  },
]);

const tenantSelectOptions = computed(() => {
  if (auth.user?.role !== 'PLATFORM_ADMIN') return tenantsStore.tenants;
  return [
    { id: PLATFORM_OPTION_ID, name: t('users.platformAdminsOption') },
    ...tenantsStore.tenants,
  ];
});

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    if (!searchQuery.value) return true;
    const term = searchQuery.value.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    if (!fullName.includes(term) && !email.includes(term)) return false;
    return true;
  })
);

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
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    // When special "Platform Admin users" option is selected, we don't use tenantId
    if (selectedTenantId.value === PLATFORM_OPTION_ID) return null;
    return selectedTenantId.value;
  }
  return auth.tenantId ?? null;
});

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  try {
    if (auth.user?.role === 'PLATFORM_ADMIN' && selectedTenantId.value === PLATFORM_OPTION_ID) {
      const res = await usersApi.listPlatformAdmins();
      users.value = res.users;
    } else {
      const tenantId = effectiveTenantId.value;
      if (!tenantId) {
        users.value = [];
        return;
      }
      const res = await usersApi.list(tenantId);
      users.value = res.users;
    }
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : t('users.loadError');
    error.value = msg ?? t('users.loadError');
    users.value = [];
  } finally {
    loading.value = false;
  }
}

watch(effectiveTenantId, (id) => {
  if (id !== null || (auth.user?.role === 'PLATFORM_ADMIN' && selectedTenantId.value === PLATFORM_OPTION_ID)) {
    fetchUsers();
  } else {
    users.value = [];
  }
});

onMounted(() => {
  if (auth.user?.role === 'PLATFORM_ADMIN') {
    tenantsStore.fetchTenants();
    selectedTenantId.value = auth.tenantId ?? null;
  }
  if (effectiveTenantId.value) fetchUsers();
});

// Refresh list when a new user is created via global drawer
function handleUserCreated() {
  // Only refresh if we're already in a state where listing users makes sense
  if (auth.user?.role === 'PLATFORM_ADMIN' && !selectedTenantId.value) return;
  void fetchUsers();
}

if (typeof window !== 'undefined') {
  window.addEventListener('user-created', handleUserCreated);
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('user-created', handleUserCreated);
  }
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
  editDrawerOpen.value = true;
}

async function saveEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !editingUser.value) return;
  saving.value = true;
  try {
    const updated = await usersApi.update(editingUser.value.id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      role: editForm.role,
      suspended: editForm.suspended,
    });
    editDrawerOpen.value = false;
    await fetchUsers();
    const notify = ($q as any).notify;
    if (typeof notify === 'function') {
      notify({
        type: 'positive',
        message: t('users.toastUpdated', { email: updated.email }),
      });
    }
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
  const email = userToDelete.value.email;
  deleting.value = true;
  try {
    await usersApi.delete(userToDelete.value.id);
    deleteDialogOpen.value = false;
    userToDelete.value = null;
    await fetchUsers();
    const notify = ($q as any).notify;
    if (typeof notify === 'function') {
      notify({
        type: 'positive',
        message: t('users.toastDeleted', { email }),
      });
    }
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : e instanceof Error ? e.message : '';
    if (msg) error.value = msg;
  } finally {
    deleting.value = false;
  }
}

function openCreateUserDrawer() {
  ui.openCreateUserDrawer();
}
</script>
