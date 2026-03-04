# LLM API统一代理平台 - API接口设计

## 1. API架构

**基础路径**：`/api/v1`

**认证方式**：
- JWT Token（用户管理）
- Bearer Token（API调用）

**响应格式**：
```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 2. 认证接口

### 2.1 用户注册
```
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "张三"
}

Response 201:
{
  "success": true,
  "data": {
    "user": { "id": "xxx", "email": "user@example.com" },
    "token": "jwt_token_here"
  }
}
```

### 2.2 用户登录
```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "xxx", "email": "user@example.com" }
  }
}
```

## 3. 代理接口（OpenAI兼容）

### 3.1 聊天完成（Chat Completions）
```
POST /api/v1/chat/completions
Authorization: Bearer <your_api_key>
Content-Type: application/json

Request:
{
  "model": "gpt-4",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": false
}

Response 200:
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！有什么我可以帮助你的吗？"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### 3.2 流式响应（SSE）
```
POST /api/v1/chat/completions
Authorization: Bearer <your_api_key>
Content-Type: application/json

Request:
{
  "model": "gpt-4",
  "messages": [{ "role": "user", "content": "你好" }],
  "stream": true
}

Response 200 (text/event-stream):
data: {"id":"cmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"你"}}]}
data: {"id":"cmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"好"}}]}
...
data: [DONE]
```

### 3.3 模型列表
```
GET /api/v1/models
Authorization: Bearer <your_api_key>

Response 200:
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "owned_by": "openai"
    },
    {
      "id": "claude-3-opus",
      "object": "model",
      "owned_by": "anthropic"
    }
  ]
}
```

## 4. 用户管理接口

### 4.1 获取用户信息
```
GET /api/v1/user/profile
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "张三",
    "role": "user"
  }
}
```

### 4.2 修改密码
```
PUT /api/v1/user/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}

Response 200:
{ "success": true }
```

## 5. API Key管理接口

### 5.1 创建API Key
```
POST /api/v1/keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "name": "生产环境Key",
  "description": "用于生产环境API调用",
  "maxTokens": 1000000,
  "maxRequests": 10000,
  "expiresAt": "2026-12-31T23:59:59Z"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "xxx",
    "keyPrefix": "sk-proj_abcd",
    "keySecret": "sk-proj_abcd_xyz123...",  // 只显示一次
    "name": "生产环境Key",
    "createdAt": "2026-03-05T01:00:00Z"
  }
}
```

### 5.2 获取API Key列表
```
GET /api/v1/keys?page=1&limit=20&status=active
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "xxx",
        "keyPrefix": "sk-proj_abcd",
        "name": "生产环境Key",
        "totalTokens": 50000,
        "totalRequests": 200,
        "maxTokens": 1000000,
        "maxRequests": 10000,
        "enabled": true,
        "lastUsedAt": "2026-03-04T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 5.3 启用/禁用API Key
```
PATCH /api/v1/keys/:id/toggle
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": { "id": "xxx", "enabled": false }
}
```

### 5.4 删除API Key
```
DELETE /api/v1/keys/:id
Authorization: Bearer <jwt_token>

Response 200:
{ "success": true }
```

## 6. 厂商管理接口

### 6.1 获取厂商列表
```
GET /api/v1/providers
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "openai",
      "displayName": "OpenAI",
      "endpoint": "https://api.openai.com/v1",
      "enabled": true
    }
  ]
}
```

### 6.2 添加厂商API Key
```
POST /api/v1/providers/:providerId/keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "keyName": "OpenAI主Key",
  "apiKey": "sk-xxx",
  "priority": 1,
  "weight": 1.0
}

Response 201:
{
  "success": true,
  "data": {
    "id": "xxx",
    "keyName": "OpenAI主Key",
    "enabled": true
  }
}
```

### 6.3 更新计费规则
```
PUT /api/v1/providers/:providerId/billing-rules
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "rules": [
    {
      "modelId": "xxx",
      "inputPrice": 0.03,
      "outputPrice": 0.06,
      "requestPrice": 0
    }
  ]
}

Response 200:
{ "success": true }
```

## 7. 用量统计接口

### 7.1 获取用量概览
```
GET /api/v1/usage/overview?period=day&startDate=2026-03-01&endDate=2026-03-05
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": {
    "totalTokens": 150000,
    "totalRequests": 500,
    "totalCost": 45.5,
    "byModel": [
      { "model": "gpt-4", "tokens": 100000, "requests": 300, "cost": 30.0 },
      { "model": "claude-3-opus", "tokens": 50000, "requests": 200, "cost": 15.5 }
    ],
    "byProvider": [
      { "provider": "openai", "tokens": 100000, "cost": 30.0 },
      { "provider": "anthropic", "tokens": 50000, "cost": 15.5 }
    ]
  }
}
```

### 7.2 获取用量趋势
```
GET /api/v1/usage/trends?period=7d&groupBy=day
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2026-03-01",
        "tokens": 20000,
        "requests": 80,
        "cost": 6.0
      },
      ...
    ]
  }
}
```

### 7.3 获取API Key详情
```
GET /api/v1/keys/:id/stats?period=7d
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": {
    "keyId": "xxx",
    "name": "生产环境Key",
    "totalTokens": 50000,
    "totalRequests": 200,
    "requests": [
      {
        "id": "xxx",
        "model": "gpt-4",
        "tokens": 100,
        "latency": 1200,
        "createdAt": "2026-03-04T12:00:00Z"
      }
    ]
  }
}
```

## 8. 套餐管理接口

### 8.1 创建套餐
```
POST /api/v1/quotas
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "name": "标准月套餐",
  "type": "monthly",
  "price": 29.99,
  "tokenLimit": 1000000,
  "requestLimit": 10000,
  "validFrom": "2026-03-01T00:00:00Z",
  "validUntil": "2026-03-31T23:59:59Z"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "xxx",
    "name": "标准月套餐",
    "usedTokens": 0,
    "tokenLimit": 1000000,
    "status": "active"
  }
}
```

### 8.2 获取套餐列表
```
GET /api/v1/quotas?status=active
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "标准月套餐",
      "type": "monthly",
      "price": 29.99,
      "tokenLimit": 1000000,
      "usedTokens": 500000,
      "status": "active",
      "validUntil": "2026-03-31T23:59:59Z"
    }
  ]
}
```

## 9. 告警接口

### 9.1 创建告警规则
```
POST /api/v1/alerts
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "type": "quota_exceeded",
  "severity": "warning",
  "threshold": { "percentage": 80 },
  "message": "配额使用超过80%"
}

Response 201:
{
  "success": true,
  "data": { "id": "xxx" }
}
```

### 9.2 获取告警列表
```
GET /api/v1/alerts?status=pending&limit=20
Authorization: Bearer <jwt_token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "type": "quota_exceeded",
      "severity": "warning",
      "message": "配额使用超过80%",
      "currentValue": { "used": 800000, "limit": 1000000, "percentage": 80 },
      "status": "pending",
      "createdAt": "2026-03-04T12:00:00Z"
    }
  ]
}
```

### 9.3 处理告警
```
PATCH /api/v1/alerts/:id/resolve
Authorization: Bearer <jwt_token>

Response 200:
{ "success": true }
```

## 10. 系统接口

### 10.1 健康检查
```
GET /health

Response 200:
{
  "status": "healthy",
  "timestamp": "2026-03-05T01:00:00Z",
  "version": "1.0.0"
}
```

### 10.2 统计数据聚合
```
POST /api/v1/admin/aggregate-stats
Authorization: Bearer <admin_token>

Request:
{
  "period": "2026-03-01",
  "models": true,
  "providers": true
}

Response 200:
{
  "success": true,
  "data": {
    "aggregated": true
  }
}
```

## 11. 限流策略

```typescript
// 限流规则
const rateLimits = {
  byApiKey: {
    window: 60 * 1000,      // 1分钟
    maxRequests: 100           // 100次
  },
  byUser: {
    window: 60 * 1000,      // 1分钟
    maxRequests: 500           // 500次
  },
  byIp: {
    window: 60 * 1000,      // 1分钟
    maxRequests: 1000          // 1000次
  }
};
```

## 12. 错误码定义

| Code | HTTP | Description |
|------|-------|-------------|
| AUTH_MISSING | 401 | 缺少认证信息 |
| AUTH_INVALID | 401 | 认证信息无效 |
| AUTH_EXPIRED | 401 | Token已过期 |
| KEY_NOT_FOUND | 404 | API Key不存在 |
| KEY_DISABLED | 403 | API Key已禁用 |
| KEY_QUOTA_EXCEEDED | 429 | 超过配额限制 |
| RATE_LIMIT_EXCEEDED | 429 | 超过限流限制 |
| MODEL_NOT_FOUND | 404 | 模型不存在 |
| PROVIDER_ERROR | 502 | 厂商API错误 |
| INTERNAL_ERROR | 500 | 内部服务器错误 |
