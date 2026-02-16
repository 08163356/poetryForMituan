// 用户相关类型
export interface User {
  id: string;
  username: string;
  nickname: string;
  role: 'admin' | 'family' | 'guest';
  avatar?: string;
  createdAt?: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  nickname: string;
}

// 古诗相关类型
export interface Poetry {
  _id: string;
  title: string;
  content: string;
  author: string;
  dynasty: string;
  originalContent?: string;
  images: string[];
  originalImages: string[];
  aiGeneratedImage?: string;
  tags: string[];
  verifyStatus: 'pending' | 'processing' | 'completed' | 'failed';
  imageGenStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  verifiedContent?: string;
  createdBy: {
    _id: string;
    nickname: string;
    avatar?: string;
  };
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoetryForm {
  title: string;
  content: string;
  author: string;
  dynasty: string;
  tags: string;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    poetries?: T[];
    users?: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

// 统计数据类型
export interface Stats {
  totalPoetries: number;
  totalDynasties: number;
  totalAuthors: number;
  recentPoetries: Poetry[];
  popularPoetries: Poetry[];
}
