<template>
  <q-page class="q-pa-md dashboard-page">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="text-h6 q-mb-md">{{ t('tickets') }}</div>
        <div class="row q-col-gutter-sm">
          <q-btn
            class="status-chip"
            color="primary"
            outline
            :label="t('statusNew')"
            data-test="status-new"
          />
          <q-btn
            class="status-chip"
            color="primary"
            outline
            :label="t('statusInProgress')"
            data-test="status-in-progress"
          />
          <q-btn
            class="status-chip"
            color="negative"
            outline
            :label="t('statusPriority')"
            data-test="status-priority"
          />
        </div>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered data-test="card-planned-work">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">
              {{ t('plannedWorkToday') }}
            </div>
            <div class="column items-center q-pa-md camera-placeholder">
              <q-icon name="photo_camera" size="48px" class="q-mb-sm" />
              <div class="text-caption q-mb-md">
                {{ t('addPhoto') }}
              </div>
              <q-btn
                color="primary"
                :label="t('addPhoto')"
                data-test="button-add-photo"
                flat
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4 self-end">
        <q-btn
          unelevated
          color="primary"
          class="full-width q-mt-md"
          :label="t('submitTicket')"
          data-test="button-submit-ticket"
          @click="ui.openSubmitDrawer"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUiStore } from '@/stores/ui';

const { t } = useI18n();
const ui = useUiStore();
</script>

<style scoped>
.dashboard-page {
  background-color: #f5f7fb;
}

.status-chip {
  min-width: 120px;
}

.camera-placeholder {
  border: 1px dashed #c0c4ce;
  border-radius: 8px;
}
</style>
