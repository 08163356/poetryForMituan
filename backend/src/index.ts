import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import poetryRoutes from './routes/poetry';
import aiRoutes from './routes/ai';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（图片上传目录）
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/poetry', poetryRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
  });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🌸 古诗家庭网站后端服务已启动                    ║
║                                                  ║
║   📍 地址: http://localhost:${PORT}                ║
║   🕐 时间: ${new Date().toLocaleString()}       ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
