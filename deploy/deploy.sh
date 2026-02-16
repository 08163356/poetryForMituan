#!/bin/bash

# =====================================================
# 古诗家庭网站 - 服务器部署脚本
# 使用方法: sudo bash deploy.sh
# =====================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="poetry"
APP_DIR="/var/www/poetry"
REPO_URL="https://github.com/08163356/poetryForMituan.git"
BACKEND_PORT=8002
NODE_VERSION="18"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   🌸 古诗家庭网站 - 自动部署脚本${NC}"
echo -e "${BLUE}================================================${NC}"

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 1. 安装 Node.js (如果未安装)
echo -e "\n${YELLOW}[1/8] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "安装 Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v) 已安装${NC}"

# 2. 创建应用目录
echo -e "\n${YELLOW}[2/8] 创建应用目录...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads
mkdir -p /var/log/poetry
chown -R www-data:www-data /var/log/poetry

# 3. 克隆或更新代码
echo -e "\n${YELLOW}[3/8] 获取代码...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "更新现有代码..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "克隆代码仓库..."
    rm -rf $APP_DIR/*
    git clone $REPO_URL $APP_DIR
fi
cd $APP_DIR

# 4. 安装后端依赖并构建
echo -e "\n${YELLOW}[4/8] 构建后端...${NC}"
cd $APP_DIR/backend
npm install --production=false
npm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"

# 5. 配置后端环境变量
echo -e "\n${YELLOW}[5/8] 配置环境变量...${NC}"
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cp $APP_DIR/backend/.env.production.example $APP_DIR/backend/.env
    echo -e "${YELLOW}⚠ 请编辑 $APP_DIR/backend/.env 配置 MongoDB 连接字符串${NC}"
fi

# 6. 安装前端依赖并构建
echo -e "\n${YELLOW}[6/8] 构建前端...${NC}"
cd $APP_DIR/frontend
npm install
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"

# 7. 配置 systemctl 服务
echo -e "\n${YELLOW}[7/8] 配置系统服务...${NC}"
cp $APP_DIR/deploy/poetry-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable poetry-backend
systemctl restart poetry-backend
echo -e "${GREEN}✓ 服务已配置并启动${NC}"

# 8. 设置权限
echo -e "\n${YELLOW}[8/8] 设置权限...${NC}"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR/frontend/dist
chmod -R 755 $APP_DIR/uploads

# 完成提示
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}   ✅ 部署完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "后续步骤："
echo -e "1. 编辑 MongoDB 配置: ${YELLOW}nano $APP_DIR/backend/.env${NC}"
echo -e "2. 将 Nginx 配置添加到站点配置中"
echo -e "3. 重载 Nginx: ${YELLOW}sudo nginx -t && sudo systemctl reload nginx${NC}"
echo -e "4. 初始化数据: ${YELLOW}cd $APP_DIR/backend && npm run seed${NC}"
echo ""
echo -e "服务管理命令："
echo -e "  启动: ${BLUE}sudo systemctl start poetry-backend${NC}"
echo -e "  停止: ${BLUE}sudo systemctl stop poetry-backend${NC}"
echo -e "  重启: ${BLUE}sudo systemctl restart poetry-backend${NC}"
echo -e "  状态: ${BLUE}sudo systemctl status poetry-backend${NC}"
echo -e "  日志: ${BLUE}tail -f /var/log/poetry/backend.log${NC}"
echo ""
echo -e "访问地址: ${BLUE}https://ablog.axingit.top/poetry${NC}"
