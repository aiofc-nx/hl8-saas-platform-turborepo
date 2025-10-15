# Fastify 安全增强任务清单

**特性**: libs/nestjs-fastify 安全增强  
**分支**: 002-fastify-security-enhance  
**日期**: 2025-10-12  
**规范**: [spec.md](./spec.md)  
**计划**: [plan.md](./plan.md)

---

## 项目概述

在完成 Isolation 和 Caching 模块后，进一步完善 `libs/nestjs-fastify` 库，通过添加速率限制、安全头配置、压缩中间件、Prometheus metrics 等功能，使其成为生产级别的 Fastify 企业基础设施库。

**预计工作量**: 6 天  
**总任务数**: 34  
**优先级**: M1（安全增强）> M2（性能优化）> M3（文档）

---

## Phase 0: 项目准备（1 天）

### T001: 更新 package.json 依赖 ✅

**文件**: `libs/nestjs-fastify/package.json`

**任务**:

1. 添加 `@fastify/helmet": "^12.0.1`
2. 添加 `@fastify/rate-limit": "^10.1.1`
3. 添加 `@fastify/compress": "^8.0.1`
4. 添加 `prom-client": "^15.1.3`
5. 添加 `ioredis": "^5.4.2`（可选）

**验收标准**:

- 所有依赖安装成功
- pnpm install 无错误

---

### T002: 创建目录结构

**任务**:

```
libs/nestjs-fastify/src/
├── security/
│   ├── rate-limit/
│   ├── helmet/
│   └── cors/
├── performance/
│   ├── compression/
│   └── metrics/
└── lifecycle/
```

**验收标准**:

- 目录结构创建完成

---

## Phase 1: 速率限制模块（2 天）

### T003: 定义速率限制配置类型 ✅

**文件**: `libs/nestjs-fastify/src/security/rate-limit/types/rate-limit-options.ts`

**任务**:

1. 定义 `RateLimitOptions` 接口
2. 定义 `RateLimitConfig` 配置类
3. 使用 class-validator 验证

**内容**:

```typescript
export interface RateLimitOptions {
  max: number; // 最大请求数
  timeWindow: number; // 时间窗口（毫秒）
  redis?: RedisClient; // 可选 Redis 客户端
  skipOnError?: boolean; // 错误时跳过限流
  keyGenerator?: (req: Request) => string; // 自定义键生成
}
```

**验收标准**:

- 类型定义完整
- TSDoc 注释完整
- 遵循宪章规范

---

### T004: 实现 RateLimitService ✅

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.service.ts`

**任务**:

1. 封装 @fastify/rate-limit
2. 支持多租户速率限制（集成 isolation-model）
3. Redis 存储支持
4. 性能监控

**业务规则**:

- 租户级别限流：每个租户独立计数
- 用户级别限流：每个用户独立计数
- IP 级别限流：同 IP 共享计数
- 超出限制返回 429 Too Many Requests

**验收标准**:

- 所有限流策略正确工作
- Redis 集成正确
- TSDoc 注释完整

---

### T005: 实现 @RateLimit 装饰器 ✅

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.decorator.ts`

**任务**:

1. 创建方法装饰器
2. 支持自定义限制
3. 元数据存储

**用法**:

```typescript
@Controller("users")
@RateLimit({ max: 1000, timeWindow: 60000 })
export class UserController {
  @Get()
  @RateLimit({ max: 100, timeWindow: 60000 })
  list() {}
}
```

**验收标准**:

- 装饰器正确工作
- 元数据正确存储

---

### T006: 实现 RateLimitGuard ✅

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.guard.ts`

**任务**:

1. 创建 NestJS Guard
2. 读取装饰器元数据
3. 执行限流检查
4. 返回 429 错误

**验收标准**:

- Guard 正确执行
- 超出限制返回 429

---

### T007: 实现 RateLimitModule ✅

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.module.ts`

**任务**:

1. 创建动态模块
2. forRoot() 静态方法
3. forRootAsync() 异步配置
4. 注册 providers 和 guards

**验收标准**:

- 模块正确配置
- 支持全局和局部限流

---

### T008: 单元测试 - RateLimitService

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.service.spec.ts`

**任务**:

1. 测试基础限流逻辑
2. 测试多租户限流
3. 测试 Redis 集成
4. 测试错误处理

**验收标准**:

- 覆盖率 ≥ 80%
- 所有测试通过

---

### T009: 单元测试 - RateLimitGuard

**文件**: `libs/nestjs-fastify/src/security/rate-limit/rate-limit.guard.spec.ts`

**任务**:

1. 测试 Guard 逻辑
2. 测试 429 响应
3. 测试多租户场景

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 2: 安全头模块（1 天）

### T010: 定义 Helmet 配置类型

**文件**: `libs/nestjs-fastify/src/security/helmet/types/helmet-options.ts`

**任务**:

1. 定义 `HelmetOptions` 接口
2. CSP 策略配置
3. HSTS 配置

**验收标准**:

- 类型定义完整

---

### T011: 实现 HelmetService

**文件**: `libs/nestjs-fastify/src/security/helmet/helmet.service.ts`

**任务**:

1. 封装 @fastify/helmet
2. 配置默认安全策略
3. 支持自定义策略

**默认配置**:

```typescript
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}
```

**验收标准**:

- 安全头正确设置
- TSDoc 注释完整

---

### T012: 实现 SecurityModule

**文件**: `libs/nestjs-fastify/src/security/helmet/security.module.ts`

**任务**:

1. 创建动态模块
2. 集成 HelmetService
3. forRoot() 配置

**验收标准**:

- 模块正确工作

---

### T013: 单元测试 - SecurityModule

**文件**: `libs/nestjs-fastify/src/security/helmet/security.module.spec.ts`

**任务**:

1. 测试安全头设置
2. 测试配置覆盖
3. 测试 CSP 策略

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 3: CORS 配置模块（0.5 天）

### T014: 定义 CORS 配置类型

**文件**: `libs/nestjs-fastify/src/security/cors/types/cors-options.ts`

**任务**:

1. 定义 `CorsOptions` 接口
2. 支持动态 origin 验证

**验收标准**:

- 类型定义完整

---

### T015: 实现 CorsModule

**文件**: `libs/nestjs-fastify/src/security/cors/cors.module.ts`

**任务**:

1. 封装 @fastify/cors
2. 支持多 origin 配置
3. 支持动态 origin 验证

**用法**:

```typescript
CorsModule.forRoot({
  origin: ["https://app.example.com", "https://admin.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
});
```

**验收标准**:

- CORS 正确配置
- 预检请求正确处理

---

### T016: 单元测试 - CorsModule

**文件**: `libs/nestjs-fastify/src/security/cors/cors.module.spec.ts`

**任务**:

1. 测试 CORS 头设置
2. 测试 origin 验证
3. 测试预检请求

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 4: 压缩中间件（0.5 天）

### T017: 定义压缩配置类型

**文件**: `libs/nestjs-fastify/src/performance/compression/types/compression-options.ts`

**任务**:

1. 定义 `CompressionOptions` 接口
2. 支持多种编码（gzip, deflate, br）

**验收标准**:

- 类型定义完整

---

### T018: 实现 CompressionModule

**文件**: `libs/nestjs-fastify/src/performance/compression/compression.module.ts`

**任务**:

1. 封装 @fastify/compress
2. 配置压缩阈值
3. 配置压缩级别

**默认配置**:

```typescript
{
  threshold: 1024,       // 1KB 以上才压缩
  level: 6,              // 压缩级别
  encodings: ['br', 'gzip', 'deflate'],
}
```

**验收标准**:

- 自动压缩响应
- 可配置阈值

---

### T019: 单元测试 - CompressionModule

**文件**: `libs/nestjs-fastify/src/performance/compression/compression.module.spec.ts`

**任务**:

1. 测试压缩功能
2. 测试配置选项
3. 测试性能影响

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 5: Prometheus Metrics 集成（1 天）

### T020: 定义 Metrics 配置类型

**文件**: `libs/nestjs-fastify/src/performance/metrics/types/metrics-options.ts`

**任务**:

1. 定义 `MetricsOptions` 接口
2. 支持自定义 labels
3. 支持租户级别指标

**验收标准**:

- 类型定义完整

---

### T021: 实现 PrometheusService

**文件**: `libs/nestjs-fastify/src/performance/metrics/prometheus.service.ts`

**任务**:

1. 集成 prom-client
2. 创建默认指标（HTTP 请求计数器、响应时间直方图、错误率）
3. 支持自定义指标

**指标**:

- `http_requests_total`: Counter（HTTP 请求总数）
- `http_request_duration_seconds`: Histogram（请求响应时间）
- `http_errors_total`: Counter（错误总数）
- 租户标签: `tenant_id`

**验收标准**:

- 指标正确收集
- Prometheus 格式输出

---

### T022: 实现 MetricsService

**文件**: `libs/nestjs-fastify/src/performance/metrics/metrics.service.ts`

**任务**:

1. 封装 PrometheusService
2. 提供业务指标收集方法
3. 支持多租户隔离

**验收标准**:

- 业务指标正确记录

---

### T023: 实现 MetricsController

**文件**: `libs/nestjs-fastify/src/performance/metrics/metrics.controller.ts`

**任务**:

1. 提供 `/metrics` 端点
2. 返回 Prometheus 格式数据

**验收标准**:

- `/metrics` 端点正确工作

---

### T024: 实现 MetricsModule

**文件**: `libs/nestjs-fastify/src/performance/metrics/metrics.module.ts`

**任务**:

1. 创建动态模块
2. 注册 providers 和 controller
3. forRoot() 配置

**验收标准**:

- 模块正确配置

---

### T025: 单元测试 - MetricsService

**文件**: `libs/nestjs-fastify/src/performance/metrics/metrics.service.spec.ts`

**任务**:

1. 测试指标收集
2. 测试多租户隔离
3. 测试自定义指标

**验收标准**:

- 覆盖率 ≥ 80%

---

### T026: 单元测试 - MetricsController

**文件**: `libs/nestjs-fastify/src/performance/metrics/metrics.controller.spec.ts`

**任务**:

1. 测试 `/metrics` 端点
2. 测试 Prometheus 格式输出

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 6: 优雅关闭（0.5 天）

### T027: 实现 GracefulShutdownService

**文件**: `libs/nestjs-fastify/src/lifecycle/graceful-shutdown.service.ts`

**任务**:

1. 监听 SIGTERM、SIGINT 信号
2. 停止接受新请求
3. 等待现有请求完成
4. 关闭所有连接

**业务规则**:

- 超时时间: 30 秒（可配置）
- 关闭顺序: 停止接受 -> 等待请求 -> 关闭连接 -> 退出进程

**验收标准**:

- 信号处理正确
- 优雅关闭正确执行

---

### T028: 单元测试 - GracefulShutdownService

**文件**: `libs/nestjs-fastify/src/lifecycle/graceful-shutdown.service.spec.ts`

**任务**:

1. 测试信号处理
2. 测试超时逻辑
3. 测试关闭顺序

**验收标准**:

- 覆盖率 ≥ 80%

---

## Phase 7: 集成测试（1 天）

### T029: 集成测试 - RateLimitModule

**文件**: `libs/nestjs-fastify/__tests__/integration/rate-limit.spec.ts`

**任务**:

1. 测试全局速率限制
2. 测试多租户速率限制
3. 测试 Redis 存储
4. 测试 429 响应

**验收标准**:

- 所有场景测试通过

---

### T030: 集成测试 - SecurityModule

**文件**: `libs/nestjs-fastify/__tests__/integration/security.spec.ts`

**任务**:

1. 测试安全头设置
2. 测试 CSP 策略
3. 测试 CORS

**验收标准**:

- 所有场景测试通过

---

### T031: 集成测试 - CompressionModule

**文件**: `libs/nestjs-fastify/__tests__/integration/compression.spec.ts`

**任务**:

1. 测试压缩功能
2. 测试性能影响

**验收标准**:

- 所有场景测试通过

---

### T032: 集成测试 - MetricsModule

**文件**: `libs/nestjs-fastify/__tests__/integration/metrics.spec.ts`

**任务**:

1. 测试指标收集
2. 测试 `/metrics` 端点
3. 测试多租户指标

**验收标准**:

- 所有场景测试通过

---

## Phase 8: 文档（1 天）

### T033: 创建文档

**文件**:

- `libs/nestjs-fastify/docs/SECURITY.md`
- `libs/nestjs-fastify/docs/PERFORMANCE.md`
- `libs/nestjs-fastify/docs/METRICS.md`
- `libs/nestjs-fastify/README.md`（更新）
- `libs/nestjs-fastify/CHANGELOG.md`（新增）

**任务**:

1. 编写安全模块文档
2. 编写性能优化文档
3. 编写 Metrics 文档
4. 更新 README
5. 创建 CHANGELOG

**验收标准**:

- 文档完整
- 示例清晰
- 中文注释

---

### T034: 更新导出文件

**文件**: `libs/nestjs-fastify/src/index.ts`

**任务**:

1. 导出所有新模块
2. 导出所有装饰器
3. 导出所有类型

**验收标准**:

- 导出完整
- TypeScript 类型正确

---

## 完成标准

### 必需（M1）

- ✅ 速率限制模块
- ✅ Helmet 安全头
- ✅ CORS 配置
- ✅ 测试覆盖率 ≥ 80%

### 应有（M2）

- ✅ 压缩中间件
- ✅ Prometheus metrics
- ✅ 优雅关闭
- ✅ 完整文档

---

**总任务数**: 34  
**预计时间**: 6 天  
**当前状态**: 准备开始
