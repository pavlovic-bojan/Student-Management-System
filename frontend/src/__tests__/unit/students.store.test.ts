import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStudentsStore } from '@/stores/students';
import { useAuthStore } from '@/stores/auth';
import { studentsApi } from '@/api/students.api';

vi.mock('@/api/students.api', () => ({
  studentsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteEnrollment: vi.fn(),
  },
}));

const mockListItem = {
  enrollmentId: 'e1',
  studentId: 's1',
  tenantId: 't1',
  indexNumber: '2024-001',
  firstName: 'John',
  lastName: 'Doe',
  status: 'ACTIVE',
  tenantName: 'School A',
  programId: null as string | null,
};

describe('students store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(studentsApi.list).mockReset();
    vi.mocked(studentsApi.create).mockReset();
    vi.mocked(studentsApi.update).mockReset();
    vi.mocked(studentsApi.deleteEnrollment).mockReset();
  });

  it('canFetch is true when user has tenantId', () => {
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';

    const store = useStudentsStore();
    expect(store.canFetch).toBe(true);
  });

  it('canFetch is true when user is PLATFORM_ADMIN', () => {
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PLATFORM_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';

    const store = useStudentsStore();
    expect(store.canFetch).toBe(true);
  });

  it('fetchStudents populates students on success (School Admin)', async () => {
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';

    vi.mocked(studentsApi.list).mockResolvedValue({ data: { data: [mockListItem] } });

    const store = useStudentsStore();
    await store.fetchStudents();

    expect(store.students).toHaveLength(1);
    expect(store.students[0].indexNumber).toBe('2024-001');
    expect(store.error).toBeNull();
  });

  it('fetchStudents clears students when Platform Admin and no tenantId', async () => {
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'PLATFORM_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';

    const store = useStudentsStore();
    store.students = [mockListItem];
    await store.fetchStudents(undefined as any);

    expect(store.students).toEqual([]);
    expect(studentsApi.list).not.toHaveBeenCalled();
  });

  it('createStudent throws when no tenant (non-PA)', async () => {
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: '', tenantIds: [] };
    auth.token = 'token';

    const store = useStudentsStore();
    await expect(
      store.createStudent({ indexNumber: '001', firstName: 'A', lastName: 'B' }),
    ).rejects.toThrow('No tenant selected');
  });

  it('clearStudents resets students and error', () => {
    const store = useStudentsStore();
    store.students = [mockListItem];
    store.error = 'Some error';

    store.clearStudents();

    expect(store.students).toEqual([]);
    expect(store.error).toBeNull();
  });
});
