# LLM API统一代理平台

> 统一代理、计费管理、用量监控、Web UI控制台

## 项目概述

这是一个完整的LLM API统一代理和管理平台，支持多厂商API聚合、用量监控、计费管理和Web UI控制台。

### 核心功能

- 🌐 **LLM API统一代理**：支持OpenAI、Anthropic、智谱、通义千问等多个厂商
- 📊 **用量监控与统计**：实时监控Token数、请求数、字节数，支持多维统计
- 💰 **API计费配置**：支持多厂商计费规则、自定义计费公式
- 📦 **套餐计费管理**：月付/年付/按量计费，套餐配额管理
- 🔑 **API Key分配**：为子用户/应用分配独立Key，支持配额限制
- 💾 **数据库存储**：SQLite（开发）/ PostgreSQL（生产）
- 🖥️ **Web UI**：仪表盘、配置管理、用量告警、统计报表

### 技术栈

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

## 项目状态

- [x] 需求分析
- [x] 架构设计
- [x] 数据库设计
- [x] API接口设计
- [x] UI原型设计
- [ ] 仓库初始化
- [ ] 项目结构搭建
- [ ] 后端开发
- [ ] 前端开发
- [ ] 集成测试
- [ ] 部署上线

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (可选)

### 安装

```bash
# 克隆仓库
git clone https://github.com/cctice/llm-api-proxy-platform.git
cd llm-api-proxy-platform

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
vim .env
```

## 文档

- [需求分析](./01-requirements.md)
- [架构设计](./02-architecture.md)
- [数据库设计](./03-database-design.md)
- [API接口设计](./04-api-design.md)
- [UI原型设计](./05-ui-design.md)

## 许可证

MIT License

## 作者

caycechen
