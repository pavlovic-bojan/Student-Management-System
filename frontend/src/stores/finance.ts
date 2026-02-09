import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  financeApi,
  type Tuition,
  type Payment,
} from '@/api/finance.api';
import { useAuthStore } from '@/stores/auth';

export const useFinanceStore = defineStore('finance', () => {
  const auth = useAuthStore();
  const tuitions = ref<Tuition[]>([]);
  const payments = ref<Payment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTuitions() {
    if (!auth.tenantId) {
      tuitions.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await financeApi.listTuitions();
      tuitions.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load tuitions';
      tuitions.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchPayments() {
    if (!auth.tenantId) {
      payments.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await financeApi.listPayments();
      payments.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load payments';
      payments.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchAll() {
    if (!auth.tenantId) return;
    await Promise.all([fetchTuitions(), fetchPayments()]);
  }

  async function createTuition(payload: { name: string; amount: number }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await financeApi.createTuition(payload);
      tuitions.value = [data.data, ...tuitions.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create tuition';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createPayment(payload: {
    studentId: string;
    tuitionId: string;
    amount: number;
    paidAt: string;
  }) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await financeApi.createPayment(payload);
      payments.value = [data.data, ...payments.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create payment';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearFinance() {
    tuitions.value = [];
    payments.value = [];
    error.value = null;
  }

  return {
    tuitions,
    payments,
    loading,
    error,
    fetchTuitions,
    fetchPayments,
    fetchAll,
    createTuition,
    createPayment,
    clearFinance,
  };
});
