# 🌸 古诗家庭网站 (Poetry Family Website)

一个温馨的家庭古诗词分享平台，支持诗词创作、图片上传、AI 校验等功能。

## 📖 项目背景

这是一个为家人打造的私人古诗词分享网站，让全家人可以：
- 📝 分享自己喜欢的古诗词
- 🖼️ 上传与诗词相配的图片
- 💬 记录对诗词的理解和感悟
- 🤖 AI 辅助校验诗词内容

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔐 用户系统 | 注册、登录、角色管理（管理员/家人/访客） |
| 📜 诗词管理 | 创建、编辑、删除、浏览诗词 |
| 🖼️ 图片上传 | 支持多图上传，自动压缩 |
| 🔍 搜索筛选 | 按朝代、作者、关键词筛选 |
| ❤️ 互动功能 | 点赞、浏览统计 |
| 🌙 深色模式 | 支持亮色/深色主题切换 |
| 📱 响应式 | 适配手机、平板、电脑 |

## 🛠️ 技术栈

| 端 | 技术 |
|---|------|
| 前端 | Vue 3 + TypeScript + Vite + Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MongoDB (支持 MongoDB Atlas 云数据库) |
| 部署 | Nginx + Systemctl |

---

## 🚀 快速开始（本地开发）

### 环境要求

- Node.js >= 18
- MongoDB (本地或 Atlas 云数据库)
- Git

### 1. 克隆项目

```bash
git clone https://github.com/08163356/poetryForMituan.git
cd poetryForMituan
```

### 2. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑 .env，配置 MongoDB 连接
# MONGODB_URI=mongodb://localhost:27017/poetry_family

# 启动开发服务器
npm run dev

# 初始化数据（可选）
npm run seed
```

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 预设账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 管理员 |
| family1 | family123 | 家人 |
| family2 | family123 | 家人 |

---

## 📦 服务器部署指南

本指南以部署到 `https://ablog.axingit.top/poetry` 为例。

### 前置条件

- Ubuntu/Debian 服务器
- 已安装 Nginx 且配置好 SSL
- Node.js >= 18

### 步骤 1: 注册 MongoDB Atlas（免费云数据库）

由于服务器没有安装 MongoDB，我们使用免费的 MongoDB Atlas 云数据库：

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 注册账号
2. 创建免费的 M0 集群（512MB，永久免费）
3. 设置数据库用户名和密码
4. 在 Network Access 中添加服务器 IP（或允许所有 IP: `0.0.0.0/0`）
5. 获取连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/poetry_family?retryWrites=true&w=majority
   ```

### 步骤 2: 导出本地数据（可选）

如果本地已有数据，需要导出并导入到 Atlas：

```bash
# 在本地执行
cd backend
npm run export-data
```

这会在 `backend/data-export/` 目录生成 JSON 文件，按照目录中的 README 说明导入到 Atlas。

### 步骤 3: 服务器部署

**方式一：自动部署脚本**

```bash
# SSH 到服务器
ssh user@your-server

# 下载并运行部署脚本
curl -fsSL https://raw.githubusercontent.com/08163356/poetryForMituan/main/deploy/deploy.sh -o deploy.sh
sudo bash deploy.sh
```

**方式二：手动部署**

```bash
# 1. 创建目录
sudo mkdir -p /var/www/poetry
sudo mkdir -p /var/log/poetry

# 2. 克隆代码
sudo git clone https://github.com/08163356/poetryForMituan.git /var/www/poetry

# 3. 构建后端
cd /var/www/poetry/backend
sudo npm install --production=false
sudo npm run build

# 4. 配置环境变量
sudo cp .env.production.example .env
sudo nano .env  # 编辑 MongoDB 连接字符串

# 5. 构建前端
cd /var/www/poetry/frontend
sudo npm install
sudo npm run build

# 6. 设置权限
sudo chown -R www-data:www-data /var/www/poetry
sudo chown -R www-data:www-data /var/log/poetry
```

### 步骤 4: 配置 Systemctl 服务

```bash
# 复制服务文件
sudo cp /var/www/poetry/deploy/poetry-backend.service /etc/systemd/system/

# 重载 systemd
sudo systemctl daemon-reload

# 启用并启动服务
sudo systemctl enable poetry-backend
sudo systemctl start poetry-backend

# 查看状态
sudo systemctl status poetry-backend
```

### 步骤 5: 配置 Nginx

编辑你的 Nginx 站点配置文件（如 `/etc/nginx/sites-available/ablog.axingit.top`），在 `server` 块中添加：

```nginx
# ===== Poetry Family 古诗家庭网站 =====
# 前端静态文件
location /poetry {
    alias /var/www/poetry/frontend/dist;
    index index.html;
    try_files $uri $uri/ /poetry/index.html;
}

# Poetry 静态资源缓存
location /poetry/assets/ {
    alias /var/www/poetry/frontend/dist/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Poetry 上传文件目录
location /poetry/uploads/ {
    alias /var/www/poetry/uploads/;
    expires 30d;
    add_header Cache-Control "public";
}

# Poetry API 代理
location /poetry/api/ {
    rewrite ^/poetry/api/(.*)$ /api/$1 break;
    proxy_pass http://127.0.0.1:8002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 文件上传支持
    client_max_body_size 20M;
}
```

测试并重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 步骤 6: 初始化数据

```bash
cd /var/www/poetry/backend
sudo -u www-data npm run seed
```

### 步骤 7: 验证部署

访问 https://ablog.axingit.top/poetry

---

## ⚙️ 环境变量配置

### 后端 (.env)

| 变量 | 说明 | 示例 |
|------|------|------|
| PORT | 服务端口 | 8002 |
| NODE_ENV | 环境 | production |
| MONGODB_URI | MongoDB 连接字符串 | mongodb+srv://... |
| JWT_SECRET | JWT 密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token 有效期 | 7d |
| UPLOAD_DIR | 上传目录 | /var/www/poetry/uploads |
| MAX_FILE_SIZE | 最大文件大小 | 10485760 |

### 前端 (.env.production)

| 变量 | 说明 | 示例 |
|------|------|------|
| VITE_API_URL | API 地址 | https://ablog.axingit.top/poetry/api |

---

## 🔧 运维命令

```bash
# 启动服务
sudo systemctl start poetry-backend

# 停止服务
sudo systemctl stop poetry-backend

# 重启服务
sudo systemctl restart poetry-backend

# 查看状态
sudo systemctl status poetry-backend

# 查看日志
tail -f /var/log/poetry/backend.log

# 查看错误日志
tail -f /var/log/poetry/error.log

# 更新代码
cd /var/www/poetry
sudo git pull origin main
cd backend && sudo npm install && sudo npm run build
cd ../frontend && sudo npm install && sudo npm run build
sudo systemctl restart poetry-backend
```

---

## 📁 项目结构

```
poetryForMituan/
├── backend/                # 后端服务
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── scripts/       # 脚本（seed, export）
│   │   ├── services/      # 服务层
│   │   └── index.ts       # 入口文件
│   ├── .env.example       # 环境变量示例
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # Pinia 状态
│   │   ├── services/      # API 服务
│   │   ├── router/        # 路由配置
│   │   └── main.ts        # 入口文件
│   ├── .env.production    # 生产环境配置
│   └── package.json
├── deploy/                 # 部署配置
│   ├── deploy.sh          # 部署脚本
│   ├── nginx-poetry.conf  # Nginx 配置片段
│   └── poetry-backend.service  # Systemctl 服务
├── uploads/               # 上传文件目录
├── docker-compose.yml     # Docker 编排（可选）
└── README.md
```

---

## ❓ 常见问题

### Q: MongoDB Atlas 连接超时？

确保：
1. Atlas 的 Network Access 已添加服务器 IP
2. 连接字符串格式正确
3. 用户名密码正确

### Q: 上传图片失败？

检查：
1. uploads 目录权限：`sudo chown -R www-data:www-data /var/www/poetry/uploads`
2. Nginx 配置了 `client_max_body_size 20M;`

### Q: 页面刷新 404？

确保 Nginx 配置了 `try_files $uri $uri/ /poetry/index.html;`

### Q: API 404？

1. 检查后端服务是否运行：`sudo systemctl status poetry-backend`
2. 检查端口是否正确（默认 8002）
3. 查看日志：`tail -f /var/log/poetry/backend.log`

---

## 📄 License

MIT License
