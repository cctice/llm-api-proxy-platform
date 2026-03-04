# LLM API统一代理平台 - 数据库设计

## 1. 数据库选型

**开发环境**：SQLite
**生产环境**：PostgreSQL
**ORM**：Prisma

## 2. 核心表设计

### 2.1 users（用户表）
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // bcrypt加密
  name          String?
  role          String   @default("user") // admin/user
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  apiKeys       ApiKey[]
  quotas        Quota[]
  alerts        Alert[]
}
```

### 2.2 api_providers（API提供商表）
```prisma
model ApiProvider {
  id            String   @id @default(cuid())
  name          String   @unique // openai, anthropic, zhipu, qwen
  displayName   String   // OpenAI, Anthropic, 智谱AI
  endpoint      String   // https://api.openai.com/v1
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  models        Model[]
  billingRules  BillingRule[]
  providerKeys  ProviderKey[]
}
```

### 2.3 models（模型表）
```prisma
model Model {
  id            String   @id @default(cuid())
  providerId     String
  provider       ApiProvider @relation(fields: [providerId], references: [id])
  name          String   // gpt-4, claude-3-opus
  displayName   String   // GPT-4, Claude 3 Opus
  type          String   // chat/completion/embedding
  contextWindow Int      // 上下文窗口大小
  maxTokens     Int      // 最大输出tokens
  enabled       Boolean  @default(true)

  provider      ApiProvider @relation("models", fields: [providerId], references: [id])
  billingRules  BillingRule[]
  requests      Request[]
}
```

### 2.4 billing_rules（计费规则表）
```prisma
model BillingRule {
  id            String   @id @default(cuid())
  providerId     String
  modelId       String?
  provider       ApiProvider @relation(fields: [providerId], references: [id])
  model         Model?     @relation("billingRules", fields: [modelId], references: [id])

  inputPrice    Float    // 每1K输入tokens价格（美元）
  outputPrice   Float    // 每1K输出tokens价格（美元）
  requestPrice  Float?   // 每次请求价格（美元）
  currency      String   @default("USD")

  validFrom     DateTime @default(now())
  validUntil    DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([providerId, modelId])
}
```

### 2.5 provider_keys（厂商API密钥表）
```prisma
model ProviderKey {
  id            String   @id @default(cuid())
  providerId     String
  provider       ApiProvider @relation(fields: [providerId], references: [id])
  keyName       String
  apiKey        String   // 加密存储
  enabled       Boolean  @default(true)
  priority      Int      @default(0) // 负载均衡优先级

  weight         Float?   @default(1.0) // 权重

  requestCount  Int      @default(0)
  lastUsedAt    DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([providerId, enabled, priority])
}
```

### 2.6 api_keys（用户分配的API Key表）
```prisma
model ApiKey {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  keyPrefix     String   @unique // sk-proj_xxxx
  keySecret     String   // 完整密钥（加密）
  name          String?   // 自定义名称
  description   String?

  // 配额限制
  maxTokens     Int?      // 最大tokens数
  maxRequests   Int?      // 最大请求数
  expiresAt     DateTime?  // 过期时间

  // 统计
  totalTokens   Int       @default(0)
  totalRequests Int       @default(0)
  lastUsedAt    DateTime?

  enabled       Boolean   @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  requests      Request[]

  @@index([userId, enabled])
  @@index([keyPrefix])
}
```

### 2.7 quotas（套餐表）
```prisma
model Quota {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  name          String
  type          String   // monthly/yearly/ondemand
  price         Float    // 套餐价格（美元）

  // 配额配置
  tokenLimit    Int?     // Token数限制
  requestLimit  Int?     // 请求数限制

  // 时间范围
  validFrom     DateTime @default(now())
  validUntil    DateTime?

  // 当前使用
  usedTokens    Int      @default(0)
  usedRequests  Int      @default(0)

  status        String   @default("active") // active/suspended/expired

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, status, validUntil])
}
```

### 2.8 requests（请求记录表）
```prisma
model Request {
  id            String   @id @default(cuid())
  userId        String?
  user          User?     @relation(fields: [userId], references: [id])

  apiKeyId      String?
  apiKey        ApiKey?   @relation(fields: [apiKeyId], references: [id])

  modelId       String
  model         Model     @relation(fields: [modelId], references: [id])

  providerId    String

  // 请求详情
  promptTokens  Int       @default(0)
  completionTokens Int    @default(0)
  totalTokens   Int       @default(0)

  // 计费
  inputCost     Float?
  outputCost    Float?
  totalCost     Float?

  // 元数据
  latency       Int?      // 响应时间(ms)
  statusCode    Int?      // HTTP状态码
  errorMessage  String?

  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([apiKeyId, createdAt])
  @@index([modelId, createdAt])
  @@index([createdAt]) // 用于定期清理
}
```

### 2.9 alerts（告警表）
```prisma
model Alert {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  type          String   // quota_exceeded/high_usage/anomaly
  severity      String   // info/warning/critical
  message       String

  // 阈值
  threshold     Json?

  // 当前值
  currentValue  Json?

  // 处理状态
  status        String   @default("pending") // pending/resolved/dismissed

  resolvedAt    DateTime?

  createdAt     DateTime @default(now())

  @@index([userId, status, createdAt])
}
```

### 2.10 usage_stats（用量统计表）
```prisma
model UsageStat {
  id            String   @id @default(cuid())

  // 时间维度
  period        String   // hour/day/week/month
  periodStart   DateTime
  periodEnd     DateTime

  // 统计维度
  userId        String?   // 按用户
  apiKeyId      String?   // 按API Key
  modelId       String?   // 按模型
  providerId    String?   // 按厂商

  // 聚合指标
  totalRequests Int       @default(0)
  totalTokens   Int       @default(0)
  inputTokens   Int       @default(0)
  outputTokens  Int       @default(0)
  totalCost     Float     @default(0)

  // 次数
  successCount  Int       @default(0)
  errorCount    Int       @default(0)

  createdAt     DateTime @default(now())

  @@unique([period, periodStart, userId, apiKeyId, modelId, providerId])
  @@index([period, periodStart])
}
```

## 3. 索引优化

```sql
-- 高频查询优化
CREATE INDEX idx_requests_user_time ON requests(user_id, created_at DESC);
CREATE INDEX idx_requests_key_time ON requests(api_key_id, created_at DESC);
CREATE INDEX idx_requests_model_time ON requests(model_id, created_at DESC);

-- 实时统计优化
CREATE INDEX idx_usage_period ON usage_stats(period, period_start);
```

## 4. 数据清理策略

```typescript
// 定期清理历史数据
const RETENTION_DAYS = 90; // 保留90天

await prisma.request.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
    }
  }
});
```

## 5. 数据迁移计划

Phase 1: 基础表
- users, api_providers, models, api_keys, requests

Phase 2: 计费表
- billing_rules, provider_keys

Phase 3: 统计表
- usage_stats, alerts, quotas
