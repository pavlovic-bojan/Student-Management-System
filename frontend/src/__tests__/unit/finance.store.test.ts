import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFinanceStore } from '@/stores/finance';
import { useAuthStore } from '@/stores/auth';
import { financeApi } from '@/api/finance.api';

vi.mock('@/api/finance.api', () => ({
  financeApi: {
    listTuitions: vi.fn(),
    listPayments: vi.fn(),
    createTuition: vi.fn(),
    createPayment: vi.fn(),
  },
}));

const mockTuition = {
  id: 'tu1',
  name: 'Tuition 2025',
  amount: 500,
  tenantId: 't1',
  createdAt: '',
  updatedAt: '',
};

const mockPayment = {
  id: 'pay1',
  studentId: 's1',
  tuitionId: 'tu1',
  amount: 500,
  paidAt: '2025-01-01',
  tenantId: 't1',
  createdAt: '',
  updatedAt: '',
};

describe('finance store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(financeApi.listTuitions).mockReset();
    vi.mocked(financeApi.listPayments).mockReset();
    vi.mocked(financeApi.createTuition).mockReset();
    vi.mocked(financeApi.createPayment).mockReset();
  });

  it('fetchTuitions populates tuitions on success', async () => {
    vi.mocked(financeApi.listTuitions).mockResolvedValue({ data: { data: [mockTuition] } });
    const store = useFinanceStore();
    await store.fetchTuitions();
    expect(store.tuitions).toHaveLength(1);
    expect(store.tuitions[0].name).toBe('Tuition 2025');
    expect(store.error).toBeNull();
  });

  it('fetchPayments populates payments on success', async () => {
    vi.mocked(financeApi.listPayments).mockResolvedValue({ data: { data: [mockPayment] } });
    const store = useFinanceStore();
    await store.fetchPayments();
    expect(store.payments).toHaveLength(1);
    expect(store.payments[0].studentId).toBe('s1');
  });

  it('fetchAll calls fetchTuitions and fetchPayments', async () => {
    vi.mocked(financeApi.listTuitions).mockResolvedValue({ data: { data: [mockTuition] } });
    vi.mocked(financeApi.listPayments).mockResolvedValue({ data: { data: [mockPayment] } });
    const store = useFinanceStore();
    await store.fetchAll();
    expect(store.tuitions).toHaveLength(1);
    expect(store.payments).toHaveLength(1);
  });

  it('createTuition prepends and returns tuition', async () => {
    vi.mocked(financeApi.createTuition).mockResolvedValue({ data: { data: mockTuition } });
    const store = useFinanceStore();
    const result = await store.createTuition({ name: 'Tuition 2025', amount: 500 });
    expect(result).toEqual(mockTuition);
    expect(store.tuitions[0]).toEqual(mockTuition);
  });

  it('createTuition throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useFinanceStore();
    await expect(store.createTuition({ name: 'T', amount: 1 })).rejects.toThrow('No tenant selected');
  });

  it('createPayment prepends and returns payment', async () => {
    vi.mocked(financeApi.createPayment).mockResolvedValue({ data: { data: mockPayment } });
    const store = useFinanceStore();
    const result = await store.createPayment({
      studentId: 's1',
      tuitionId: 'tu1',
      amount: 500,
      paidAt: '2025-01-01',
    });
    expect(result).toEqual(mockPayment);
    expect(store.payments[0]).toEqual(mockPayment);
  });

  it('createPayment throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useFinanceStore();
    await expect(
      store.createPayment({ studentId: 's1', tuitionId: 'tu1', amount: 1, paidAt: '2025-01-01' }),
    ).rejects.toThrow('No tenant selected');
  });

  it('clearFinance resets tuitions, payments and error', () => {
    const store = useFinanceStore();
    store.tuitions = [mockTuition];
    store.payments = [mockPayment];
    store.error = 'err';
    store.clearFinance();
    expect(store.tuitions).toEqual([]);
    expect(store.payments).toEqual([]);
    expect(store.error).toBeNull();
  });
});
