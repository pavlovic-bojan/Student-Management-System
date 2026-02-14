import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProgramsStore } from '@/stores/programs';
import { useAuthStore } from '@/stores/auth';
import { programsApi } from '@/api/programs.api';

vi.mock('@/api/programs.api', () => ({
  programsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockProgram = {
  id: 'p1',
  name: 'Program A',
  code: 'PA',
  tenantId: 't1',
  version: 1,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('programs store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(programsApi.list).mockReset();
    vi.mocked(programsApi.create).mockReset();
    vi.mocked(programsApi.update).mockReset();
    vi.mocked(programsApi.delete).mockReset();
  });

  it('fetchPrograms populates programs on success', async () => {
    vi.mocked(programsApi.list).mockResolvedValue({ data: { data: [mockProgram] } });
    const store = useProgramsStore();
    await store.fetchPrograms();
    expect(store.programs).toHaveLength(1);
    expect(store.programs[0].name).toBe('Program A');
    expect(store.error).toBeNull();
  });

  it('fetchPrograms clears programs when no tenantId', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useProgramsStore();
    await store.fetchPrograms();
    expect(store.programs).toEqual([]);
    expect(programsApi.list).not.toHaveBeenCalled();
  });

  it('createProgram prepends and returns program', async () => {
    vi.mocked(programsApi.create).mockResolvedValue({ data: { data: mockProgram } });
    const store = useProgramsStore();
    const result = await store.createProgram({ name: 'Program A', code: 'PA' });
    expect(result).toEqual(mockProgram);
    expect(store.programs[0]).toEqual(mockProgram);
  });

  it('createProgram throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useProgramsStore();
    await expect(store.createProgram({ name: 'A', code: 'A' })).rejects.toThrow('No tenant selected');
  });

  it('updateProgram updates item in list', async () => {
    const store = useProgramsStore();
    store.programs = [{ ...mockProgram }, { ...mockProgram, id: 'p2', name: 'B' }];
    const updated = { ...mockProgram, name: 'Updated' };
    vi.mocked(programsApi.update).mockResolvedValue({ data: { data: updated } });
    const result = await store.updateProgram('p1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(store.programs[0].name).toBe('Updated');
  });

  it('deleteProgram removes item', async () => {
    const store = useProgramsStore();
    store.programs = [mockProgram];
    vi.mocked(programsApi.delete).mockResolvedValue(undefined);
    await store.deleteProgram('p1');
    expect(store.programs).toHaveLength(0);
  });

  it('clearPrograms resets programs and error', () => {
    const store = useProgramsStore();
    store.programs = [mockProgram];
    store.error = 'err';
    store.clearPrograms();
    expect(store.programs).toEqual([]);
    expect(store.error).toBeNull();
  });
});
