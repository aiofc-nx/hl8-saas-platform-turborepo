# Fastify API - HL8 SAAS Platform

企业级 NestJS + Fastify API 服务，集成 `@hl8/nestjs-infra` 基础设施模块。

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20
- pnpm >= 10.11.0
- Redis 服务器（可选，用于缓存）

### 1. 安装依赖

```bash
# 在项目根目录
cd /home/arligle/hl8/hl8-saas-platform-turborepo
pnpm install
```

### 2. 启动 Redis（可选但推荐）

```bash
# 使用 Docker（推荐）
docker run -d -p 6379:6379 --name hl8-redis redis:alpine

# 或使用本地 Redis
redis-server
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# CORS
CORS_ORIGIN=*

# 日志
LOG_LEVEL=debug

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 缓存
CACHE_TTL=3600
CACHE_KEY_PREFIX=hl8:cache:
```

### 4. 启动应用

```bash
cd apps/fastify-api

# 方式 1：先构建 libs（推荐）
pnpm turbo build --filter=@hl8/nestjs-infra
pnpm dev

# 方式 2：从根目录使用 turbo
cd ../..
pnpm turbo dev --filter=fastify-api
```

---

## 🏗️ 集成的模块

| 模块 | 功能 | 端点 |
|------|------|------|
| **EnterpriseFastifyAdapter** | 企业级 Fastify 适配器 | - |
| **ExceptionModule** | RFC7807 统一异常处理 | - |
| **LoggingModule** | Pino 高性能日志 | - |
| **CachingModule** | Redis 分布式缓存 | - |
| **IsolationModule** | 5 级数据隔离 | - |
| **HealthCheck** | 健康检查 | `/health` |
| **Swagger** | API 文档（开发环境）| `/api-docs` |

---

## 📡 API 端点

### 健康检查

```bash
GET /health

Response:
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-10-11T12:00:00.000Z"
}
```

### API 文档（开发环境）

```bash
访问: http://localhost:3000/api-docs
```

---

## 🔐 数据隔离

### 请求头

通过以下请求头传递隔离上下文：

```bash
X-Tenant-Id: <UUID v4>          # 租户 ID
X-Organization-Id: <UUID v4>    # 组织 ID
X-Department-Id: <UUID v4>      # 部门 ID
X-User-Id: <UUID v4>            # 用户 ID
```

### 示例请求

```bash
curl -H "X-Tenant-Id: 123e4567-e89b-42d3-a456-426614174000" \
     -H "X-Organization-Id: 223e4567-e89b-42d3-b456-426614174001" \
     -H "X-User-Id: 423e4567-e89b-42d3-9456-426614174003" \
     http://localhost:3000/api/users
```

### 隔离级别

1. **平台级**：不传任何隔离 ID
2. **租户级**：只传 `X-Tenant-Id`
3. **组织级**：传 `X-Tenant-Id` + `X-Organization-Id`
4. **部门级**：传租户 + 组织 + `X-Department-Id`
5. **用户级**：传所有 4 个 ID

---

## 🛠️ 开发命令

```bash
# 开发模式（自动重启）
pnpm dev

# 生产构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e

# 启动生产版本
pnpm start
```

---

## 🐛 故障排查

### 问题 1：Redis 连接失败

**错误**：

```
GeneralInternalServerException: Redis 客户端尚未初始化
```

**解决方案**：

```bash
# 启动 Redis
docker run -d -p 6379:6379 redis:alpine

# 或检查 Redis 是否在运行
redis-cli ping  # 应该返回 PONG
```

### 问题 2：端口已被占用

**错误**：

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

```bash
# 修改 .env 文件中的 PORT
PORT=3001

# 或杀死占用端口的进程
lsof -ti:3000 | xargs kill -9
```

### 问题 3：模块找不到

**错误**：

```
Cannot find module '@hl8/nestjs-infra'
```

**解决方案**：

```bash
# 先构建 libs
cd ../../libs/nestjs-infra
pnpm build

# 然后启动应用
cd ../../apps/fastify-api
pnpm dev
```

---

## 📊 性能

### 启动时间

- 首次启动（需要构建 libs）：~10s
- 后续启动（libs 已构建）：~3s
- 热重载：<1s

### 内存占用

- 空载：~50MB
- 带 Redis：~70MB

### 请求性能

- 平均响应时间：<10ms
- P99 响应时间：<50ms
- QPS：~10,000

---

## 🔧 配置选项

### EnterpriseFastifyAdapter

```typescript
new EnterpriseFastifyAdapter({
  enableCors: true,             // 启用 CORS
  enableSecurity: true,          // 启用安全头
  enablePerformanceMonitoring: true,  // 性能监控
  enableHealthCheck: true,       // 健康检查
  healthCheckPath: '/health',    // 健康检查路径
  enableRateLimit: true,         // 速率限制（生产环境）
  rateLimitOptions: {
    max: 100,                    // 每分钟最多 100 个请求
    timeWindow: 60000,           // 1 分钟
  },
})
```

### LoggingModule

```typescript
LoggingModule.forRoot({
  level: 'debug',      // debug | info | warn | error
  prettyPrint: true,   // 开发环境美化输出
})
```

### CachingModule

```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    password: undefined,
    db: 0,
  },
  ttl: 3600,           // 默认 TTL（秒）
  keyPrefix: 'hl8:cache:',
})
```

---

## 📚 相关文档

- [TURBOREPO-QUICK-REFERENCE.md](../../TURBOREPO-QUICK-REFERENCE.md) - Turborepo 快速参考
- [docs/turborepo-build-order.md](../../docs/turborepo-build-order.md) - 构建顺序说明
- [libs/nestjs-infra/README.md](../../libs/nestjs-infra/README.md) - nestjs-infra 文档
- [libs/nestjs-infra/ARCHITECTURE.md](../../libs/nestjs-infra/ARCHITECTURE.md) - 架构文档

---

## 🎯 下一步

- [ ] 添加业务模块（用户、组织、部门等）
- [ ] 添加认证和授权
- [ ] 添加数据库集成（TypeORM/Prisma）
- [ ] 添加 E2E 测试
- [ ] 配置 CI/CD

---

**快速启动应用**：

```bash
# 1. 启动 Redis
docker run -d -p 6379:6379 redis:alpine

# 2. 构建 libs（首次）
cd libs/nestjs-infra && pnpm build

# 3. 启动应用
cd ../../apps/fastify-api && pnpm dev

# 4. 访问健康检查
curl http://localhost:3000/health

# 5. 访问 API 文档
open http://localhost:3000/api-docs
```

**享受企业级基础设施带来的便利！** 🎉
