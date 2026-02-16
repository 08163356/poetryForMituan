import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'poetry-family-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成JWT Token
const generateToken = (id: string, username: string, role: string): string => {
  return jwt.sign({ id, username, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// 用户登录
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: '请输入用户名和密码',
      });
      return;
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    if (user.status === 'pending') {
      res.status(403).json({
        success: false,
        message: '账号正在审核中，请等待管理员审批',
      });
      return;
    }

    if (user.status === 'rejected') {
      res.status(403).json({
        success: false,
        message: '账号申请已被拒绝',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.username, user.role);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 用户注册（申请访问）
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password || !nickname) {
      res.status(400).json({
        success: false,
        message: '请填写完整信息',
      });
      return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: '用户名已存在',
      });
      return;
    }

    const user = await User.create({
      username,
      password,
      nickname,
      role: 'guest',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: '注册申请已提交，请等待管理员审核',
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取当前用户信息
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 更新用户信息
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nickname, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { nickname, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 修改密码
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: '请输入当前密码和新密码',
      });
      return;
    }

    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: '当前密码错误',
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取所有用户（管理员）
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 审批用户（管理员）
export const approveUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: '无效的状态值',
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, ...(role && { role }) },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    res.json({
      success: true,
      message: status === 'active' ? '用户已通过审核' : '已拒绝用户申请',
      data: user,
    });
  } catch (error) {
    console.error('审批用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 删除用户（管理员）
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({
        success: false,
        message: '不能删除管理员账号',
      });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};
