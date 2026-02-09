<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('programs.title') }}</div>
      <q-btn
        color="primary"
        :label="t('programs.add')"
        data-test="button-add-program"
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
      v-else-if="store.programs.length"
      :rows="store.programs"
      :columns="columns"
      row-key="id"
      flat
      bordered
      data-test="programs-table"
      :rows-per-page-options="[10, 25, 50]"
    >
      <template #body-cell-name="props">
        <q-td :data-test="`program-row-${props.row.id}`">{{ props.row.name }}</q-td>
      </template>
    </q-table>
    <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-state">
      <q-icon name="school" size="48px" class="q-mb-sm" />
      <div class="text-body2">{{ t('programs.empty') }}</div>
    </q-card>

    <q-drawer
      v-model="drawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-program"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('programs.add') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmit" data-test="form-add-program">
            <q-input
              v-model="form.name"
              :label="t('programs.name')"
              outlined
              dense
              data-test="input-program-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model="form.code"
              :label="t('programs.code')"
              outlined
              dense
              data-test="input-program-code"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-program"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-program"
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useProgramsStore } from '@/stores/programs';

const { t } = useI18n();
const auth = useAuthStore();
const store = useProgramsStore();

const drawerOpen = ref(false);
const form = reactive({ name: '', code: '' });

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
  { name: 'version', label: 'Ver', field: 'version', align: 'center' as const },
];

function onSubmit() {
  store
    .createProgram({ name: form.name, code: form.code })
    .then(() => {
      drawerOpen.value = false;
      form.name = '';
      form.code = '';
    })
    .catch(() => {});
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
