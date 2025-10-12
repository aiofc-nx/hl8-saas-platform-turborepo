import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  RateLimitModule,
  SecurityModule,
  CorsModule,
  CompressionModule,
  MetricsModule,
  DEFAULT_FASTIFY_MODULES_CONFIG,
} from '@hl8/nestjs-fastify';
import {
  CachingModule,
  IsolationModule,
  CachingModuleConfig,
} from '@hl8/nestjs-infra';
import { plainToInstance } from 'class-transformer';
import { AppController } from './app.controller.js';

/**
 * HL8 SAAS 平台应用根模块
 *
 * @description 配置全局模块、异常处理、日志系统、缓存、多租户数据隔离、
 * 速率限制、安全增强、性能监控等企业级基础设施功能
 *
 * ## 业务规则
 *
 * ### 配置管理规则
 * - 使用 ConfigModule 管理环境变量配置
 * - 配置模块全局可用，无需重复导入
 * - 支持多环境配置文件 (.env.local, .env)
 *
 * ### 异常处理规则
 * - 统一异常响应格式（RFC7807）
 * - 自动捕获所有 HTTP 异常和未知异常
 * - 生产环境隐藏敏感错误信息
 * - 支持国际化错误消息
 *
 * ### 日志管理规则
 * - 使用 Pino 提供高性能日志记录
 * - 开发环境启用美化输出
 * - 生产环境使用 JSON 格式输出
 * - 自动包含隔离上下文（租户、组织、部门、用户）
 *
 * ### 数据隔离规则
 * - 支持 5 级数据隔离：平台、租户、组织、部门、用户
 * - 使用 nestjs-cls 自动传播隔离上下文
 * - 从请求头自动提取隔离标识
 * - 支持数据共享控制（isShared, sharingLevel）
 *
 * ### 速率限制规则
 * - 租户级别限流（每个租户独立计数）
 * - 默认限制：1000 次/分钟
 * - 超限返回 429 Too Many Requests
 * - 响应头包含限流信息
 *
 * ### 安全增强规则
 * - Helmet 安全头（CSP、HSTS、X-Frame-Options）
 * - CORS 跨域配置（支持凭证）
 * - 响应压缩（br、gzip、deflate）
 * - 防止 XSS、点击劫持等攻击
 *
 * ### 性能监控规则
 * - Prometheus Metrics 收集
 * - HTTP 请求计数、响应时间、错误率
 * - 租户级别指标
 * - /metrics 端点暴露指标
 *
 * ### 缓存管理规则
 * - 使用 Redis 作为分布式缓存（可选）
 * - 支持 5 级数据隔离
 * - 自动序列化/反序列化复杂对象
 * - 支持 TTL 和缓存键前缀
 */
@Module({
  controllers: [AppController],
  providers: [],
  imports: [
    // 配置模块 - 全局可用
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Fastify 专用异常处理模块（RFC7807 统一格式）
    FastifyExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === 'production',
    }),

    // Fastify 专用日志模块（零开销，复用 Fastify Pino）
    FastifyLoggingModule.forRoot({
      config: {
        level: (process.env.LOG_LEVEL as any) || 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
        includeIsolationContext: true,
        timestamp: true,
        enabled: true,
      },
    }),

    // 数据隔离模块 - 5 级隔离（平台/租户/组织/部门/用户）
    IsolationModule.forRoot(),

    // 速率限制模块 - 防止 API 滥用
    // 使用统一配置: DEFAULT_FASTIFY_MODULES_CONFIG.rateLimit
    RateLimitModule.forRoot({
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
      timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 分钟
      strategy: 'tenant', // 租户级别限流
      skipOnError: true, // Redis 错误时降级
    }),

    // 安全头模块 - Helmet
    // 使用统一配置: DEFAULT_FASTIFY_MODULES_CONFIG.helmet
    SecurityModule.forRoot(),

    // CORS 模块
    // 使用统一配置: DEFAULT_FASTIFY_MODULES_CONFIG.cors
    CorsModule.forRoot({
      origin: true, // 允许所有 origin（开发环境）
      credentials: true,
    }),

    // 压缩模块
    // 使用统一配置: DEFAULT_FASTIFY_MODULES_CONFIG.compression
    CompressionModule.forRoot(),

    // Prometheus Metrics 模块
    // 使用统一配置: DEFAULT_FASTIFY_MODULES_CONFIG.metrics
    MetricsModule.forRoot({
      defaultLabels: {
        app: 'fastify-api',
        environment: process.env.NODE_ENV || 'development',
      },
      includeTenantMetrics: true,
    }),

    // 缓存模块 - Redis 分布式缓存（可选）
    // 启用前需要确保 Redis 可用：docker run -d -p 6379:6379 redis:alpine
    // CachingModule.forRoot(
    //   plainToInstance(CachingModuleConfig, {
    //     redis: {
    //       host: process.env.REDIS_HOST || 'localhost',
    //       port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //       password: process.env.REDIS_PASSWORD,
    //       db: parseInt(process.env.REDIS_DB || '0', 10),
    //     },
    //     ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    //     keyPrefix: process.env.CACHE_KEY_PREFIX || 'hl8:cache:',
    //   }),
    // ),
  ],
})
export class AppModule {}
