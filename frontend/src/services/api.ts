import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import router from '../router';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 使用 router 导航，支持子路径
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;

// 获取服务器基础URL（不包含 /api）
const getServerBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
  // 移除末尾的 /api
  return apiUrl.replace(/\/api\/?$/, '');
};

// 获取图片完整URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = getServerBaseUrl();
  // 确保路径以 / 开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
