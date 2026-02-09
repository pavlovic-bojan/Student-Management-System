import { defineStore } from 'pinia';
import { ref } from 'vue';
import { programsApi, type Program } from '@/api/programs.api';
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
    clearPrograms,
  };
});
