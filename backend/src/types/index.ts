import { Request } from 'express';

export interface IUser {
  _id: string;
  username: string;
  password: string;
  nickname: string;
  role: 'admin' | 'family' | 'guest';
  status: 'active' | 'pending' | 'rejected';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPoetry {
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
  imageGenStatus: 'pending' | 'processing' | 'completed' | 'failed';
  verifiedContent?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
}
