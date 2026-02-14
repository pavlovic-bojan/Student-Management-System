import { defineStore } from 'pinia';
import { ref } from 'vue';
import { coursesApi, type Course, type UpdateCourseRequest } from '@/api/courses.api';
import { useAuthStore } from '@/stores/auth';

export const useCoursesStore = defineStore('courses', () => {
  const auth = useAuthStore();
  const courses = ref<Course[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCourses() {
    if (!auth.tenantId) {
      courses.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await coursesApi.list();
      courses.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load courses';
      courses.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createCourse(payload: {
    name: string;
    code: string;
    programId?: string;
  }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await coursesApi.create(payload);
      courses.value = [data.data, ...courses.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create course';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateCourse(id: string, payload: UpdateCourseRequest) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await coursesApi.update(id, payload);
      const idx = courses.value.findIndex((c) => c.id === id);
      if (idx >= 0) courses.value[idx] = data.data;
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to update course';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCourse(id: string) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      await coursesApi.delete(id);
      courses.value = courses.value.filter((c) => c.id !== id);
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to delete course';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearCourses() {
    courses.value = [];
    error.value = null;
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    clearCourses,
  };
});
