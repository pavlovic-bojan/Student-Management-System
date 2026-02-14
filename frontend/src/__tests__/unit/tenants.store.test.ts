import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTenantsStore } from '@/stores/tenants';
import { tenantsApi } from '@/api/tenants.api';

vi.mock('@/api/tenants.api', () => ({
  tenantsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('tenants store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(tenantsApi.list).mockReset();
    vi.mocked(tenantsApi.create).mockReset();
    vi.mocked(tenantsApi.update).mockReset();
  });

  it('fetchTenants sets tenants and clears error on success', async () => {
    const store = useTenantsStore();
    const list = [
      { id: 't1', name: 'Tenant A', code: 'TA', isActive: true, createdAt: '', updatedAt: '' },
    ];
    vi.mocked(tenantsApi.list).mockResolvedValue({ data: { data: list } });

    await store.fetchTenants();

    expect(store.tenants).toEqual(list);
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });

  it('fetchTenants sets error on failure', async () => {
    const store = useTenantsStore();
    vi.mocked(tenantsApi.list).mockRejectedValue(new Error('Network error'));

    await store.fetchTenants();

    expect(store.tenants).toEqual([]);
    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });

  it('createTenant prepends new tenant and returns it', async () => {
    const store = useTenantsStore();
    store.tenants = [
      { id: 't1', name: 'Old', code: 'O', isActive: true, createdAt: '', updatedAt: '' },
    ];
    const newTenant = {
      id: 't2',
      name: 'New Tenant',
      code: 'NT',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(tenantsApi.create).mockResolvedValue({ data: { data: newTenant } });

    const result = await store.createTenant('New Tenant', 'NT');

    expect(result).toEqual(newTenant);
    expect(store.tenants).toHaveLength(2);
    expect(store.tenants[0]).toEqual(newTenant);
  });

  it('updateTenant updates tenant in list and returns it', async () => {
    const store = useTenantsStore();
    store.tenants = [
      { id: 't1', name: 'Old', code: 'O', isActive: true, createdAt: '', updatedAt: '' },
    ];
    const updated = {
      id: 't1',
      name: 'Updated',
      code: 'U',
      isActive: false,
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(tenantsApi.update).mockResolvedValue({ data: { data: updated } });

    const result = await store.updateTenant('t1', { name: 'Updated', code: 'U', isActive: false });

    expect(result).toEqual(updated);
    expect(store.tenants).toHaveLength(1);
    expect(store.tenants[0]).toEqual(updated);
  });

  it('updateTenant sets error on failure', async () => {
    const store = useTenantsStore();
    store.tenants = [{ id: 't1', name: 'A', code: 'A', isActive: true, createdAt: '', updatedAt: '' }];
    vi.mocked(tenantsApi.update).mockRejectedValue(new Error('Conflict'));

    await expect(store.updateTenant('t1', { code: 'X' })).rejects.toThrow();
    expect(store.error).toBe('Conflict');
  });
});
