import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  CompressionModule,
  MetricsModule,
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
 * ### 响应压缩规则
 * - 支持 br、gzip、deflate 编码
 * - 压缩阈值：1KB
 * - 自动检测内容类型
 *
 * ### 性能监控规则
 * - Prometheus Metrics 收集
 * - HTTP 请求计数、响应时间、错误率
 * - 租户级别指标
 * - /metrics 端点暴露指标
 *
 * ### 注意事项
 * - 速率限制、Helmet、CORS 已在 EnterpriseFastifyAdapter 中配置（详见 src/main.ts）
 * - 本模块仅注册压缩和 Metrics 模块，避免重复配置
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

    // 注意：速率限制、Helmet、CORS 已在 EnterpriseFastifyAdapter 中配置
    // 详见 src/main.ts

    // 压缩模块和 Metrics 模块暂时禁用，待调试完成后启用
    // CompressionModule.forRoot({
    //   global: true,
    //   threshold: 1024, // 1KB
    //   encodings: ['br', 'gzip', 'deflate'],
    // }),

    // MetricsModule.forRoot({
    //   defaultLabels: {
    //     app: 'fastify-api',
    //     environment: process.env.NODE_ENV || 'development',
    //   },
    //   includeTenantMetrics: true,
    //   path: '/metrics',
    //   enableDefaultMetrics: true,
    // }),

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
