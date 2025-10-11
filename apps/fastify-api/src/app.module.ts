import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  // ExceptionModule,  // TODO: 暂时禁用，调试启动问题
  // LoggingModule,
  // CachingModule,  // TODO: 启用前需要 Redis 服务器
  // IsolationModule,
  // LoggingModuleConfig,
  // CachingModuleConfig,
  // RedisConfig,
} from '@hl8/nestjs-infra';
// import { plainToInstance } from 'class-transformer';
import { AppController } from './app.controller.js';

/**
 * HL8 SAAS 平台应用根模块
 *
 * @description 配置全局模块、异常处理、日志系统、缓存、多租户数据隔离
 * 使用 @hl8/nestjs-infra 提供企业级基础设施功能
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
 * ### 缓存管理规则
 * - 使用 Redis 作为分布式缓存
 * - 支持 5 级数据隔离（平台、租户、组织、部门、用户）
 * - 自动序列化/反序列化复杂对象
 * - 支持 TTL 和缓存键前缀
 *
 * ### 数据隔离规则
 * - 支持 5 级数据隔离：平台、租户、组织、部门、用户
 * - 使用 nestjs-cls 自动传播隔离上下文
 * - 从请求头自动提取隔离标识
 * - 支持数据共享控制（isShared, sharingLevel）
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

    // TODO: 暂时禁用所有 nestjs-infra 模块，逐步启用调试
    
    // // 异常处理模块 - P0 CRITICAL
    // ExceptionModule.forRoot({
    //   isProduction: process.env.NODE_ENV === 'production',
    //   enableLogging: true,
    // }),

    // // 日志模块 - 自动复用 Fastify Pino
    // LoggingModule.forRoot(
    //   plainToInstance(LoggingModuleConfig, {
    //     level: process.env.LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? 'debug' : 'info'),
    //     prettyPrint: process.env.NODE_ENV !== 'production',
    //   }),
    // ),

    // // 缓存模块 - Redis 分布式缓存（可选）
    // // TODO: 启用缓存前需要启动 Redis 服务器
    // // 启动 Redis: docker run -d -p 6379:6379 redis:alpine
    // // CachingModule.forRoot(
    // //   plainToInstance(CachingModuleConfig, {
    // //     redis: {
    // //       host: process.env.REDIS_HOST || 'localhost',
    // //       port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // //       password: process.env.REDIS_PASSWORD,
    // //       db: parseInt(process.env.REDIS_DB || '0', 10),
    // //     },
    // //     ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    // //     keyPrefix: process.env.CACHE_KEY_PREFIX || 'hl8:cache:',
    // //   }),
    // // ),

    // // 数据隔离模块 - 5 级隔离
    // IsolationModule.forRoot(),
  ],
})
export class AppModule {}
