<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h1 class="text-h5 q-mb-md text-weight-medium">{{ t('tickets') }}</h1>
        <div class="row q-gutter-sm">
          <q-btn
            class="status-chip"
            color="primary"
            outline
            no-caps
            :label="t('statusNew')"
            data-test="status-new"
          />
          <q-btn
            class="status-chip"
            color="primary"
            outline
            no-caps
            :label="t('statusInProgress')"
            data-test="status-in-progress"
          />
          <q-btn
            class="status-chip"
            color="negative"
            outline
            no-caps
            :label="t('statusPriority')"
            data-test="status-priority"
          />
        </div>
      </div>

      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders shadow-1" data-test="card-planned-work">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              {{ t('plannedWorkToday') }}
            </div>
            <div class="column items-center justify-center q-pa-xl camera-placeholder">
              <q-icon name="photo_camera" size="64px" color="grey-6" class="q-mb-md" />
              <div class="text-body2 text-grey-7 q-mb-md">
                {{ t('addPhoto') }}
              </div>
              <q-btn
                color="primary"
                outline
                no-caps
                :label="t('addPhoto')"
                data-test="button-add-photo"
                icon="add_photo_alternate"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4 self-end">
        <q-btn
          unelevated
          color="primary"
          size="lg"
          class="full-width"
          :label="t('submitTicket')"
          data-test="button-submit-ticket"
          icon="send"
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
