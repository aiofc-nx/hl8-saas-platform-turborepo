import { LoggerModule } from '@hl8/logger';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

/**
 * HL8 SAAS 平台应用根模块
 *
 * @description 配置全局模块、日志系统和控制器
 * 使用 @hl8/logger 提供高性能的日志记录功能
 *
 * ## 业务规则
 *
 * ### 配置管理规则
 * - 使用 ConfigModule 管理环境变量配置
 * - 配置模块全局可用，无需重复导入
 * - 支持多环境配置文件 (.env.local, .env)
 *
 * ### 日志管理规则
 * - 使用 @hl8/logger 提供高性能日志记录
 * - 开发环境启用美化输出和彩色日志
 * - 生产环境使用 JSON 格式输出
 * - 支持请求追踪和上下文绑定
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
    // 日志模块 - 使用 @hl8/logger
    LoggerModule.forRoot({
      config: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        format: {
          timestamp: true,
          colorize: process.env.NODE_ENV !== 'production',
          prettyPrint: process.env.NODE_ENV !== 'production',
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
        destination: {
          type: 'console',
        },
      },
      enableRequestLogging: true,
      enableResponseLogging: process.env.NODE_ENV !== 'production',
      global: true,
    }),
  ],
})
export class AppModule {}
