import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ticketsApi, type TicketListItem } from '@/api/tickets.api';

const STORAGE_KEY_LAST_SEEN = 'notifications_last_seen_ticket_at';

export const useNotificationsStore = defineStore('notifications', () => {
  const auth = useAuthStore();

  const unreadTickets = ref<TicketListItem[]>([]);
  const lastSeenCreatedAt = ref<string | null>(
    typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_LAST_SEEN) : null,
  );
  const polling = ref(false);

  const unreadCount = computed(() => unreadTickets.value.length);

  function isRelevantForCurrentUser(ticket: TicketListItem): boolean {
    const user = auth.user;
    if (!user) return false;

    // If ticket was created by Platform Admin:
    if (ticket.reporterRole === 'PLATFORM_ADMIN') {
      // Only Platform Admins see these as notifications
      return user.role === 'PLATFORM_ADMIN';
    }

    // Otherwise, Platform Admin sees all, School Admin sees only their tenant
    if (user.role === 'PLATFORM_ADMIN') {
      return true;
    }
    if (user.role === 'SCHOOL_ADMIN') {
      return ticket.tenantId === user.tenantId;
    }

    // Professors/Students: no global ticket notifications for now
    return false;
  }

  async function pollTickets() {
    if (!auth.isAuthenticated || polling.value) return;
    polling.value = true;
    try {
      const tickets = await ticketsApi.list({ status: 'NEW' });

      const newOnes = tickets.filter((t) => {
        if (!isRelevantForCurrentUser(t)) return false;
        if (!lastSeenCreatedAt.value) return true;
        return t.createdAt > lastSeenCreatedAt.value;
      });

      if (newOnes.length > 0) {
        unreadTickets.value.unshift(...newOnes);
        const maxCreated = newOnes.reduce(
          (max, t) => (t.createdAt > max ? t.createdAt : max),
          lastSeenCreatedAt.value ?? '',
        );
        lastSeenCreatedAt.value = maxCreated;
        if (typeof window !== 'undefined' && maxCreated) {
          window.localStorage.setItem(STORAGE_KEY_LAST_SEEN, maxCreated);
        }
      }
    } finally {
      polling.value = false;
    }
  }

  function markAllRead() {
    if (unreadTickets.value.length > 0) {
      const maxCreated = unreadTickets.value.reduce(
        (max, t) => (t.createdAt > max ? t.createdAt : max),
        lastSeenCreatedAt.value ?? '',
      );
      lastSeenCreatedAt.value = maxCreated;
      if (typeof window !== 'undefined' && maxCreated) {
        window.localStorage.setItem(STORAGE_KEY_LAST_SEEN, maxCreated);
      }
    }
    unreadTickets.value = [];
  }

  return {
    unreadTickets,
    unreadCount,
    lastSeenCreatedAt,
    pollTickets,
    markAllRead,
  };
});

