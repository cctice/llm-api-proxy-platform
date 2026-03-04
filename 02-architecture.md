# LLM API统一代理平台 - 架构设计

## 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web UI (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 仪表盘   │  │配置管理  │  │Key管理  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                  API Gateway (Express)                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ 认证中间件   │  │限流中间件   │               │
│  └──────────────┘  └──────────────┘               │
└──────────┬────────────────────────────────┬───────────────┘
           │                                │
    ┌──────▼──────┐              ┌───────▼────────┐
    │  代理服务    │              │  统计服务      │
    │             │              │               │
    │ ┌─────────┐│              │ ┌───────────┐ │
    │ │路由引擎  ││              │ │实时聚合   │ │
    │ └─────────┘│              │ └───────────┘ │
    └──────┬─────┘              └───────┬───────┘
           │                             │
    ┌──────▼─────────────────────────────▼────────┐
    │           Database (Prisma)              │
    │  ┌──────────────┐  ┌──────────────┐ │
    │  │  PostgreSQL  │  │   Redis     │ │
    │  │   主数据库   │  │   缓存      │ │
    │  └──────────────┘  └──────────────┘ │
    └──────────────────────────────────────┘
           │
    ┌──────▼─────────────────────────────────┐
    │      LLM Providers                   │
    │  OpenAI | Anthropic | 智谱 | Qwen │
    └────────────────────────────────────────┘
```

## 2. 核心模块设计

### 2.1 API Gateway
**职责**：统一入口、请求路由、认证授权

```typescript
// 核心组件
- AuthMiddleware: JWT认证、API Key验证
- RateLimiter: 限流控制
- RequestLogger: 请求日志记录
- ProxyHandler: API转发处理
```

### 2.2 Proxy Service（代理服务）
**职责**：LLM API转发、负载均衡、错误重试

```typescript
// 核心组件
- Router: 模型路由（按模型名映射到不同厂商）
- LoadBalancer: 多Key负载均衡
- Retryer: 失败重试
- Transformer: 请求/响应格式转换
```

### 2.3 Billing Service（计费服务）
**职责**：计费计算、套餐管理

```typescript
// 核心组件
- TokenCounter: Token计数（支持多厂商格式）
- BillingCalculator: 费用计算
- PackageManager: 套餐管理
- UsageTracker: 用量追踪
```

### 2.4 Statistics Service（统计服务）
**职责**：数据聚合、实时统计

```typescript
// 核心组件
- RealtimeAggregator: 实时用量聚合
- TrendAnalyzer: 趋势分析
- AlertChecker: 告警检查
```

### 2.5 Admin Service（管理服务）
**职责**：配置管理、Key分配

```typescript
// 核心组件
- ConfigManager: 模型配置
- KeyGenerator: API Key生成
- QuotaManager: 配额管理
```

## 3. 数据流设计

### 3.1 请求流程
```
Client Request
  ↓
API Gateway (验证、限流)
  ↓
Proxy Service (路由到厂商API)
  ↓
LLM Provider
  ↓
Proxy Service (计费、统计)
  ↓
Statistics Service (聚合)
  ↓
Database (存储)
  ↓
Client Response
```

### 3.2 配置更新流程
```
Web UI (用户操作)
  ↓
Admin Service (验证、处理)
  ↓
Database (持久化)
  ↓
Proxy Service (热加载配置)
  ↓
生效
```

## 4. 扩展性设计

### 4.1 插件化LLM Provider
```typescript
interface LLMProvider {
  name: string;
  endpoint: string;
  authenticate(apiKey: string): boolean;
  countTokens(text: string, model: string): number;
  formatRequest(request: any): any;
  formatResponse(response: any): any;
}

// 支持动态添加新厂商
const providers = new Map<string, LLMProvider>();
providers.set('openai', new OpenAIProvider());
providers.set('anthropic', new AnthropicProvider());
```

### 4.2 插件化计费规则
```typescript
interface BillingRule {
  model: string;
  inputPrice: number;  // per 1K tokens
  outputPrice: number; // per 1K tokens
  requestPrice?: number; // per request
}

// 灵活配置计费
const rules = [
  { model: 'gpt-4', inputPrice: 0.03, outputPrice: 0.06 },
  { model: 'claude-3-opus', inputPrice: 0.015, outputPrice: 0.075 },
];
```

## 5. 技术栈确认

### 后端
- **运行时**：Node.js 20+
- **语言**：TypeScript
- **框架**：Express
- **ORM**：Prisma
- **数据库**：PostgreSQL 15+ (生产) / SQLite (开发)
- **缓存**：Redis 7+
- **认证**：jsonwebtoken + bcrypt
- **日志**：pino

### 前端
- **框架**：React 18 + Vite
- **语言**：TypeScript
- **UI库**：shadcn/ui + Tailwind CSS
- **图表**：Recharts
- **状态管理**：Zustand
- **HTTP客户端**：axios + SWR
- **路由**：React Router v6

### DevOps
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions
- **监控**：健康检查端点 + 日志聚合

## 6. 安全考虑

1. **API Key安全**
   - 数据库加密存储
   - 传输TLS加密
   - 敏感字段脱敏

2. **访问控制**
   - JWT认证
   - RBAC权限控制
   - API Key白名单

3. **限流保护**
   - 按Key限流
   - 按用户限流
   - DDoS防护
