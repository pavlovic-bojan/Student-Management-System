import { defineStore } from 'pinia';
import { ref } from 'vue';
import { coursesApi, type Course } from '@/api/courses.api';
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
    clearCourses,
  };
});
