#!/bin/bash

echo "🚀 启动 LLM API 代理平台..."

# 检查是否已安装依赖
if [ ! -d "server/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

# 启动后端服务器
echo "🖥️ 启动后端服务器 (端口 3000)..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端服务器
echo "🌐 启动前端服务器 (端口 5173)..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ 服务启动成功！"
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔌 后端 API: http://localhost:3000"
echo ""
echo "测试账户:"
echo "  管理员: admin@example.com / admin123"
echo "  普通用户: test@example.com / test123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待所有进程
wait $SERVER_PID $CLIENT_PID
