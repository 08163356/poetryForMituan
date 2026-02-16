import api from './api';
import type { Poetry, CreatePoetryForm, ApiResponse, PaginatedResponse, Stats } from '../types';

export const poetryService = {
  // 获取古诗列表
  async getPoetries(params?: {
    page?: number;
    limit?: number;
    dynasty?: string;
    author?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<Poetry>> {
    const response = await api.get('/poetry', { params });
    return response.data;
  },

  // 获取单个古诗
  async getPoetry(id: string): Promise<ApiResponse<Poetry>> {
    const response = await api.get(`/poetry/${id}`);
    return response.data;
  },

  // 创建古诗
  async createPoetry(data: FormData): Promise<ApiResponse<Poetry>> {
    const response = await api.post('/poetry', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 更新古诗
  async updatePoetry(id: string, data: FormData): Promise<ApiResponse<Poetry>> {
    const response = await api.put(`/poetry/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 删除古诗
  async deletePoetry(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/poetry/${id}`);
    return response.data;
  },

  // 获取朝代列表
  async getDynasties(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/poetry/dynasties');
    return response.data;
  },

  // 获取作者列表
  async getAuthors(dynasty?: string): Promise<ApiResponse<{ name: string; count: number }[]>> {
    const response = await api.get('/poetry/authors', { params: { dynasty } });
    return response.data;
  },

  // 点赞古诗
  async likePoetry(id: string): Promise<ApiResponse<{ likeCount: number }>> {
    const response = await api.post(`/poetry/${id}/like`);
    return response.data;
  },

  // 获取统计数据
  async getStats(): Promise<ApiResponse<Stats>> {
    const response = await api.get('/poetry/stats');
    return response.data;
  },

  // 触发AI校验
  async triggerVerify(id: string): Promise<ApiResponse> {
    const response = await api.post(`/ai/verify/${id}`);
    return response.data;
  },

  // 触发AI生图
  async triggerGenerateImage(id: string): Promise<ApiResponse> {
    const response = await api.post(`/ai/generate-image/${id}`);
    return response.data;
  },

  // 获取AI处理状态
  async getAiStatus(id: string): Promise<ApiResponse> {
    const response = await api.get(`/ai/status/${id}`);
    return response.data;
  },
};
