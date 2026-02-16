import { Router } from 'express';
import {
  login,
  register,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  approveUser,
  deleteUser,
} from '../controllers/auth';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/login', login);
router.post('/register', register);

// 需要认证的路由
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// 管理员路由
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:userId/approve', protect, authorize('admin'), approveUser);
router.delete('/users/:userId', protect, authorize('admin'), deleteUser);

export default router;
