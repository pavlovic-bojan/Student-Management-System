import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useAuthStore } from '@/stores/auth';
import { coursesApi } from '@/api/courses.api';

vi.mock('@/api/courses.api', () => ({
  coursesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCourse = {
  id: 'c1',
  name: 'Course A',
  code: 'CA',
  tenantId: 't1',
  programId: null as string | null,
  professorId: null as string | null,
  createdAt: '',
  updatedAt: '',
};

describe('courses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'SCHOOL_ADMIN', tenantId: 't1', tenantIds: ['t1'] };
    auth.token = 'token';
    vi.mocked(coursesApi.list).mockReset();
    vi.mocked(coursesApi.create).mockReset();
    vi.mocked(coursesApi.update).mockReset();
    vi.mocked(coursesApi.delete).mockReset();
  });

  it('fetchCourses populates courses on success', async () => {
    vi.mocked(coursesApi.list).mockResolvedValue({ data: { data: [mockCourse] } });
    const store = useCoursesStore();
    await store.fetchCourses();
    expect(store.courses).toHaveLength(1);
    expect(store.courses[0].name).toBe('Course A');
    expect(store.error).toBeNull();
  });

  it('fetchCourses clears courses when no tenantId', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useCoursesStore();
    await store.fetchCourses();
    expect(store.courses).toEqual([]);
    expect(coursesApi.list).not.toHaveBeenCalled();
  });

  it('createCourse prepends and returns course', async () => {
    vi.mocked(coursesApi.create).mockResolvedValue({ data: { data: mockCourse } });
    const store = useCoursesStore();
    const result = await store.createCourse({ name: 'Course A', code: 'CA' });
    expect(result).toEqual(mockCourse);
    expect(store.courses[0]).toEqual(mockCourse);
  });

  it('createCourse throws when no tenant', async () => {
    const auth = useAuthStore();
    auth.user = null;
    const store = useCoursesStore();
    await expect(store.createCourse({ name: 'A', code: 'A' })).rejects.toThrow('No tenant selected');
  });

  it('updateCourse updates item in list', async () => {
    const store = useCoursesStore();
    store.courses = [{ ...mockCourse }, { ...mockCourse, id: 'c2', name: 'B' }];
    const updated = { ...mockCourse, name: 'Updated' };
    vi.mocked(coursesApi.update).mockResolvedValue({ data: { data: updated } });
    const result = await store.updateCourse('c1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(store.courses[0].name).toBe('Updated');
  });

  it('deleteCourse removes item', async () => {
    const store = useCoursesStore();
    store.courses = [mockCourse];
    vi.mocked(coursesApi.delete).mockResolvedValue(undefined);
    await store.deleteCourse('c1');
    expect(store.courses).toHaveLength(0);
  });

  it('clearCourses resets courses and error', () => {
    const store = useCoursesStore();
    store.courses = [mockCourse];
    store.error = 'err';
    store.clearCourses();
    expect(store.courses).toEqual([]);
    expect(store.error).toBeNull();
  });
});
