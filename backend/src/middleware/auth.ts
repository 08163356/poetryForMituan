import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'poetry-family-secret-key-2024';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: '请先登录',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        message: '账号未激活，请等待管理员审核',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '登录已过期，请重新登录',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '没有权限执行此操作',
      });
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.id);
      if (user && user.status === 'active') {
        req.user = {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        };
      }
    }

    next();
  } catch {
    next();
  }
};
