import { Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from '@hl8/config';
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  CompressionModule,
  MetricsModule,
} from '@hl8/nestjs-fastify';
import { CachingModule } from '@hl8/caching';
import { IsolationModule } from '@hl8/nestjs-isolation';
import { DatabaseModule } from '@hl8/database';
import { AppController } from './app.controller.js';
import { AppConfig } from './config/app.config.js';
import { UserModule } from './modules/user.module.js';
import { User } from './entities/user.entity.js';

/**
 * HL8 SAAS 平台应用根模块
 *
 * @description 配置全局模块、异常处理、日志系统、缓存、多租户数据隔离、
 * 速率限制、安全增强、性能监控等企业级基础设施功能
 *
 * ## 业务规则
 *
 * ### 配置管理规则
 * - 使用 TypedConfigModule (@hl8/config) 提供类型安全的配置管理
 * - 配置模块全局可用，无需重复导入
 * - 支持多环境配置文件 (.env.local, .env)
 * - 支持嵌套配置（使用 __ 分隔符）和变量扩展
 * - 完整的 TypeScript 类型支持和运行时验证
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
    // 配置模块 - 类型安全的配置管理
    TypedConfigModule.forRoot({
      schema: AppConfig,
      isGlobal: true,
      load: [
        dotenvLoader({
          separator: '__', // 支持嵌套配置：REDIS__HOST
          envFilePath: '.env', // 使用单个文件路径
          enableExpandVariables: true, // 支持 ${VAR} 语法
        }),
      ],
    }),

    // Fastify 专用异常处理模块（RFC7807 统一格式）
    // 注意：配置通过 AppConfig 类管理，在服务中可注入 AppConfig
    FastifyExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === 'production',
    }),

    // Fastify 专用日志模块（零开销，复用 Fastify Pino）
    // 注意：详细配置在 AppConfig.logging 中定义，可通过环境变量覆盖
    // 环境变量格式：LOGGING__LEVEL=info, LOGGING__PRETTY_PRINT=true
    FastifyLoggingModule.forRoot({
      config: {
        level: (process.env.LOGGING__LEVEL as any) || 'info',
        prettyPrint: process.env.NODE_ENV === 'development' || process.env.LOGGING__PRETTY_PRINT === 'true',
        includeIsolationContext: true,
        timestamp: true,
        enabled: true,
      },
    }),

    // 数据隔离模块 - 5 级隔离（平台/租户/组织/部门/用户）
    IsolationModule.forRoot(),

    // 注意：速率限制、Helmet、CORS 已在 EnterpriseFastifyAdapter 中配置
    // 详见 src/main.ts

    // 压缩模块 - 响应压缩
    CompressionModule.forRoot({
      global: true,
      threshold: 1024, // 1KB
      encodings: ['br', 'gzip', 'deflate'],
    }),

    // Prometheus Metrics 模块 - 性能监控
    // 注意：详细配置在 AppConfig.metrics 中定义，可通过环境变量覆盖
    // 环境变量格式：METRICS__PATH=/metrics, METRICS__INCLUDE_TENANT_METRICS=true
    MetricsModule.forRoot({
      defaultLabels: {
        app: 'fastify-api',
        environment: process.env.NODE_ENV || 'development',
      },
      includeTenantMetrics: true,
      path: process.env.METRICS__PATH || '/metrics',
      enableDefaultMetrics: true,
    }),

    // 缓存模块 - Redis 分布式缓存（使用类型安全配置）
    // 启用前需要确保 Redis 可用：docker run -d -p 6379:6379 redis:alpine
    // 配置通过 AppConfig.caching (CachingModuleConfig) 进行类型验证
    CachingModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => config.caching,
    }),

    // 数据库模块 - MikroORM 数据库连接管理（使用类型安全配置）
    // 启用前需要确保 PostgreSQL 可用：docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:alpine
    // 配置通过 AppConfig.database (DatabaseConfig) 进行类型验证
    DatabaseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        connection: config.database.getConnectionConfig(),
        pool: config.database.getPoolConfig(),
        // 注册实体
        entities: [User],
        // 开发环境启用调试
        debug: config.isDevelopment,
        // 显式指定 driver 选项
        driver: 'PostgreSqlDriver',
      }),
    }),

    // 用户模块 - 演示 database 模块的使用
    UserModule,
  ],
})
export class AppModule {}
