import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import { aiService } from '../services/aiService';
import { Poetry } from '../models/Poetry';

const router = Router();

// 手动触发古诗校验
router.post('/verify/:poetryId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { poetryId } = req.params;

    const poetry = await Poetry.findById(poetryId);
    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    // 异步执行校验
    aiService.retryVerify(poetryId).catch(console.error);

    res.json({
      success: true,
      message: '已开始重新校验',
    });
  } catch (error) {
    console.error('触发校验错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
});

// 手动触发AI配图生成
router.post('/generate-image/:poetryId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { poetryId } = req.params;

    const poetry = await Poetry.findById(poetryId);
    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    // 异步执行图片生成
    aiService.retryGenerateImage(poetryId).catch(console.error);

    res.json({
      success: true,
      message: '已开始生成配图',
    });
  } catch (error) {
    console.error('触发图片生成错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
});

// 获取AI处理状态
router.get('/status/:poetryId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { poetryId } = req.params;

    const poetry = await Poetry.findById(poetryId).select('verifyStatus imageGenStatus verifiedContent aiGeneratedImage');

    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        verifyStatus: poetry.verifyStatus,
        imageGenStatus: poetry.imageGenStatus,
        hasVerifiedContent: !!poetry.verifiedContent,
        hasAiImage: !!poetry.aiGeneratedImage,
      },
    });
  } catch (error) {
    console.error('获取AI状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
});

export default router;
