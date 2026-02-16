import mongoose, { Schema, Document } from 'mongoose';

export interface IPoetryDocument extends Document {
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
  createdBy: mongoose.Types.ObjectId;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PoetrySchema = new Schema<IPoetryDocument>(
  {
    title: {
      type: String,
      required: [true, '诗词标题是必填项'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    content: {
      type: String,
      required: [true, '诗词内容是必填项'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, '作者是必填项'],
      trim: true,
      maxlength: [50, '作者名最多50个字符'],
    },
    dynasty: {
      type: String,
      required: [true, '朝代是必填项'],
      trim: true,
      maxlength: [20, '朝代最多20个字符'],
    },
    originalContent: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    originalImages: {
      type: [String],
      default: [],
    },
    aiGeneratedImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    verifyStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    imageGenStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'skipped'],
      default: 'pending',
    },
    verifiedContent: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 创建文本索引用于搜索
PoetrySchema.index({ title: 'text', content: 'text', author: 'text', dynasty: 'text' });

// 创建普通索引
PoetrySchema.index({ dynasty: 1 });
PoetrySchema.index({ author: 1 });
PoetrySchema.index({ createdAt: -1 });
PoetrySchema.index({ createdBy: 1 });

export const Poetry = mongoose.model<IPoetryDocument>('Poetry', PoetrySchema);
