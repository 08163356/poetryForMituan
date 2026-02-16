import { Request, Response } from 'express';
import { Poetry } from '../models/Poetry';
import { AuthRequest } from '../types';
import { aiService } from '../services/aiService';
import path from 'path';

// 创建古诗
export const createPoetry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, author, dynasty, tags } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!title || !content || !author || !dynasty) {
      res.status(400).json({
        success: false,
        message: '请填写完整信息（标题、内容、作者、朝代）',
      });
      return;
    }

    // 处理上传的图片
    const images: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const relativePath = file.path.replace(/\\/g, '/');
        images.push(relativePath);
      }
    }

    const poetry = await Poetry.create({
      title,
      content,
      originalContent: content,
      author,
      dynasty,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
      images,
      originalImages: [...images],
      createdBy: req.user?.id,
      verifyStatus: 'pending',
      imageGenStatus: images.length > 0 ? 'skipped' : 'pending',
    });

    // 异步执行AI校验
    aiService.verifyPoetry(poetry._id.toString()).catch(console.error);

    // 如果没有上传图片，异步生成AI配图
    if (images.length === 0) {
      aiService.generateImage(poetry._id.toString()).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: '古诗创建成功',
      data: poetry,
    });
  } catch (error) {
    console.error('创建古诗错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取古诗列表
export const getPoetries = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      dynasty,
      author,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query: Record<string, unknown> = {};

    if (dynasty) {
      query.dynasty = dynasty;
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const total = await Poetry.countDocuments(query);
    const poetries = await Poetry.find(query)
      .populate('createdBy', 'nickname avatar')
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        poetries,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('获取古诗列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取单个古诗详情
export const getPoetry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const poetry = await Poetry.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('createdBy', 'nickname avatar');

    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: poetry,
    });
  } catch (error) {
    console.error('获取古诗详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 更新古诗
export const updatePoetry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, author, dynasty, tags } = req.body;
    const files = req.files as Express.Multer.File[];

    const poetry = await Poetry.findById(id);

    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    // 检查权限
    if (req.user?.role !== 'admin' && poetry.createdBy.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: '没有权限修改此古诗',
      });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content) {
      updateData.content = content;
      updateData.originalContent = content;
      updateData.verifyStatus = 'pending';
    }
    if (author) updateData.author = author;
    if (dynasty) updateData.dynasty = dynasty;
    if (tags) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    }

    // 处理新上传的图片
    if (files && files.length > 0) {
      const newImages: string[] = [];
      for (const file of files) {
        const relativePath = file.path.replace(/\\/g, '/');
        newImages.push(relativePath);
      }
      updateData.images = newImages;
      updateData.originalImages = newImages;
      updateData.imageGenStatus = 'skipped';
    }

    const updatedPoetry = await Poetry.findByIdAndUpdate(id, updateData, { new: true });

    // 如果内容更新了，重新进行AI校验
    if (content) {
      aiService.verifyPoetry(id).catch(console.error);
    }

    res.json({
      success: true,
      message: '古诗更新成功',
      data: updatedPoetry,
    });
  } catch (error) {
    console.error('更新古诗错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 删除古诗
export const deletePoetry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const poetry = await Poetry.findById(id);

    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    // 检查权限
    if (req.user?.role !== 'admin' && poetry.createdBy.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: '没有权限删除此古诗',
      });
      return;
    }

    await Poetry.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '古诗删除成功',
    });
  } catch (error) {
    console.error('删除古诗错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取朝代列表
export const getDynasties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const dynasties = await Poetry.distinct('dynasty');
    
    res.json({
      success: true,
      data: dynasties,
    });
  } catch (error) {
    console.error('获取朝代列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取作者列表
export const getAuthors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dynasty } = req.query;
    
    const matchStage: Record<string, unknown> = {};
    if (dynasty) {
      matchStage.dynasty = dynasty;
    }

    const authors = await Poetry.aggregate([
      { $match: matchStage },
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    res.json({
      success: true,
      data: authors.map((a) => ({ name: a._id, count: a.count })),
    });
  } catch (error) {
    console.error('获取作者列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 点赞古诗
export const likePoetry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const poetry = await Poetry.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    if (!poetry) {
      res.status(404).json({
        success: false,
        message: '古诗不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: { likeCount: poetry.likeCount },
    });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};

// 获取统计数据
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalPoetries = await Poetry.countDocuments();
    const totalDynasties = await Poetry.distinct('dynasty');
    const totalAuthors = await Poetry.distinct('author');

    const recentPoetries = await Poetry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author dynasty createdAt');

    const popularPoetries = await Poetry.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title author dynasty viewCount');

    res.json({
      success: true,
      data: {
        totalPoetries,
        totalDynasties: totalDynasties.length,
        totalAuthors: totalAuthors.length,
        recentPoetries,
        popularPoetries,
      },
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
};
