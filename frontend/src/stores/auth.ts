import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const TENANT_KEY = 'x-tenant-id';
const TOKEN_KEY = 'token';

export const useAuthStore = defineStore('auth', () => {
  const tenantId = ref<string | null>(
    sessionStorage.getItem(TENANT_KEY),
  );
  const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY));

  const isAuthenticated = computed(
    () => Boolean(tenantId.value),
  );

  function setCredentials(newTenantId: string, newToken?: string) {
    tenantId.value = newTenantId;
    token.value = newToken ?? null;
    sessionStorage.setItem(TENANT_KEY, newTenantId);
    if (newToken) {
      sessionStorage.setItem(TOKEN_KEY, newToken);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }

  function clearCredentials() {
    tenantId.value = null;
    token.value = null;
    sessionStorage.removeItem(TENANT_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  return {
    tenantId,
    token,
    isAuthenticated,
    setCredentials,
    clearCredentials,
  };
});
