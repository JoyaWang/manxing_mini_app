#!/bin/bash

# 微信商城小程序部署脚本
set -e

echo "🚀 开始部署微信商城小程序后端..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 读取环境变量
ENV=${1:-production}
echo "📦 部署环境: $ENV"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ "$ENV" = "production" ]; then
    echo "🏗️  构建生产版本..."
    npm run build
    
    # 检查环境文件
    if [ ! -f .env ]; then
        echo "⚠️  警告: .env 文件不存在，请创建生产环境配置文件"
        cp .env.example .env
        echo "📝 请编辑 .env 文件配置生产环境参数"
        exit 1
    fi
fi

# 运行测试
echo "🧪 运行测试..."
npm test

# 初始化数据库（可选）
read -p "是否初始化数据库？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  初始化数据库..."
    npm run init-db
fi

# 启动应用
echo "🚀 启动应用..."
if [ "$ENV" = "development" ]; then
    npm run dev
else
    npm start
fi

echo "✅ 部署完成！"
echo "📍 应用运行在: http://localhost:3000"
echo "📊 健康检查: http://localhost:3000/health"