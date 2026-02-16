import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types';
import { authService } from '../services/auth';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const loading = ref(false);

  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isFamily = computed(() => user.value?.role === 'family' || user.value?.role === 'admin');

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const response = await authService.login({ username, password });
      if (response.success && response.data) {
        token.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, message: err.response?.data?.message || '登录失败' };
    } finally {
      loading.value = false;
    }
  }

  async function register(username: string, password: string, nickname: string) {
    loading.value = true;
    try {
      const response = await authService.register({ username, password, nickname });
      return { success: response.success, message: response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, message: err.response?.data?.message || '注册失败' };
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        user.value = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function updateProfile(data: { nickname?: string; avatar?: string }) {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        user.value = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, message: err.response?.data?.message || '更新失败' };
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    isAdmin,
    isFamily,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
  };
});
