#!/bin/bash

# 古诗网站部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🌸 古诗家庭网站部署脚本"
echo "========================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️ .env 文件不存在，创建默认配置..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
AI_VERIFY_API_KEY=
AI_IMAGE_API_KEY=
EOF
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 停止旧容器
echo "🔄 停止旧容器..."
docker compose down || true

# 构建并启动
echo "🔨 构建并启动容器..."
docker compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker compose ps

# 初始化数据（首次部署）
read -p "是否初始化种子数据？(y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 初始化种子数据..."
    docker compose exec backend npm run seed
fi

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost"
echo ""
echo "预设账号："
echo "  管理员: admin / admin123"
echo "  家人: family1 / family123"
echo ""
echo "查看日志: docker compose logs -f"
echo "停止服务: docker compose down"
