import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tenantsApi, type Tenant, type UpdateTenantPayload } from '@/api/tenants.api';

export const useTenantsStore = defineStore('tenants', () => {
  const tenants = ref<Tenant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTenants() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tenantsApi.list();
      tenants.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load tenants';
      tenants.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createTenant(name: string, code: string) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tenantsApi.create({ name, code });
      tenants.value = [data.data, ...tenants.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to create tenant';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateTenant(id: string, payload: UpdateTenantPayload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tenantsApi.update(id, payload);
      const idx = tenants.value.findIndex((t) => t.id === id);
      if (idx >= 0) tenants.value[idx] = data.data;
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to update tenant';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
  };
});
