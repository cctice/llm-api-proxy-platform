# LLM API 统一代理平台

> 统一代理、计费管理、用量监控、Web UI控制台

## 📋 项目概述

这是一个完整的LLM API统一代理和管理平台，支持多厂商API聚合、用量监控、计费管理和Web UI控制台。

### ✨ 核心功能

- 🌐 **LLM API统一代理**：支持OpenAI、Anthropic、智谱、通义千问等多个厂商
- 📊 **用量监控与统计**：实时监控Token数、请求数、字节数，支持多维统计
- 💰 **API计费配置**：支持多厂商计费规则、自定义计费公式
- 📦 **套餐计费管理**：月付/年付/按量计费，套餐配额管理
- 🔑 **API Key分配**：为子用户/应用分配独立Key，支持配额限制
- 💾 **数据库存储**：SQLite（开发）/ PostgreSQL（生产）
- 🖥️ **Web UI**：仪表盘、配置管理、用量告警、统计报表

### 🛠 技术栈

**后端**
- Node.js 20+ + TypeScript
- Express + Prisma ORM
- SQLite (开发) / PostgreSQL 15+ (生产)
- Redis 7+ (缓存)
- JWT + bcrypt (认证)

**前端**
- React 18 + Vite
- shadcn/ui + Tailwind CSS
- Recharts (图表)
- Zustand (状态管理)

**部署**
- Docker + Docker Compose
- Nginx (反向代理)

## 🚀 快速开始

### 环境要求

- Node.js 20+
- npm 10+

### 一键启动（推荐）

```bash
# 克隆仓库
git clone https://github.com/cctice/llm-api-proxy-platform.git
cd llm-api-proxy-platform

# 一键启动（自动安装依赖并启动服务）
./start.sh
```

### 手动启动

#### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install
cd ..

# 安装前端依赖
cd client
npm install
cd ..
```

#### 2. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
cd ..
```

#### 3. 初始化数据库

```bash
cd server

# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 填充种子数据
npm run seed

cd ..
```

#### 4. 启动服务

**启动后端服务器：**
```bash
cd server
npm run dev
# 后端运行在 http://localhost:3000
```

**启动前端服务器（新终端）：**
```bash
cd client
npm run dev
# 前端运行在 http://localhost:5173
```

## 🧪 测试

运行测试脚本验证所有功能：

```bash
./test.sh
```

## 📱 使用指南

### 测试账户

系统已预置以下测试账户：

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@example.com | admin123 | 管理员 |
| test@example.com | test123 | 普通用户 |

### API 使用示例

#### 1. 登录获取 Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

#### 2. 创建 API Key

```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My App Key"}'
```

#### 3. 获取模型列表

```bash
curl http://localhost:3000/api/v1/proxy/models \
  -H "Authorization: Bearer YOUR_API_KEY_SECRET"
```

#### 4. 调用 LLM API

```bash
curl -X POST http://localhost:3000/api/v1/proxy/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_SECRET" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Web UI 使用

1. 访问 http://localhost:5173
2. 使用测试账户登录
3. 在仪表盘查看用量统计
4. 在 API Keys 页面管理您的 API 密钥
5. 在设置页面查看账户信息

## 📊 支持的模型

### OpenAI
- GPT-4
- GPT-4 Turbo
- GPT-3.5 Turbo

### Anthropic
- Claude 3 Opus
- Claude 3 Sonnet

### 智谱AI
- GLM-4

### 通义千问
- Qwen Turbo
- Qwen Plus

## 📁 项目结构

```
llm-api-proxy-platform/
├── server/              # 后端服务
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── routes/      # 路由
│   │   ├── services/    # 业务逻辑
│   │   └── utils/       # 工具函数
│   ├── prisma/          # 数据库模型
│   └── package.json
├── client/              # 前端应用
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API 服务
│   │   ├── store/       # 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── docker-compose.yml   # Docker 配置
├── start.sh            # 一键启动脚本
└── test.sh             # 测试脚本
```

## 🔧 配置说明

### 环境变量（server/.env）

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 服务器
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis（可选，用于缓存）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173

# 加密（用于存储 API Keys）
ENCRYPTION_KEY=your-32-character-encryption-key
```

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独部署后端

```bash
cd server
docker build -t llm-proxy-server .
docker run -p 3000:3000 --env-file .env llm-proxy-server
```

## 📈 开发计划

- [x] 基础架构搭建
- [x] 用户认证系统
- [x] API Key 管理
- [x] LLM 代理服务
- [x] 用量统计
- [ ] 实时用量监控
- [ ] 告警系统
- [ ] 多租户支持
- [ ] 数据导出
- [ ] API 文档
- [ ] 性能优化

## 📄 许可证

MIT License

## 👨‍💻 作者

caycechen

## 🙏 致谢

感谢以下开源项目：
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
