import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationsStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { ticketsApi } from '@/api/tickets.api';
import { notificationsApi } from '@/api/notifications.api';

vi.mock('@/api/tickets.api', () => ({
  ticketsApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/api/notifications.api', () => ({
  notificationsApi: {
    list: vi.fn(),
    markRead: vi.fn(),
  },
}));

const mockTicket = {
  id: 'tk1',
  subject: 'Bug',
  status: 'NEW' as const,
  isPriority: false,
  createdAt: '2025-01-01T00:00:00Z',
  tenantId: 't1',
  tenantName: 'Tenant A',
  reporterName: 'User',
  reporterEmail: 'u@b.com',
  reporterRole: 'SCHOOL_ADMIN' as const,
};

const mockNotification = {
  id: 'n1',
  type: 'USER_ACTION' as const,
  action: 'CREATED' as const,
  targetEmail: null,
  actorRole: null,
  actorName: null,
  tenantName: null,
  changedFields: [],
  createdAt: '2025-01-01T00:00:00Z',
  read: false,
};

describe('notifications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(ticketsApi.list).mockReset();
    vi.mocked(notificationsApi.list).mockReset();
    vi.mocked(notificationsApi.markRead).mockReset();
  });

  it('unreadCount is sum of unreadTickets and userNotifications length', () => {
    const store = useNotificationsStore();
    expect(store.unreadCount).toBe(0);
    store.unreadTickets = [mockTicket];
    expect(store.unreadCount).toBe(1);
    store.userNotifications = [mockNotification];
    expect(store.unreadCount).toBe(2);
  });

  it('pollTickets does nothing when not authenticated', async () => {
    const auth = useAuthStore();
    auth.user = null;
    auth.token = null;
    const store = useNotificationsStore();
    await store.pollTickets();
    expect(ticketsApi.list).not.toHaveBeenCalled();
  });

  it('pollTickets populates unreadTickets for relevant tickets', async () => {
    vi.mocked(ticketsApi.list).mockResolvedValue([mockTicket]);
    const store = useNotificationsStore();
    await store.pollTickets();
    expect(store.unreadTickets).toHaveLength(1);
    expect(store.unreadTickets[0].id).toBe('tk1');
  });

  it('pollUserNotifications populates userNotifications', async () => {
    vi.mocked(notificationsApi.list).mockResolvedValue({ notifications: [mockNotification] });
    const store = useNotificationsStore();
    await store.pollUserNotifications();
    expect(store.userNotifications).toHaveLength(1);
    expect(store.userNotifications[0].id).toBe('n1');
  });

  it('markAllRead clears unreadTickets and userNotifications and calls markRead', async () => {
    vi.mocked(notificationsApi.markRead).mockResolvedValue(undefined);
    const store = useNotificationsStore();
    store.unreadTickets = [mockTicket];
    store.userNotifications = [mockNotification];
    store.markAllRead();
    expect(store.unreadTickets).toHaveLength(0);
    expect(store.userNotifications).toHaveLength(0);
    expect(notificationsApi.markRead).toHaveBeenCalledWith(['n1']);
  });
});
