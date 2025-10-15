# 特性规范：libs/nestjs-fastify 性能和安全增强

**分支**: `001-hl8-nestjs-enhance`（续）  
**日期**: 2025-10-12  
**类型**: 库增强  
**优先级**: 中等

---

## 概述

在完成 Isolation 和 Caching 模块后，进一步完善 `libs/nestjs-fastify` 库，优化性能和增强安全机制，使其成为生产级别的 Fastify 企业基础设施库。

---

## 当前状态分析

### 已有功能

✅ **FastifyExceptionModule**: RFC7807 异常处理  
✅ **FastifyLoggingModule**: 零开销日志（复用 Fastify Pino）  
✅ **EnterpriseFastifyAdapter**: 企业级适配器  
✅ **HealthCheckService**: 健康检查服务  
✅ **PerformanceMonitorService**: 性能监控服务

### 缺失功能

❌ **速率限制**（Rate Limiting）  
❌ **安全头配置**（Helmet）  
❌ **CORS 配置**  
❌ **压缩中间件**  
❌ **请求验证和消毒**  
❌ **Prometheus Metrics 集成**  
❌ **优雅关闭机制**  
❌ **完整的文档**

---

## 功能需求

### FR1: 速率限制模块

**优先级**: 🔴 高  
**理由**: 防止 API 滥用，保护系统资源

**功能描述**:

- 基于 IP 的速率限制
- 基于租户的速率限制（集成 isolation-model）
- 基于用户的速率限制
- 支持不同端点不同限制
- 使用 Redis 存储计数器（可选）
- 超出限制时返回 429 Too Many Requests

**API 设计**:

```typescript
// 全局速率限制
RateLimitModule.forRoot({
  max: 100, // 最大请求数
  timeWindow: 60000, // 时间窗口（毫秒）
  redis: redisClient, // 可选：Redis 存储
});

// 装饰器用法
@Controller("users")
@RateLimit({ max: 1000, timeWindow: 60000 })
export class UserController {
  @Get()
  @RateLimit({ max: 100, timeWindow: 60000 })
  list() {}
}
```

---

### FR2: 安全头模块（Helmet）

**优先级**: 🔴 高  
**理由**: 防止常见的 Web 安全漏洞

**功能描述**:

- 集成 @fastify/helmet
- 配置 Content-Security-Policy
- 配置 X-Frame-Options
- 配置 HSTS
- 可自定义安全策略

**API 设计**:

```typescript
SecurityModule.forRoot({
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  },
});
```

---

### FR3: CORS 配置模块

**优先级**: 🟡 中  
**理由**: 支持前后端分离架构

**功能描述**:

- 灵活的 Origin 配置
- 支持动态 Origin 验证
- 支持凭证（Credentials）
- 预检请求优化

**API 设计**:

```typescript
CorsModule.forRoot({
  origin: ["https://app.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
});
```

---

### FR4: 压缩中间件

**优先级**: 🟡 中  
**理由**: 减少带宽，提升响应速度

**功能描述**:

- 支持 gzip、deflate、brotli
- 可配置压缩阈值
- 可配置压缩级别
- 自动内容类型检测

**API 设计**:

```typescript
CompressionModule.forRoot({
  threshold: 1024, // 1KB 以上才压缩
  level: 6, // 压缩级别
  encodings: ["br", "gzip", "deflate"],
});
```

---

### FR5: Prometheus Metrics 集成

**优先级**: 🟡 中  
**理由**: 生产环境可观测性

**功能描述**:

- HTTP 请求计数器
- 请求响应时间直方图
- 错误率统计
- 租户级别指标
- `/metrics` 端点

**API 设计**:

```typescript
MetricsModule.forRoot({
  defaultLabels: {
    app: "hl8-saas",
  },
  includeTenantMetrics: true,
});
```

---

### FR6: 请求验证和消毒

**优先级**: 🟢 低  
**理由**: 增强安全，但 class-validator 已提供基础功能

**功能描述**:

- HTML 转义
- SQL 注入防护
- XSS 防护
- 路径遍历防护

---

### FR7: 优雅关闭增强

**优先级**: 🟡 中  
**理由**: 生产环境稳定性

**功能描述**:

- 停止接受新请求
- 等待现有请求完成
- 关闭所有连接
- 可配置超时

---

## 非功能需求

### NFR1: 性能

- 速率限制开销 < 0.1ms
- 压缩不影响 p95 延迟 > 10%
- Metrics 收集开销 < 0.05ms
- 安全检查总开销 < 1ms

### NFR2: 安全

- 防止 OWASP Top 10 攻击
- 默认启用安全配置
- 敏感信息脱敏
- 支持安全审计

### NFR3: 可维护性

- TypeScript strict mode
- 完整 TSDoc 注释
- 单元测试覆盖率 ≥ 80%
- 集成测试覆盖核心场景

---

## 技术约束

### 必需依赖

```json
{
  "@fastify/helmet": "^12.0.0",
  "@fastify/rate-limit": "^10.0.0",
  "@fastify/compress": "^8.0.0",
  "@fastify/cors": "^10.1.0",
  "prom-client": "^15.0.0"
}
```

### 架构约束

- 遵循 Clean Architecture
- 模块化设计
- 配置优先
- 零侵入集成

---

## 成功标准

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

## 里程碑

### M1: 安全增强（3天）

- 速率限制模块
- Helmet 集成
- CORS 配置
- 请求验证

### M2: 性能优化（2天）

- 压缩中间件
- Metrics 集成
- 性能分析

### M3: 文档和发布（1天）

- API 文档
- 最佳实践
- 迁移指南

---

**总预计时间**: 6 天  
**更新日期**: 2025-10-12
