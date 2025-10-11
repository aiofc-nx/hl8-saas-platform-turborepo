import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';

/**
 * 初始化 NestJS 应用
 *
 * @description 配置 Fastify、中间件、验证、静态资源、日志和 API 文档
 * 使用 @hl8/nestjs-infra 提供企业级基础设施功能
 *
 * ## 业务规则
 *
 * ### 应用初始化规则
 * - 配置静态文件服务
 * - 配置全局验证管道
 * - 配置 Swagger API 文档 (非生产环境)
 * - 配置文件上传支持
 *
 * ### 日志记录规则
 * - 使用 @hl8/nestjs-fastify 的 FastifyLoggerService（全局统一日志）
 * - EnterpriseFastifyAdapter 自动记录请求和响应
 * - 支持隔离上下文追踪（租户、组织、部门、用户）
 * - 在非生产环境启用彩色输出
 *
 * ### 注意事项
 * - CORS、安全头、性能监控由 EnterpriseFastifyAdapter 自动配置
 * - 健康检查端点: /health
 * - 速率限制在生产环境自动启用
 *
 * @param app - NestFastifyApplication 实例
 * @returns Promise<void> 应用启动完成
 */
export const bootstrap = async (app: NestFastifyApplication): Promise<void> => {
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 全局日志服务已通过 FastifyLoggingModule 自动配置
  // 所有模块自动使用 FastifyLoggerService（零开销 + 隔离上下文）

  // 全局验证管道 - 自动验证请求数据
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 启动应用并监听配置的端口
  const port = parseInt(configService.get('PORT') || '3000', 10);
  const host = configService.get('HOST') || '0.0.0.0';

  await app.listen(port, host);
  
  console.log(`🚀 Application started at http://${host}:${port}`);
  console.log(`✅ Ready to accept requests`);
};
