import { defineStore } from 'pinia';
import { ref } from 'vue';
import { programsApi, type Program, type UpdateProgramRequest } from '@/api/programs.api';
import { useAuthStore } from '@/stores/auth';

export const useProgramsStore = defineStore('programs', () => {
  const auth = useAuthStore();
  const programs = ref<Program[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPrograms() {
    if (!auth.tenantId) {
      programs.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await programsApi.list();
      programs.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load programs';
      programs.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createProgram(payload: { name: string; code: string }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await programsApi.create(payload);
      programs.value = [data.data, ...programs.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create program';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProgram(id: string, payload: UpdateProgramRequest) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await programsApi.update(id, payload);
      const idx = programs.value.findIndex((p) => p.id === id);
      if (idx >= 0) programs.value[idx] = data.data;
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to update program';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProgram(id: string) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      await programsApi.delete(id);
      programs.value = programs.value.filter((p) => p.id !== id);
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to delete program';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearPrograms() {
    programs.value = [];
    error.value = null;
  }

  return {
    programs,
    loading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    clearPrograms,
  };
});
