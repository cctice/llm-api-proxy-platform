#!/bin/bash

echo "🧪 测试 LLM API 代理平台..."

# 测试健康检查
echo "1. 测试健康检查..."
curl -s http://localhost:3000/api/v1/health | jq .

# 测试登录
echo ""
echo "2. 测试登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')
echo $LOGIN_RESPONSE | jq .

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# 测试获取用户信息
echo ""
echo "3. 测试获取用户信息..."
curl -s http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .

# 测试创建 API Key
echo ""
echo "4. 测试创建 API Key..."
API_KEY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Key"}')
echo $API_KEY_RESPONSE | jq .

# 提取 API key secret
API_KEY_SECRET=$(echo $API_KEY_RESPONSE | jq -r '.data.keySecret')

# 测试获取 API Keys 列表
echo ""
echo "5. 测试获取 API Keys 列表..."
curl -s http://localhost:3000/api/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" | jq .

# 测试获取模型列表
echo ""
echo "6. 测试获取模型列表..."
curl -s http://localhost:3000/api/v1/proxy/models \
  -H "Authorization: Bearer $API_KEY_SECRET" | jq .

echo ""
echo "✅ 所有测试完成！"
