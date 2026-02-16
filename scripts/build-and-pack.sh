#!/bin/bash
# =====================================================
# 古诗家庭网站 - Linux/Mac 本地构建打包脚本
# 使用方法: bash scripts/build-and-pack.sh
# =====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   🌸 古诗家庭网站 - 本地构建打包${NC}"
echo -e "${BLUE}================================================${NC}"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist-package"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# 清理旧的打包目录
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo -e "\n${YELLOW}[1/5] 构建前端...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"

echo -e "\n${YELLOW}[2/5] 构建后端...${NC}"
cd "$PROJECT_ROOT/backend"
npm install
npm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"

echo -e "\n${YELLOW}[3/5] 复制文件...${NC}"

# 复制前端 dist
mkdir -p "$DIST_DIR/frontend"
cp -r "$PROJECT_ROOT/frontend/dist" "$DIST_DIR/frontend/"

# 复制后端 dist + package.json + .env.example
mkdir -p "$DIST_DIR/backend"
cp -r "$PROJECT_ROOT/backend/dist" "$DIST_DIR/backend/"
cp "$PROJECT_ROOT/backend/package.json" "$DIST_DIR/backend/"
cp "$PROJECT_ROOT/backend/.env.production.example" "$DIST_DIR/backend/.env.example"

# 复制部署配置
cp -r "$PROJECT_ROOT/deploy" "$DIST_DIR/"

# 创建 uploads 目录
mkdir -p "$DIST_DIR/uploads"
touch "$DIST_DIR/uploads/.gitkeep"

echo -e "${GREEN}✓ 文件复制完成${NC}"

echo -e "\n${YELLOW}[4/5] 创建部署脚本...${NC}"

# 创建服务器端快速部署脚本
cat > "$DIST_DIR/install.sh" << 'EOF'
#!/bin/bash
# 服务器快速部署脚本 - 解压后执行
# 使用方法: sudo bash install.sh

set -e

APP_DIR="/var/www/poetry"

echo "🌸 开始部署古诗家庭网站..."

# 创建目录
sudo mkdir -p $APP_DIR
sudo mkdir -p /var/log/poetry

# 复制文件
echo "📁 复制文件..."
sudo cp -r frontend $APP_DIR/
sudo cp -r backend $APP_DIR/
sudo cp -r uploads $APP_DIR/
sudo cp -r deploy $APP_DIR/

# 安装后端依赖（只安装生产依赖，速度快）
echo "📦 安装后端依赖..."
cd $APP_DIR/backend
sudo npm install --production

# 配置环境变量
if [ ! -f "$APP_DIR/backend/.env" ]; then
    sudo cp .env.example .env
    echo "⚠️  请编辑 $APP_DIR/backend/.env 配置数据库连接"
fi

# 设置权限
echo "🔐 设置权限..."
sudo chown -R www-data:www-data $APP_DIR
sudo chown -R www-data:www-data /var/log/poetry

# 配置 systemctl
echo "⚙️  配置系统服务..."
sudo cp $APP_DIR/deploy/poetry-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable poetry-backend
sudo systemctl restart poetry-backend

echo ""
echo "✅ 部署完成！"
echo ""
echo "后续步骤："
echo "1. 编辑配置: sudo nano $APP_DIR/backend/.env"
echo "2. 配置 Nginx（参考 deploy/nginx-poetry.conf）"
echo "3. 重载 Nginx: sudo nginx -t && sudo systemctl reload nginx"
echo "4. 初始化数据: cd $APP_DIR/backend && sudo -u www-data node dist/scripts/seed.js"
echo ""
echo "访问地址: https://ablog.axingit.top/poetry"
EOF

chmod +x "$DIST_DIR/install.sh"
echo -e "${GREEN}✓ 部署脚本创建完成${NC}"

echo -e "\n${YELLOW}[5/5] 打包 ZIP...${NC}"
cd "$PROJECT_ROOT"
ZIP_NAME="poetry-dist-$TIMESTAMP.zip"

cd "$DIST_DIR"
zip -r "$PROJECT_ROOT/$ZIP_NAME" .
cd "$PROJECT_ROOT"

# 计算文件大小
ZIP_SIZE=$(du -h "$ZIP_NAME" | cut -f1)

echo -e "${GREEN}✓ 打包完成${NC}"

# 清理临时目录
rm -rf "$DIST_DIR"

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}   ✅ 构建打包完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "📦 打包文件: $ZIP_NAME"
echo -e "📊 文件大小: $ZIP_SIZE"
echo ""
echo -e "${YELLOW}上传到服务器后执行:${NC}"
echo "  unzip $ZIP_NAME -d poetry-dist"
echo "  cd poetry-dist"
echo "  sudo bash install.sh"
echo ""
