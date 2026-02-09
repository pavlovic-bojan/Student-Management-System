import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { studentsApi, type Student } from '@/api/students.api';
import { useAuthStore } from '@/stores/auth';

export const useStudentsStore = defineStore('students', () => {
  const students = ref<Student[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const auth = useAuthStore();

  const canFetch = computed(() => Boolean(auth.tenantId));

  async function fetchStudents() {
    if (!auth.tenantId) {
      students.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await studentsApi.list();
      students.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load students';
      students.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createStudent(payload: {
    indexNumber: string;
    firstName: string;
    lastName: string;
    programId?: string;
  }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await studentsApi.create(payload);
      students.value = [data.data, ...students.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create student';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearStudents() {
    students.value = [];
    error.value = null;
  }

  return {
    students,
    loading,
    error,
    canFetch,
    fetchStudents,
    createStudent,
    clearStudents,
  };
});
