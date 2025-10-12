# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-10-12

### Added

#### 速率限制模块
- 多策略支持（IP、租户、用户、自定义）
- Redis 和内存双存储
- `@RateLimit`、`@RateLimitByIp`、`@RateLimitByTenant`、`@RateLimitByUser` 装饰器
- `RateLimitService`、`RateLimitGuard`、`RateLimitModule`
- 自动降级和错误处理
- 标准 RFC 6585 响应头

#### 安全头模块
- `SecurityModule` 集成 @fastify/helmet
- 默认 CSP 策略
- HSTS、X-Frame-Options 等安全头
- 可自定义安全策略

#### CORS 配置模块
- `CorsModule` 集成 @fastify/cors
- 支持多 Origin 配置
- 支持凭证和自定义请求头
- 暴露限流响应头

#### 压缩中间件
- `CompressionModule` 集成 @fastify/compress
- 支持 brotli、gzip、deflate
- 可配置压缩阈值和级别

#### Prometheus Metrics
- `MetricsModule`、`MetricsService`、`PrometheusService`
- HTTP 请求计数器
- 响应时间直方图
- 错误率统计
- 租户级别指标
- `/metrics` 端点

### Changed
- 更新主导出文件 `src/index.ts`
- 更新 README.md
- 新增 CHANGELOG.md

### Dependencies
- 新增 `@fastify/helmet` ^12.0.1
- 新增 `@fastify/rate-limit` ^10.1.1
- 新增 `@fastify/compress` ^8.0.1
- 新增 `prom-client` ^15.1.3
- 新增 `ioredis` ^5.4.2

## [0.1.0] - 2025-10-10

### Added
- 初始版本
- Fastify 企业级适配器
- 异常处理模块
- 日志模块

