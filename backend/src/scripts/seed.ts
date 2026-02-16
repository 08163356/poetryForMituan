import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Poetry } from '../models/Poetry';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poetry_family';

// 预设家庭成员账号
const familyUsers = [
  {
    username: 'admin',
    password: 'admin123',
    nickname: '管理员',
    role: 'admin',
    status: 'active',
  },
  {
    username: 'family1',
    password: 'family123',
    nickname: '家人一',
    role: 'family',
    status: 'active',
  },
  {
    username: 'family2',
    password: 'family123',
    nickname: '家人二',
    role: 'family',
    status: 'active',
  },
  {
    username: 'family3',
    password: 'family123',
    nickname: '家人三',
    role: 'family',
    status: 'active',
  },
];

// 预设古诗数据（包含网络示例图片）
const samplePoetries = [
  {
    title: '静夜思',
    content: '床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。',
    author: '李白',
    dynasty: '唐代',
    tags: ['思乡', '明月', '五言绝句'],
    images: ['https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&q=80'],
  },
  {
    title: '登鹳雀楼',
    content: '白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。',
    author: '王之涣',
    dynasty: '唐代',
    tags: ['登高', '壮志', '五言绝句'],
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'],
  },
  {
    title: '春晓',
    content: '春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。',
    author: '孟浩然',
    dynasty: '唐代',
    tags: ['春天', '自然', '五言绝句'],
    images: ['https://images.unsplash.com/photo-1462275646964-a0e3571f4f7f?w=800&q=80'],
  },
  {
    title: '江雪',
    content: '千山鸟飞绝，\n万径人踪灭。\n孤舟蓑笠翁，\n独钓寒江雪。',
    author: '柳宗元',
    dynasty: '唐代',
    tags: ['冬天', '孤独', '五言绝句'],
    images: ['https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80'],
  },
  {
    title: '望庐山瀑布',
    content: '日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。',
    author: '李白',
    dynasty: '唐代',
    tags: ['山水', '壮观', '七言绝句'],
    images: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80'],
  },
  {
    title: '枫桥夜泊',
    content: '月落乌啼霜满天，\n江枫渔火对愁眠。\n姑苏城外寒山寺，\n夜半钟声到客船。',
    author: '张继',
    dynasty: '唐代',
    tags: ['夜景', '羁旅', '七言绝句'],
    images: ['https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80'],
  },
  {
    title: '水调歌头·明月几时有',
    content: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。\n起舞弄清影，何似在人间。\n\n转朱阁，低绑户，照无眠。\n不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，此事古难全。\n但愿人长久，千里共婵娟。',
    author: '苏轼',
    dynasty: '宋代',
    tags: ['中秋', '思念', '词'],
    images: ['https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80'],
  },
  {
    title: '声声慢·寻寻觅觅',
    content: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。\n乍暖还寒时候，最难将息。\n三杯两盏淡酒，怎敌他、晚来风急？\n雁过也，正伤心，却是旧时相识。\n\n满地黄花堆积。憔悴损，如今有谁堪摘？\n守着窗儿，独自怎生得黑？\n梧桐更兼细雨，到黄昏、点点滴滴。\n这次第，怎一个愁字了得！',
    author: '李清照',
    dynasty: '宋代',
    tags: ['秋天', '愁思', '词'],
    images: ['https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&q=80'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 清空现有数据
    await User.deleteMany({});
    await Poetry.deleteMany({});
    console.log('🗑️ 已清空现有数据');

    // 创建用户
    const createdUsers = await User.create(familyUsers);
    console.log(`👥 已创建 ${createdUsers.length} 个用户账号`);

    // 获取管理员ID
    const admin = createdUsers.find((u) => u.role === 'admin');

    // 创建古诗
    const poetriesWithCreator = samplePoetries.map((p) => ({
      ...p,
      createdBy: admin?._id,
      verifyStatus: 'completed',
      imageGenStatus: 'skipped',
    }));

    const createdPoetries = await Poetry.create(poetriesWithCreator);
    console.log(`📜 已创建 ${createdPoetries.length} 首古诗`);

    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🎉 种子数据初始化完成！                          ║
║                                                  ║
║   预设账号信息：                                   ║
║   ├─ admin / admin123 (管理员)                   ║
║   ├─ family1 / family123 (家人)                  ║
║   ├─ family2 / family123 (家人)                  ║
║   └─ family3 / family123 (家人)                  ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    process.exit(1);
  }
}

seed();
