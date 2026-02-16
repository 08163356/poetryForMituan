# 🌸 诗韵家园 - 古诗家庭网站

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker">
</p>

## 📖 项目背景

**诗韵家园** 是一个专为家庭设计的私密古诗分享平台。在这个数字化时代，我们希望为家人创造一个温馨的空间，用于：

- 📝 记录和分享家人创作的古诗词
- 🎨 欣赏古人的经典诗词作品
- 👨‍👩‍👧‍👦 促进家庭成员之间的文化交流
- 🔒 保护家庭隐私，只有受邀成员才能访问

### 为什么做这个项目？

- **传承文化**：让古诗词成为家庭文化的一部分
- **私密分享**：不同于公开的社交平台，这是属于家人的私密空间
- **简单易用**：老人小孩都能轻松使用的界面设计
- **AI 赋能**：借助 AI 技术帮助校对错别字、生成配图

---

## ✨ 功能特性

### 🏠 用户系统
- **预设家庭账号**：开箱即用的 4 个家庭成员账号
- **访问申请**：外部人员可申请访问，管理员审核
- **角色管理**：管理员、家人、访客三种角色权限

### 📜 古诗展示
- **古风毛玻璃界面**：精美的视觉设计，彰显古典韵味
- **日/夜模式**：一键切换，保护眼睛
- **响应式布局**：手机、平板、电脑完美适配
- **随机卡片布局**：每次刷新都有新鲜感

### ✍️ 古诗管理
- **创作发布**：支持创建原创或录入经典古诗
- **分类检索**：按朝代、作者、标签分类
- **图片上传**：为古诗配上精美图片（最多2张）
- **全文搜索**：快速找到想要的诗词

### 🤖 AI 增强（可选）
- **错别字校验**：AI 自动检测并提示可能的错别字
- **配图生成**：AI 根据诗意生成古风配图
- **异步处理**：AI 功能不阻塞用户操作

### 👤 后台管理
- **用户管理**：审核新用户、管理现有账号
- **内容统计**：查看诗词数量、用户活跃度
- **系统设置**：配置网站基本信息

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Vue 3 + TypeScript | 组合式 API，类型安全 |
| **状态管理** | Pinia | 轻量级状态管理 |
| **UI 框架** | Tailwind CSS | 原子化 CSS，快速开发 |
| **构建工具** | Vite | 极速的开发体验 |
| **后端** | Express.js + TypeScript | 成熟稳定的 Node.js 框架 |
| **数据库** | MongoDB + Mongoose | 灵活的文档数据库 |
| **认证** | JWT | 安全的无状态认证 |
| **部署** | Docker + Nginx | 容器化一键部署 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **npm** >= 9.0 或 **yarn** >= 1.22
- **Git**（可选）

### 1️⃣ 克隆/下载项目

```bash
# 如果有 Git
git clone <your-repo-url>
cd poetry-family-website

# 或者直接下载 ZIP 解压
```

### 2️⃣ 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3️⃣ 配置环境变量

```bash
# 复制示例配置
cd backend
cp .env.example .env

# 编辑配置文件
# Windows: notepad .env
# Linux/Mac: nano .env
```

**必须配置的项：**

```env
# MongoDB 连接地址
MONGODB_URI=mongodb://localhost:27017/poetry_family

# JWT 密钥（生产环境务必修改为复杂的随机字符串！）
JWT_SECRET=your-super-secret-key-change-in-production
```

**可选配置（AI 功能）：**

```env
# OpenAI API 配置 - 用于古诗校验
AI_VERIFY_API_KEY=sk-your-openai-api-key
AI_VERIFY_API_URL=https://api.openai.com/v1/chat/completions
AI_VERIFY_MODEL=gpt-3.5-turbo

# OpenAI API 配置 - 用于配图生成
AI_IMAGE_API_KEY=sk-your-openai-api-key
AI_IMAGE_API_URL=https://api.openai.com/v1/images/generations
AI_IMAGE_MODEL=dall-e-3
```

> 💡 **提示**：不配置 AI API Key 不影响其他功能的正常使用！

### 4️⃣ 初始化数据库

```bash
cd backend
npm run seed
```

执行成功后会创建以下预设账号：

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `admin123` | 管理员 | 拥有所有权限 |
| `family1` | `family123` | 家人 | 可发布和管理自己的诗词 |
| `family2` | `family123` | 家人 | 可发布和管理自己的诗词 |
| `family3` | `family123` | 家人 | 可发布和管理自己的诗词 |

> ⚠️ **安全提示**：首次登录后请立即修改默认密码！

### 5️⃣ 启动开发服务器

**方式一：分开启动（推荐开发时使用）**

```bash
# 终端 1 - 启动后端
cd backend
npm run dev
# 后端运行在 http://localhost:3000

# 终端 2 - 启动前端
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

**方式二：使用 concurrently 同时启动**

```bash
# 在项目根目录
npm run dev
```

### 6️⃣ 访问网站

打开浏览器访问：**http://localhost:5173**

---

## 📦 生产部署

### 方式一：Docker Compose（推荐）

这是最简单的部署方式，适合大多数 Linux 服务器。

#### 1. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose 插件
sudo apt update
sudo apt install docker-compose-plugin
```

#### 2. 上传项目到服务器

```bash
# 方式一：使用 scp
scp -r poetry-family-website user@your-server:/home/user/

# 方式二：使用 rsync（推荐，支持断点续传）
rsync -avz --progress poetry-family-website user@your-server:/home/user/

# 方式三：在服务器上 git clone
ssh user@your-server
git clone <your-repo-url>
```

#### 3. 配置环境变量

```bash
cd /home/user/poetry-family-website

# 创建生产环境配置
cat > .env << 'EOF'
# 生产环境 JWT 密钥（务必修改！）
JWT_SECRET=your-very-long-and-random-secret-key-for-production-12345

# AI 功能配置（可选）
AI_VERIFY_API_KEY=sk-your-key
AI_IMAGE_API_KEY=sk-your-key
EOF
```

#### 4. 启动服务

```bash
# 构建并启动所有服务
docker compose up -d --build

# 查看运行状态
docker compose ps
```

#### 5. 初始化数据

```bash
# 首次部署需要初始化预设账号
docker compose exec backend npm run seed
```

#### 6. 常用运维命令

```bash
# 查看日志
docker compose logs -f              # 所有服务
docker compose logs -f backend      # 仅后端
docker compose logs -f frontend     # 仅前端

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
git pull
docker compose up -d --build
```

### 方式二：手动部署

适合需要更精细控制的场景。

#### 1. 安装依赖环境

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v   # 应显示 9.x.x

# 安装 MongoDB（Ubuntu 22.04）
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

#### 2. 构建项目

```bash
cd poetry-family-website

# 构建前端
cd frontend
npm install
npm run build

# 构建后端
cd ../backend
npm install
npm run build
```

#### 3. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/poetry
```

写入以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名或 IP

    # 前端静态文件
    root /home/user/poetry-family-website/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传文件代理
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # 前端路由 - SPA 支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/poetry /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl reload nginx
```

#### 4. 使用 PM2 管理后端

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动后端
cd /home/user/poetry-family-website/backend
pm2 start dist/index.js --name poetry-backend

# 设置开机自启
pm2 save
pm2 startup
# 按照提示执行输出的命令
```

PM2 常用命令：

```bash
pm2 status          # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启所有
pm2 reload all      # 平滑重启
```

### 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## ⚙️ 配置说明

### 后端环境变量 (.env)

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | `3000` | 后端服务端口 |
| `MONGODB_URI` | 是 | - | MongoDB 连接字符串 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 否 | `7d` | Token 有效期 |
| `UPLOAD_DIR` | 否 | `../uploads` | 文件上传目录 |
| `MAX_FILE_SIZE` | 否 | `5242880` | 最大上传文件大小(字节) |
| `AI_VERIFY_API_KEY` | 否 | - | 古诗校验 AI API Key |
| `AI_VERIFY_API_URL` | 否 | OpenAI | 古诗校验 API 地址 |
| `AI_VERIFY_MODEL` | 否 | `gpt-3.5-turbo` | 校验使用的模型 |
| `AI_IMAGE_API_KEY` | 否 | - | 配图生成 AI API Key |
| `AI_IMAGE_API_URL` | 否 | OpenAI | 配图生成 API 地址 |
| `AI_IMAGE_MODEL` | 否 | `dall-e-3` | 配图使用的模型 |

### 前端环境变量

**开发环境** (`.env.development`)：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**生产环境** (`.env.production`)：

```env
VITE_API_BASE_URL=/api
```

---

## 📁 项目结构

```
poetry-family-website/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── assets/             # 静态资源
│   │   ├── components/         # 通用组件
│   │   │   ├── Navbar.vue      # 导航栏
│   │   │   ├── Footer.vue      # 页脚
│   │   │   └── PoetryCard.vue  # 诗词卡片
│   │   ├── views/              # 页面视图
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── Login.vue       # 登录
│   │   │   ├── Register.vue    # 注册
│   │   │   ├── Create.vue      # 创作页
│   │   │   ├── Profile.vue     # 个人中心
│   │   │   ├── Admin.vue       # 后台管理
│   │   │   └── PoetryDetail.vue # 诗词详情
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── auth.ts         # 用户认证状态
│   │   │   ├── theme.ts        # 主题状态
│   │   │   └── poetry.ts       # 诗词数据状态
│   │   ├── services/           # API 服务
│   │   │   ├── api.ts          # Axios 实例
│   │   │   ├── auth.ts         # 认证 API
│   │   │   └── poetry.ts       # 诗词 API
│   │   ├── router/             # 路由配置
│   │   └── types/              # TypeScript 类型
│   ├── public/                 # 公共资源
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── config/             # 配置
│   │   │   └── database.ts     # 数据库连接
│   │   ├── controllers/        # 控制器
│   │   │   ├── auth.ts         # 认证控制器
│   │   │   └── poetry.ts       # 诗词控制器
│   │   ├── models/             # 数据模型
│   │   │   ├── User.ts         # 用户模型
│   │   │   └── Poetry.ts       # 诗词模型
│   │   ├── routes/             # 路由
│   │   │   ├── auth.ts         # 认证路由
│   │   │   ├── poetry.ts       # 诗词路由
│   │   │   └── ai.ts           # AI 功能路由
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.ts         # JWT 验证
│   │   │   └── upload.ts       # 文件上传
│   │   ├── services/           # 业务服务
│   │   │   └── aiService.ts    # AI 服务
│   │   ├── scripts/            # 脚本
│   │   │   └── seed.ts         # 数据初始化
│   │   ├── types/              # 类型定义
│   │   └── index.ts            # 入口文件
│   ├── .env.example            # 环境变量示例
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
│
├── uploads/                     # 上传文件目录
├── docker-compose.yml           # Docker 编排
├── deploy.sh                    # 部署脚本
├── .gitignore
└── README.md
```

---

## ❓ 常见问题

### Q1: npm install 报错？

```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q2: MongoDB 连接失败？

```bash
# 检查 MongoDB 服务状态
sudo systemctl status mongod

# 启动服务
sudo systemctl start mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### Q3: 图片上传失败？

```bash
# 检查 uploads 目录权限
ls -la uploads/

# 修改权限
chmod 755 uploads/
chown -R www-data:www-data uploads/  # 如果使用 Nginx
```

### Q4: 如何修改预设账号密码？

有两种方式：
1. 登录后在「个人中心」修改
2. 修改 `backend/src/scripts/seed.ts` 后重新运行：
   ```bash
   npm run seed
   ```

### Q5: Docker 构建很慢？

使用国内镜像源：

```bash
# 创建 Docker 配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
EOF
sudo systemctl restart docker
```

### Q6: 如何备份数据？

```bash
# 备份 MongoDB
mongodump --db poetry_family --out /backup/$(date +%Y%m%d)

# 恢复
mongorestore --db poetry_family /backup/20240101/poetry_family
```

---

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Express.js](https://expressjs.com/) - Node.js Web 框架
- [MongoDB](https://www.mongodb.com/) - 文档数据库

---

<p align="center">
  用 ❤️ 为家人打造
</p>
