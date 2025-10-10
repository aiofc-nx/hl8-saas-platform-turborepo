import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { NestJSLogger, PinoLogger } from '@hl8/logger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';
import { swagger } from './swagger';

/**
 * 初始化 NestJS 应用
 *
 * @description 配置 Fastify、中间件、安全、验证、CORS、静态资源、日志和 API 文档
 * 使用 @hl8/logger 提供高性能日志记录和请求追踪功能
 *
 * ## 业务规则
 *
 * ### 应用初始化规则
 * - 配置安全头防护 (Helmet)
 * - 配置静态文件服务
 * - 配置 CORS 跨域访问
 * - 配置全局验证管道
 * - 配置 Swagger API 文档 (非生产环境)
 * - 配置文件上传支持
 *
 * ### 日志记录规则
 * - 使用 @hl8/logger 记录应用事件
 * - 自动记录请求和响应信息
 * - 支持上下文追踪和错误记录
 * - 在非生产环境启用彩色输出
 *
 * @param app - NestFastifyApplication 实例
 * @returns Promise<void> 应用启动完成
 */
export const bootstrap = async (app: NestFastifyApplication): Promise<void> => {
  // 获取日志器实例 - 使用 @hl8/logger
  const pinoLogger = app.get(PinoLogger);
  const nestjsLogger = app.get(NestJSLogger);

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 设置应用日志器（NestJS 框架使用）
  app.useLogger(nestjsLogger);

  // 获取底层 Fastify 实例
  const fastifyInstance = app.getHttpAdapter().getInstance();

  // 直接在 Fastify 实例上添加请求日志钩子
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fastifyInstance.addHook('onRequest', async (request, _reply) => {
    const requestId = request.headers['x-request-id'] || `req-${Date.now()}`;
    pinoLogger.info('→ Request started', {
      method: request.method,
      url: request.url,
      requestId,
      ip: request.ip,
    });
    (request as any).startTime = Date.now();
  });

  fastifyInstance.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - ((request as any).startTime || 0);
    pinoLogger.info('← Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration,
    });
  });

  // Set up security headers using helmet (Fastify plugin)
  await app.register(helmet as any, {
    global: true,
    permittedCrossDomainPolicies: false,
  });

  // Serve static assets using Fastify's static plugin
  await app.register(fastifyStatic as any, {
    root: join(__dirname, '..', 'storage', 'public'),
    prefix: '/assets/',
    decorateReply: false,
    dotfiles: 'deny',
  });

  // Enable CORS with allowed origins and methods
  app.enableCors({
    credentials: true,
    origin: configService.get('ALLOW_CORS_URL').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

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

  // Swagger API 文档 - 仅在非生产环境启用
  if (configService.get('NODE_ENV') !== 'production') {
    await swagger(app);
  }

  // Register Fastify multipart plugin for file uploads
  await app.register(fastifyMultipart as any);

  // 启动应用并监听配置的端口
  await app.listen(configService.get('PORT')!, '0.0.0.0', () => {
    pinoLogger.info(
      `🚀 Application started at ${configService.get('HOST')}:${configService.get('PORT')}`,
    );
    pinoLogger.info(
      `📚 API Documentation: ${configService.get('HOST')}:${configService.get('PORT')}/api-docs`,
    );
  });
};
