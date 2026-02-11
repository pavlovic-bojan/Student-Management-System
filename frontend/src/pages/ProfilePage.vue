<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('profile.title') }}</div>
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row items-center q-gutter-md">
        <q-avatar color="primary" text-color="white" size="40px">
          {{ userInitials }}
        </q-avatar>
        <div>
          <div class="text-subtitle1">{{ userDisplayName }}</div>
          <div class="text-caption text-grey-7">
            {{ roleLabel }}
          </div>
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-form class="q-gutter-md" @submit.prevent="onSubmit">
        <q-input
          v-model="form.firstName"
          :label="t('createUser.firstName')"
          outlined
          dense
          :disable="!canEdit"
        />
        <q-input
          v-model="form.lastName"
          :label="t('createUser.lastName')"
          outlined
          dense
          :disable="!canEdit"
        />
        <q-input
          v-model="form.email"
          :label="t('createUser.email')"
          outlined
          dense
          disable
        />

        <q-banner
          v-if="!canEdit"
          class="bg-grey-2 text-grey-9"
          rounded
        >
          {{ t('profile.readOnlyHint') }}
        </q-banner>

        <div v-else class="row q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            :label="t('profile.save')"
            unelevated
            :loading="saving"
            data-test="button-save-profile"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth';
import { usersApi } from '@/api/users.api';

const { t } = useI18n();
const $q = useQuasar();
const auth = useAuthStore();

const form = reactive({
  firstName: auth.user?.firstName ?? '',
  lastName: auth.user?.lastName ?? '',
  email: auth.user?.email ?? '',
});

const saving = reactive({ value: false });

const canEdit = computed(() => {
  const role = auth.user?.role;
  return role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN';
});

const userDisplayName = computed(() => {
  const u = auth.user;
  if (!u) return '';
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const userInitials = computed(() => {
  const u = auth.user;
  if (!u) return '?';
  const first = (u.firstName ?? '').trim();
  const last = (u.lastName ?? '').trim();
  const f = first.charAt(0);
  const l = last.charAt(0);
  const emailFirst = (u.email ?? '').trim().charAt(0) || '?';
  const initials = (f + l) || f || emailFirst;
  return initials.toUpperCase();
});

const roleLabel = computed(() => {
  const role = auth.user?.role;
  if (!role) return '';
  const map: Record<string, string> = {
    PLATFORM_ADMIN: t('header.rolePlatformAdmin'),
    SCHOOL_ADMIN: t('header.roleSchoolAdmin'),
    PROFESSOR: t('header.roleProfessor'),
    STUDENT: t('header.roleStudent'),
  };
  return map[role] ?? role;
});

async function onSubmit() {
  if (!auth.user || !canEdit.value) return;
  saving.value = true;
  try {
    const updated = await usersApi.update(auth.user.id, {
      firstName: form.firstName,
      lastName: form.lastName,
    });
    // refresh auth store user
    auth.setCredentials(
      {
        ...auth.user,
        firstName: updated.firstName,
        lastName: updated.lastName,
      },
      auth.token as string,
    );
    $q.notify({
      type: 'positive',
      message: t('profile.updated'),
    });
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: t('profile.updateError'),
    });
  } finally {
    saving.value = false;
  }
}
</script>

