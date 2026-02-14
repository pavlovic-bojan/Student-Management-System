import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useExamsStore } from '@/stores/exams';
import { useAuthStore } from '@/stores/auth';
import { examsApi } from '@/api/exams.api';

vi.mock('@/api/exams.api', () => ({
  examsApi: {
    listPeriods: vi.fn(),
    listTerms: vi.fn(),
    createPeriod: vi.fn(),
  },
}));

const mockPeriod = {
  id: 'ep1',
  name: 'Jan 2025',
  term: 'WINTER',
  year: 2025,
  tenantId: 't1',
  createdAt: '',
  updatedAt: '',
};

const mockTerm = {
  id: 'et1',
  examPeriodId: 'ep1',
  courseOfferingId: 'co1',
  date: '2025-01-15',
  tenantId: 't1',
  createdAt: '',
  updatedAt: '',
};

describe('exams store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(examsApi.listPeriods).mockReset();
    vi.mocked(examsApi.listTerms).mockReset();
    vi.mocked(examsApi.createPeriod).mockReset();
  });

  it('fetchPeriods populates periods on success', async () => {
    vi.mocked(examsApi.listPeriods).mockResolvedValue({ data: { data: [mockPeriod] } });
    const store = useExamsStore();
    await store.fetchPeriods();
    expect(store.periods).toHaveLength(1);
    expect(store.periods[0].name).toBe('Jan 2025');
    expect(store.error).toBeNull();
  });

  it('fetchPeriods clears when no tenantId', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useExamsStore();
    await store.fetchPeriods();
    expect(store.periods).toEqual([]);
    expect(examsApi.listPeriods).not.toHaveBeenCalled();
  });

  it('fetchTerms populates terms on success', async () => {
    vi.mocked(examsApi.listTerms).mockResolvedValue({ data: { data: [mockTerm] } });
    const store = useExamsStore();
    await store.fetchTerms();
    expect(store.terms).toHaveLength(1);
    expect(store.terms[0].examPeriodId).toBe('ep1');
  });

  it('fetchAll calls fetchPeriods and fetchTerms', async () => {
    vi.mocked(examsApi.listPeriods).mockResolvedValue({ data: { data: [mockPeriod] } });
    vi.mocked(examsApi.listTerms).mockResolvedValue({ data: { data: [mockTerm] } });
    const store = useExamsStore();
    await store.fetchAll();
    expect(store.periods).toHaveLength(1);
    expect(store.terms).toHaveLength(1);
  });

  it('createPeriod prepends and returns period', async () => {
    vi.mocked(examsApi.createPeriod).mockResolvedValue({ data: { data: mockPeriod } });
    const store = useExamsStore();
    const result = await store.createPeriod({ name: 'Jan 2025', term: 'WINTER', year: 2025 });
    expect(result).toEqual(mockPeriod);
    expect(store.periods[0]).toEqual(mockPeriod);
  });

  it('createPeriod throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useExamsStore();
    await expect(store.createPeriod({ name: 'X', term: 'W', year: 2025 })).rejects.toThrow('No tenant selected');
  });

  it('clearExams resets periods, terms and error', () => {
    const store = useExamsStore();
    store.periods = [mockPeriod];
    store.terms = [mockTerm];
    store.error = 'err';
    store.clearExams();
    expect(store.periods).toEqual([]);
    expect(store.terms).toEqual([]);
    expect(store.error).toBeNull();
  });
});
