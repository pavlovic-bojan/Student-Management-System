import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { studentsApi, type StudentListItem, type UpdateStudentRequest } from '@/api/students.api';
import { useAuthStore } from '@/stores/auth';

export const useStudentsStore = defineStore('students', () => {
  const students = ref<StudentListItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const auth = useAuthStore();

  const canFetch = computed(() =>
    Boolean(auth.tenantId) || auth.user?.role === 'PLATFORM_ADMIN',
  );

  async function fetchStudents(tenantId?: string) {
    const effectiveTenantId = auth.user?.role === 'PLATFORM_ADMIN' ? tenantId : auth.tenantId;
    if (!effectiveTenantId && auth.user?.role === 'PLATFORM_ADMIN') {
      students.value = [];
      return;
    }
    if (!effectiveTenantId) {
      students.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const params = auth.user?.role === 'PLATFORM_ADMIN' ? effectiveTenantId : undefined;
      const { data } = await studentsApi.list(params);
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
    tenantId?: string;
  }) {
    const effectiveTenantId =
      auth.user?.role === 'PLATFORM_ADMIN' ? payload.tenantId : auth.tenantId;
    if (!effectiveTenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await studentsApi.create({
        ...payload,
        tenantId: auth.user?.role === 'PLATFORM_ADMIN' ? payload.tenantId : undefined,
      });
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

  async function updateStudent(studentId: string, payload: UpdateStudentRequest) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await studentsApi.update(studentId, payload);
      students.value = students.value.map((s) =>
        s.studentId === studentId
          ? { ...s, firstName: data.data.firstName, lastName: data.data.lastName, status: data.data.status }
          : s,
      );
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to update student';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteEnrollment(enrollmentId: string) {
    loading.value = true;
    error.value = null;
    try {
      await studentsApi.deleteEnrollment(enrollmentId);
      students.value = students.value.filter((s) => s.enrollmentId !== enrollmentId);
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to remove enrollment';
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
    updateStudent,
    deleteEnrollment,
    clearStudents,
  };
});
