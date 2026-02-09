import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  examsApi,
  type ExamPeriod,
  type ExamTerm,
} from '@/api/exams.api';
import { useAuthStore } from '@/stores/auth';

export const useExamsStore = defineStore('exams', () => {
  const auth = useAuthStore();
  const periods = ref<ExamPeriod[]>([]);
  const terms = ref<ExamTerm[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPeriods() {
    if (!auth.tenantId) {
      periods.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await examsApi.listPeriods();
      periods.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load exam periods';
      periods.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchTerms() {
    if (!auth.tenantId) {
      terms.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await examsApi.listTerms();
      terms.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load exam terms';
      terms.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchAll() {
    if (!auth.tenantId) return;
    await Promise.all([fetchPeriods(), fetchTerms()]);
  }

  async function createPeriod(payload: {
    name: string;
    term: string;
    year: number;
  }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await examsApi.createPeriod(payload);
      periods.value = [data.data, ...periods.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create exam period';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearExams() {
    periods.value = [];
    terms.value = [];
    error.value = null;
  }

  return {
    periods,
    terms,
    loading,
    error,
    fetchPeriods,
    fetchTerms,
    fetchAll,
    createPeriod,
    clearExams,
  };
});
