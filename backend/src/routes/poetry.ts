import { Router } from 'express';
import {
  createPoetry,
  getPoetries,
  getPoetry,
  updatePoetry,
  deletePoetry,
  getDynasties,
  getAuthors,
  likePoetry,
  getStats,
} from '../controllers/poetry';
import { protect, optionalAuth } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = Router();

// 公开路由
router.get('/', getPoetries);
router.get('/stats', getStats);
router.get('/dynasties', getDynasties);
router.get('/authors', getAuthors);
router.get('/:id', getPoetry);

// 需要认证的路由
router.post('/', protect, uploadMultiple, createPoetry);
router.put('/:id', protect, uploadMultiple, updatePoetry);
router.delete('/:id', protect, deletePoetry);
router.post('/:id/like', protect, likePoetry);

export default router;
