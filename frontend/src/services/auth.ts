import api from './api';
import type { User, LoginForm, RegisterForm, ApiResponse } from '../types';

export const authService = {
  // 登录
  async login(data: LoginForm): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // 注册
  async register(data: RegisterForm): Promise<ApiResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // 获取当前用户信息
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 更新用户信息
  async updateProfile(data: { nickname?: string; avatar?: string }): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // 修改密码
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await api.put('/auth/password', data);
    return response.data;
  },

  // 获取用户列表（管理员）
  async getUsers(params?: { status?: string; role?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // 审批用户（管理员）
  async approveUser(userId: string, data: { status: string; role?: string }): Promise<ApiResponse> {
    const response = await api.put(`/auth/users/${userId}/approve`, data);
    return response.data;
  },

  // 删除用户（管理员）
  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};
