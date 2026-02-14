import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRecordsStore } from '@/stores/records';
import { useAuthStore } from '@/stores/auth';
import { recordsApi } from '@/api/records.api';

vi.mock('@/api/records.api', () => ({
  recordsApi: {
    listTranscripts: vi.fn(),
    generateTranscript: vi.fn(),
  },
}));

const mockTranscript = {
  id: 'tr1',
  studentId: 's1',
  tenantId: 't1',
  createdAt: '',
  updatedAt: '',
  entries: [],
};

describe('records store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(recordsApi.listTranscripts).mockReset();
    vi.mocked(recordsApi.generateTranscript).mockReset();
  });

  it('fetchTranscripts populates transcripts on success', async () => {
    vi.mocked(recordsApi.listTranscripts).mockResolvedValue({ data: { data: [mockTranscript] } });
    const store = useRecordsStore();
    await store.fetchTranscripts();
    expect(store.transcripts).toHaveLength(1);
    expect(store.transcripts[0].studentId).toBe('s1');
    expect(store.error).toBeNull();
  });

  it('fetchTranscripts clears when no tenantId', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useRecordsStore();
    await store.fetchTranscripts();
    expect(store.transcripts).toEqual([]);
    expect(recordsApi.listTranscripts).not.toHaveBeenCalled();
  });

  it('generateTranscript prepends and returns transcript', async () => {
    vi.mocked(recordsApi.generateTranscript).mockResolvedValue({ data: { data: mockTranscript } });
    const store = useRecordsStore();
    const result = await store.generateTranscript('s1');
    expect(result).toEqual(mockTranscript);
    expect(store.transcripts[0]).toEqual(mockTranscript);
  });

  it('generateTranscript throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useRecordsStore();
    await expect(store.generateTranscript('s1')).rejects.toThrow('No tenant selected');
  });

  it('clearRecords resets transcripts and error', () => {
    const store = useRecordsStore();
    store.transcripts = [mockTranscript];
    store.error = 'err';
    store.clearRecords();
    expect(store.transcripts).toEqual([]);
    expect(store.error).toBeNull();
  });
});
