<template>
  <q-page class="tickets-page q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <h1 class="text-h5 text-weight-medium q-mb-xs">{{ t('tickets') }}</h1>
            <div class="text-caption text-grey-7">
              {{ t('ticketsSubtitle') }}
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              class="status-chip"
              :color="statusFilter === 'NEW' ? 'primary' : 'grey-5'"
              :outline="statusFilter !== 'NEW'"
              no-caps
              :label="t('statusNew')"
              data-test="status-new"
              @click="setStatusFilter('NEW')"
            />
            <q-btn
              class="status-chip"
              :color="statusFilter === 'IN_PROGRESS' ? 'primary' : 'grey-5'"
              :outline="statusFilter !== 'IN_PROGRESS'"
              no-caps
              :label="t('statusInProgress')"
              data-test="status-in-progress"
              @click="setStatusFilter('IN_PROGRESS')"
            />
            <q-btn
              class="status-chip"
              :color="statusFilter === 'RESOLVED' ? 'positive' : 'grey-5'"
              :outline="statusFilter !== 'RESOLVED'"
              no-caps
              :label="t('statusResolved')"
              data-test="status-resolved"
              @click="setStatusFilter('RESOLVED')"
            />
            <q-btn
              class="status-chip"
              :color="priorityOnly ? 'negative' : 'grey-5'"
              :outline="!priorityOnly"
              no-caps
              :label="t('statusPriority')"
              data-test="status-priority"
              @click="togglePriorityOnly"
            />
          </div>
        </div>
      </div>

      <div class="col-12">
        <q-card flat bordered class="rounded-borders shadow-1" data-test="card-tickets-table">
          <q-table
            :rows="filteredTickets"
            :columns="columns"
            row-key="id"
            :loading="loading"
            flat
            dense
            :pagination="{ rowsPerPage: 10 }"
            data-test="table-tickets"
            @row-click="onRowClick"
          >
            <template #body-cell-tenant="props">
              <q-td :props="props">
                {{ isPlatformTicket(props.row) ? t('ticketsPlatformScope') : props.row.tenantName }}
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="statusColorMap[props.row.status]"
                  :label="statusLabelMap[props.row.status]"
                  class="q-px-sm q-py-xs"
                  rounded
                />
              </q-td>
            </template>

            <template #body-cell-priority="props">
              <q-td :props="props" class="text-center">
                <q-icon
                  name="star"
                  :color="props.row.isPriority ? 'negative' : 'grey-5'"
                  size="20px"
                  class="cursor-pointer"
                  @click="onTogglePriority(props.row)"
                  data-test="priority-toggle"
                  v-if="canManage"
                />
                <q-icon
                  v-else
                  name="star"
                  :color="props.row.isPriority ? 'negative' : 'grey-5'"
                  size="20px"
                />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <q-drawer
      v-model="detailsDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-ticket-details"
    >
      <q-scroll-area v-if="selectedTicket" class="fit">
        <div class="q-pa-md">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-h6 q-mb-xs">
                {{ selectedTicket.subject }}
              </div>
              <div class="text-caption text-grey-7">
                {{ selectedTicket.reporterName }} ({{ selectedTicket.reporterEmail }})
              </div>
            </div>
          </div>

          <q-separator spaced />

          <q-list dense class="q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('ticketsColumnTenant') }}</q-item-label>
                <q-item-label>
                  {{
                    selectedTicket.reporterRole === 'PLATFORM_ADMIN'
                      ? t('ticketsPlatformScope')
                      : selectedTicket.tenantName
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>{{ t('ticketsColumnCreatedAt') }}</q-item-label>
                <q-item-label>{{ selectedTicket.createdAt }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator spaced />

          <div v-if="canManage" class="q-gutter-md">
            <q-select
              v-model="detailsStatus"
              :options="statusOptions"
              emit-value
              map-options
              :label="t('ticketsColumnStatus')"
              outlined
              dense
              data-test="select-ticket-status"
            />
            <q-toggle
              v-model="detailsPriority"
              :label="t('ticketsColumnPriority')"
              color="negative"
              data-test="toggle-ticket-priority"
            />
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                color="primary"
                :label="t('profile.save')"
                unelevated
                @click="onSaveDetails"
                :loading="detailsSaving"
                data-test="button-save-ticket"
              />
              <q-btn
                flat
                :label="t('submitForm.cancel')"
                @click="detailsDrawerOpen = false"
              />
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { ticketsApi, type TicketListItem, type TicketStatus } from '@/api/tickets.api';

const { t } = useI18n();
const auth = useAuthStore();

const tickets = ref<TicketListItem[]>([]);
const loading = ref(false);
const statusFilter = ref<TicketStatus | 'ALL'>('ALL');
const priorityOnly = ref(false);

const detailsDrawerOpen = ref(false);
const selectedTicket = ref<TicketListItem | null>(null);
const detailsStatus = ref<TicketStatus>('NEW');
const detailsPriority = ref(false);
const detailsSaving = ref(false);

const canManage = computed(
  () => auth.user?.role === 'PLATFORM_ADMIN' || auth.user?.role === 'SCHOOL_ADMIN',
);

const statusLabelMap: Record<TicketStatus, string> = {
  NEW: t('statusNew'),
  IN_PROGRESS: t('statusInProgress'),
  RESOLVED: t('statusResolved'),
};

const statusColorMap: Record<TicketStatus, string> = {
  NEW: 'primary',
  IN_PROGRESS: 'warning',
  RESOLVED: 'positive',
};

const statusOptions = [
  { label: statusLabelMap.NEW, value: 'NEW' as TicketStatus },
  { label: statusLabelMap.IN_PROGRESS, value: 'IN_PROGRESS' as TicketStatus },
  { label: statusLabelMap.RESOLVED, value: 'RESOLVED' as TicketStatus },
];

const columns = [
  { name: 'subject', label: t('ticketsColumnTitle'), field: 'subject', align: 'left' },
  { name: 'reporter', label: t('ticketsColumnReporter'), field: 'reporterName', align: 'left' },
  { name: 'tenant', label: t('ticketsColumnTenant'), field: 'tenantName', align: 'left' },
  { name: 'createdAt', label: t('ticketsColumnCreatedAt'), field: 'createdAt', align: 'left' },
  { name: 'status', label: t('ticketsColumnStatus'), field: 'status', align: 'left' },
  { name: 'priority', label: t('ticketsColumnPriority'), field: 'isPriority', align: 'center' },
];

const filteredTickets = computed(() =>
  tickets.value.filter((t) => {
    const matchesStatus = statusFilter.value === 'ALL' || t.status === statusFilter.value;
    const matchesPriority = !priorityOnly.value || t.isPriority;
    return matchesStatus && matchesPriority;
  }),
);

function setStatusFilter(status: TicketStatus) {
  statusFilter.value = statusFilter.value === status ? 'ALL' : status;
}

function togglePriorityOnly() {
  priorityOnly.value = !priorityOnly.value;
}

async function loadTickets() {
  loading.value = true;
  try {
    const data = await ticketsApi.list();
    tickets.value = data;
  } finally {
    loading.value = false;
  }
}

async function onTogglePriority(row: TicketListItem) {
  if (!canManage.value) return;
  const updated = await ticketsApi.update(row.id, { isPriority: !row.isPriority });
  const idx = tickets.value.findIndex((t) => t.id === row.id);
  if (idx !== -1) {
    tickets.value[idx] = { ...tickets.value[idx], ...updated };
  }
  if (selectedTicket.value?.id === row.id) {
    selectedTicket.value = { ...selectedTicket.value, ...updated };
    detailsPriority.value = selectedTicket.value.isPriority;
  }
}

function onRowClick(_evt: unknown, row: TicketListItem) {
  selectedTicket.value = row;
  detailsStatus.value = row.status;
  detailsPriority.value = row.isPriority;
  detailsDrawerOpen.value = true;
}

async function onSaveDetails() {
  if (!selectedTicket.value || !canManage.value) return;
  detailsSaving.value = true;
  try {
    const updated = await ticketsApi.update(selectedTicket.value.id, {
      status: detailsStatus.value,
      isPriority: detailsPriority.value,
    });
    const idx = tickets.value.findIndex((t) => t.id === selectedTicket.value?.id);
    if (idx !== -1) {
      tickets.value[idx] = { ...tickets.value[idx], ...updated };
    }
    selectedTicket.value = { ...selectedTicket.value, ...updated };
    detailsDrawerOpen.value = false;
  } finally {
    detailsSaving.value = false;
  }
}

function isPlatformTicket(row: TicketListItem): boolean {
  // Prefer explicit reporterRole from backend
  if (row.reporterRole === 'PLATFORM_ADMIN') {
    return true;
  }

  // Fallback: if current user is Platform Admin and is the reporter of this ticket
  if (auth.user?.role === 'PLATFORM_ADMIN' && row.reporterEmail === auth.user.email) {
    return true;
  }

  return false;
}

onMounted(() => {
  void loadTickets();
});
</script>
