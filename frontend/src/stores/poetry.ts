import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Poetry, Stats } from '../types';
import { poetryService } from '../services/poetry';

export const usePoetryStore = defineStore('poetry', () => {
  const poetries = ref<Poetry[]>([]);
  const currentPoetry = ref<Poetry | null>(null);
  const dynasties = ref<string[]>([]);
  const authors = ref<{ name: string; count: number }[]>([]);
  const stats = ref<Stats | null>(null);
  const loading = ref(false);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });

  async function fetchPoetries(params?: {
    page?: number;
    limit?: number;
    dynasty?: string;
    author?: string;
    search?: string;
  }) {
    loading.value = true;
    try {
      const response = await poetryService.getPoetries(params);
      if (response.success && response.data) {
        poetries.value = response.data.poetries || [];
        pagination.value = response.data.pagination;
      }
    } catch (error) {
      console.error('获取古诗列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPoetry(id: string) {
    loading.value = true;
    try {
      const response = await poetryService.getPoetry(id);
      if (response.success && response.data) {
        currentPoetry.value = response.data;
      }
    } catch (error) {
      console.error('获取古诗详情失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchDynasties() {
    try {
      const response = await poetryService.getDynasties();
      if (response.success && response.data) {
        dynasties.value = response.data;
      }
    } catch (error) {
      console.error('获取朝代列表失败:', error);
    }
  }

  async function fetchAuthors(dynasty?: string) {
    try {
      const response = await poetryService.getAuthors(dynasty);
      if (response.success && response.data) {
        authors.value = response.data;
      }
    } catch (error) {
      console.error('获取作者列表失败:', error);
    }
  }

  async function fetchAllAuthors() {
    try {
      const response = await poetryService.getAuthors();
      if (response.success && response.data) {
        authors.value = response.data;
      }
    } catch (error) {
      console.error('获取所有作者列表失败:', error);
    }
  }

  async function fetchStats() {
    try {
      const response = await poetryService.getStats();
      if (response.success && response.data) {
        stats.value = response.data;
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }

  async function createPoetry(formData: FormData) {
    loading.value = true;
    try {
      const response = await poetryService.createPoetry(formData);
      return { success: response.success, message: response.message, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, message: err.response?.data?.message || '创建失败' };
    } finally {
      loading.value = false;
    }
  }

  async function deletePoetry(id: string) {
    try {
      const response = await poetryService.deletePoetry(id);
      if (response.success) {
        poetries.value = poetries.value.filter((p) => p._id !== id);
      }
      return { success: response.success, message: response.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, message: err.response?.data?.message || '删除失败' };
    }
  }

  async function likePoetry(id: string) {
    try {
      const response = await poetryService.likePoetry(id);
      if (response.success && response.data) {
        const poetry = poetries.value.find((p) => p._id === id);
        if (poetry) {
          poetry.likeCount = response.data.likeCount;
        }
        if (currentPoetry.value?._id === id) {
          currentPoetry.value.likeCount = response.data.likeCount;
        }
      }
      return { success: response.success };
    } catch {
      return { success: false };
    }
  }

  return {
    poetries,
    currentPoetry,
    dynasties,
    authors,
    stats,
    loading,
    pagination,
    fetchPoetries,
    fetchPoetry,
    fetchDynasties,
    fetchAuthors,
    fetchAllAuthors,
    fetchStats,
    createPoetry,
    deletePoetry,
    likePoetry,
  };
});
