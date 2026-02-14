<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6">{{ t('notifications.title') }}</div>
        <div class="text-caption text-grey-7">
          {{ t('notifications.subtitle') }}
        </div>
      </div>
    </div>

    <q-card flat bordered>
      <!-- Ticket notifications (bug reports) -->
      <q-list v-if="notifications.unreadTickets.length > 0" separator>
        <q-item
          v-for="ticket in notifications.unreadTickets"
          :key="ticket.id"
          clickable
          v-ripple
          @click="goToTicket(ticket)"
        >
          <q-item-section avatar>
            <q-icon name="bug_report" color="negative" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ ticket.subject }}
            </q-item-label>
            <q-item-label caption>
              {{ ticket.reporterName }} ·
              <span v-if="isPlatformTicket(ticket)">
                {{ t('ticketsPlatformScope') }}
              </span>
              <span v-else>
                {{ ticket.tenantName }}
              </span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-badge
              :color="statusColorMap[ticket.status]"
              :label="statusLabelMap[ticket.status]"
              class="q-mb-xs"
              rounded
            />
            <div class="text-caption text-grey-6">
              {{ ticket.createdAt }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- User action notifications -->
      <q-separator />
      <q-list
        v-if="notifications.userNotifications.length > 0"
        separator
        class="q-mt-sm"
      >
        <q-item
          v-for="n in notifications.userNotifications"
          :key="n.id"
        >
          <q-item-section avatar>
            <q-icon name="manage_accounts" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ userNotificationTitle(n) }}
            </q-item-label>
            <q-item-label caption>
              {{ userNotificationSubtitle(n) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <div class="text-caption text-grey-6">
              {{ n.createdAt }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <div
        v-if="
          notifications.unreadTickets.length === 0 &&
          notifications.userNotifications.length === 0
        "
        class="q-pa-md text-grey-7"
      >
        {{ t('notifications.empty') }}
      </div>

      <q-separator />

      <div class="q-pa-sm row justify-end q-gutter-sm">
        <q-btn
          flat
          dense
          :label="t('notifications.goToTickets')"
          color="primary"
          @click="goToTickets"
        />
        <q-btn
          flat
          dense
          v-if="notifications.unreadTickets.length > 0"
          :label="t('notifications.markAll')"
          @click="onMarkAllRead"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import type { TicketListItem, TicketStatus } from '@/api/tickets.api';
import type { UserActionNotification } from '@/api/notifications.api';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const notifications = useNotificationsStore();

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

function isPlatformTicket(row: TicketListItem): boolean {
  return row.reporterRole === 'PLATFORM_ADMIN';
}

function userNotificationTitle(n: UserActionNotification): string {
  if (n.actorRole === 'PLATFORM_ADMIN') {
    if (n.action === 'CREATED') {
      return t('notifications.userAction.platformCreated', {
        email: n.targetEmail ?? '',
      });
    }
    if (n.action === 'UPDATED') {
      return t('notifications.userAction.platformUpdated', {
        email: n.targetEmail ?? '',
      });
    }
    if (n.action === 'DELETED') {
      return t('notifications.userAction.platformDeleted', {
        email: n.targetEmail ?? '',
      });
    }
  }
  if (n.actorRole === 'SCHOOL_ADMIN' && n.action === 'UPDATED') {
    return t('notifications.userAction.schoolUpdatedYou');
  }
  return '';
}

function userNotificationSubtitle(n: UserActionNotification): string {
  if (n.actorRole === 'PLATFORM_ADMIN') {
    return n.tenantName ?? '';
  }
  if (n.actorRole === 'SCHOOL_ADMIN') {
    const fields = (n.changedFields ?? []).map((f) => {
      if (f === 'firstName') return t('createUser.firstName');
      if (f === 'lastName') return t('createUser.lastName');
      if (f === 'role') return t('createUser.role');
      if (f === 'suspended') return t('users.suspended');
      return f;
    });
    return fields.length ? fields.join(', ') : '';
  }
  return '';
}

function onMarkAllRead() {
  notifications.markAllRead();
}

function goToTickets() {
  router.push({ name: 'tickets' });
}

function goToTicket(_ticket: TicketListItem) {
  // For now, just go to tickets page; future: deep-link/highlight specific ticket
  notifications.markAllRead();
  router.push({ name: 'tickets' });
}

onMounted(() => {
  const role = auth.user?.role;
  if (role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN') {
    void notifications.pollTickets();
  }
  void notifications.pollUserNotifications();
});
</script>

