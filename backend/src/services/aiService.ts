import axios from 'axios';
import { Poetry } from '../models/Poetry';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const AI_VERIFY_API_KEY = process.env.AI_VERIFY_API_KEY;
const AI_VERIFY_API_URL = process.env.AI_VERIFY_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_VERIFY_MODEL = process.env.AI_VERIFY_MODEL || 'gpt-3.5-turbo';

const AI_IMAGE_API_KEY = process.env.AI_IMAGE_API_KEY;
const AI_IMAGE_API_URL = process.env.AI_IMAGE_API_URL || 'https://api.openai.com/v1/images/generations';
const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || 'dall-e-3';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

class AIService {
  // 古诗校验和纠错
  async verifyPoetry(poetryId: string): Promise<void> {
    try {
      const poetry = await Poetry.findById(poetryId);
      if (!poetry) {
        console.error('古诗不存在:', poetryId);
        return;
      }

      // 更新状态为处理中
      await Poetry.findByIdAndUpdate(poetryId, { verifyStatus: 'processing' });

      if (!AI_VERIFY_API_KEY) {
        console.log('AI校验API未配置，跳过校验');
        await Poetry.findByIdAndUpdate(poetryId, {
          verifyStatus: 'completed',
          verifiedContent: poetry.content,
        });
        return;
      }

      const prompt = `你是一个古诗专家。请检查以下古诗内容，纠正其中的错别字和标点符号错误。
如果内容完全正确，直接返回原文。
如果有错误，返回纠正后的内容。
只返回纠正后的诗词内容，不要添加任何解释或说明。

诗词标题：${poetry.title}
作者：${poetry.author}
朝代：${poetry.dynasty}
内容：
${poetry.content}`;

      const response = await axios.post(
        AI_VERIFY_API_URL,
        {
          model: AI_VERIFY_MODEL,
          messages: [
            { role: 'system', content: '你是一个专业的古诗校对专家。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${AI_VERIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const verifiedContent = response.data.choices[0]?.message?.content?.trim();

      if (verifiedContent) {
        await Poetry.findByIdAndUpdate(poetryId, {
          verifyStatus: 'completed',
          verifiedContent,
          content: verifiedContent,
        });
        console.log('古诗校验完成:', poetryId);
      } else {
        throw new Error('AI返回内容为空');
      }
    } catch (error) {
      console.error('古诗校验失败:', error);
      await Poetry.findByIdAndUpdate(poetryId, { verifyStatus: 'failed' });
    }
  }

  // 生成AI配图
  async generateImage(poetryId: string): Promise<void> {
    try {
      const poetry = await Poetry.findById(poetryId);
      if (!poetry) {
        console.error('古诗不存在:', poetryId);
        return;
      }

      // 如果已有图片，跳过生成
      if (poetry.images.length > 0) {
        await Poetry.findByIdAndUpdate(poetryId, { imageGenStatus: 'skipped' });
        return;
      }

      // 更新状态为处理中
      await Poetry.findByIdAndUpdate(poetryId, { imageGenStatus: 'processing' });

      if (!AI_IMAGE_API_KEY) {
        console.log('AI图片生成API未配置，跳过生成');
        await Poetry.findByIdAndUpdate(poetryId, { imageGenStatus: 'skipped' });
        return;
      }

      const prompt = `创作一幅中国古典水墨画风格的图片，展现以下古诗的意境：

诗词：《${poetry.title}》
作者：${poetry.author}（${poetry.dynasty}）
内容：${poetry.content}

要求：
1. 采用中国传统水墨画风格
2. 色调淡雅，意境悠远
3. 体现诗词中描写的景象和情感
4. 构图优美，适合作为诗词配图`;

      const response = await axios.post(
        AI_IMAGE_API_URL,
        {
          model: AI_IMAGE_MODEL,
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            'Authorization': `Bearer ${AI_IMAGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      const imageUrl = response.data.data[0]?.url;

      if (imageUrl) {
        // 下载图片并保存到本地
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const today = new Date();
        const dateDir = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}`;
        const uploadPath = path.join(UPLOAD_DIR, 'ai-generated', dateDir);

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const filename = `${uuidv4()}.png`;
        const filePath = path.join(uploadPath, filename);
        fs.writeFileSync(filePath, imageResponse.data);

        const relativePath = filePath.replace(/\\/g, '/');

        await Poetry.findByIdAndUpdate(poetryId, {
          imageGenStatus: 'completed',
          aiGeneratedImage: relativePath,
          images: [relativePath],
        });
        console.log('AI配图生成完成:', poetryId);
      } else {
        throw new Error('AI返回图片URL为空');
      }
    } catch (error) {
      console.error('AI配图生成失败:', error);
      await Poetry.findByIdAndUpdate(poetryId, { imageGenStatus: 'failed' });
    }
  }

  // 手动触发重新校验
  async retryVerify(poetryId: string): Promise<void> {
    await Poetry.findByIdAndUpdate(poetryId, { verifyStatus: 'pending' });
    await this.verifyPoetry(poetryId);
  }

  // 手动触发重新生成图片
  async retryGenerateImage(poetryId: string): Promise<void> {
    await Poetry.findByIdAndUpdate(poetryId, { imageGenStatus: 'pending' });
    await this.generateImage(poetryId);
  }
}

export const aiService = new AIService();
