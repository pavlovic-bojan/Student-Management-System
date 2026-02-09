import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type AuthUser } from '@/api/auth.api';

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(getStoredUser());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const tenantId = computed(() => user.value?.tenantId ?? null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  function initAuth() {
    user.value = getStoredUser();
    token.value = localStorage.getItem('jwt_token');
  }

  function setCredentials(u: AuthUser, t: string) {
    user.value = u;
    token.value = t;
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('jwt_token', t);
  }

  function clearCredentials() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
  }

  async function fetchCurrentUser() {
    if (!token.value) return null;
    loading.value = true;
    error.value = null;
    try {
      const u = await authApi.getCurrentUser();
      user.value = u;
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error ? e.message : 'Failed to load user';
      error.value = msg ?? 'Failed to load user';
      clearCredentials();
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: AuthUser['role'];
    tenantId: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.register(data);
      setCredentials(res.user, res.token);
      return res;
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error ? e.message : 'Registration failed';
      error.value = msg ?? 'Registration failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.login({ email, password });
      setCredentials(res.user, res.token);
      return res;
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error ? e.message : 'Login failed';
      error.value = msg ?? 'Login failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.forgotPassword({ email });
      return res;
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error ? e.message : 'Request failed';
      error.value = msg ?? 'Request failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearCredentials();
      loading.value = false;
    }
  }

  return {
    user,
    token,
    tenantId,
    loading,
    error,
    isAuthenticated,
    initAuth,
    setCredentials,
    clearCredentials,
    fetchCurrentUser,
    register,
    login,
    forgotPassword,
    logout,
  };
});
