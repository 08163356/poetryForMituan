#!/usr/bin/env node

/**
 * 数据导出脚本
 * 将本地 MongoDB 数据导出为 JSON 文件，用于迁移到服务器
 * 
 * 使用方法: npm run export-data
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poetry_family';

// 导入模型
const userSchema = new mongoose.Schema({}, { strict: false });
const poetrySchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Poetry = mongoose.model('Poetry', poetrySchema);

async function exportData() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    const exportDir = path.join(__dirname, '../data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // 导出用户数据
    console.log('📤 导出用户数据...');
    const users = await User.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`   ✓ 导出 ${users.length} 个用户`);

    // 导出诗词数据
    console.log('📤 导出诗词数据...');
    const poetries = await Poetry.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, 'poetries.json'),
      JSON.stringify(poetries, null, 2)
    );
    console.log(`   ✓ 导出 ${poetries.length} 首诗词`);

    // 创建导入脚本说明
    const importInstructions = `
# 数据导入说明

导出时间: ${new Date().toISOString()}

## 文件说明
- users.json: 用户数据
- poetries.json: 诗词数据

## 导入到 MongoDB Atlas

1. 安装 mongoimport 工具 (MongoDB Database Tools)

2. 导入用户数据:
   mongoimport --uri "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/poetry_family" --collection users --file users.json --jsonArray

3. 导入诗词数据:
   mongoimport --uri "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/poetry_family" --collection poetries --file poetries.json --jsonArray

## 或使用 MongoDB Compass

1. 连接到 MongoDB Atlas
2. 选择 poetry_family 数据库
3. 对每个集合点击 "Add Data" -> "Import JSON or CSV file"
4. 选择对应的 JSON 文件导入
`;

    fs.writeFileSync(
      path.join(exportDir, 'README.md'),
      importInstructions
    );

    console.log('\n✅ 数据导出完成！');
    console.log(`📁 导出目录: ${exportDir}`);

  } catch (error) {
    console.error('❌ 导出失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

exportData();
