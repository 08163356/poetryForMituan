# =====================================================
# 古诗家庭网站 - Windows 本地构建打包脚本
# 使用方法: 在 PowerShell 中运行 .\scripts\build-and-pack.ps1
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Blue
Write-Host "   🌸 古诗家庭网站 - 本地构建打包" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DistDir = Join-Path $ProjectRoot "dist-package"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# 清理旧的打包目录
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
}
New-Item -ItemType Directory -Path $DistDir | Out-Null

Write-Host "`n[1/5] 构建前端..." -ForegroundColor Yellow
Set-Location (Join-Path $ProjectRoot "frontend")
npm install
npm run build
Write-Host "✓ 前端构建完成" -ForegroundColor Green

Write-Host "`n[2/5] 构建后端..." -ForegroundColor Yellow
Set-Location (Join-Path $ProjectRoot "backend")
npm install
npm run build
Write-Host "✓ 后端构建完成" -ForegroundColor Green

Write-Host "`n[3/5] 复制文件..." -ForegroundColor Yellow

# 复制前端 dist
$FrontendDist = Join-Path $DistDir "frontend\dist"
New-Item -ItemType Directory -Path $FrontendDist -Force | Out-Null
Copy-Item -Recurse -Force (Join-Path $ProjectRoot "frontend\dist\*") $FrontendDist

# 复制后端 dist + package.json + .env.production.example
$BackendDist = Join-Path $DistDir "backend"
New-Item -ItemType Directory -Path $BackendDist -Force | Out-Null
Copy-Item -Recurse -Force (Join-Path $ProjectRoot "backend\dist") $BackendDist
Copy-Item -Force (Join-Path $ProjectRoot "backend\package.json") $BackendDist
Copy-Item -Force (Join-Path $ProjectRoot "backend\.env.production.example") (Join-Path $BackendDist ".env.example")

# 复制部署配置
Copy-Item -Recurse -Force (Join-Path $ProjectRoot "deploy") $DistDir

# 复制 uploads 目录结构
$UploadsDir = Join-Path $DistDir "uploads"
New-Item -ItemType Directory -Path $UploadsDir -Force | Out-Null
"" | Out-File -FilePath (Join-Path $UploadsDir ".gitkeep") -Encoding utf8

Write-Host "✓ 文件复制完成" -ForegroundColor Green

Write-Host "`n[4/5] 创建部署脚本..." -ForegroundColor Yellow

# 创建服务器端快速部署脚本
$ServerScript = @'
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
'@

$ServerScript | Out-File -FilePath (Join-Path $DistDir "install.sh") -Encoding utf8 -NoNewline

Write-Host "✓ 部署脚本创建完成" -ForegroundColor Green

Write-Host "`n[5/5] 打包 ZIP..." -ForegroundColor Yellow
Set-Location $ProjectRoot
$ZipName = "poetry-dist-$Timestamp.zip"
$ZipPath = Join-Path $ProjectRoot $ZipName

# 使用 Compress-Archive 打包
Compress-Archive -Path "$DistDir\*" -DestinationPath $ZipPath -Force

# 计算文件大小
$ZipSize = (Get-Item $ZipPath).Length / 1MB
$ZipSizeStr = "{0:N2} MB" -f $ZipSize

Write-Host "✓ 打包完成" -ForegroundColor Green

# 清理临时目录
Remove-Item -Recurse -Force $DistDir

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "   ✅ 构建打包完成！" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 打包文件: $ZipName"
Write-Host "📊 文件大小: $ZipSizeStr"
Write-Host ""
Write-Host "上传到服务器后执行:" -ForegroundColor Yellow
Write-Host "  unzip $ZipName -d poetry-dist"
Write-Host "  cd poetry-dist"
Write-Host "  sudo bash install.sh"
Write-Host ""
