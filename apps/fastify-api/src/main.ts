import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { EnterpriseFastifyAdapter } from '@hl8/nestjs-infra';
import { AppModule } from './app.module.js';
import { bootstrap } from './bootstrap.js';

/**
 * Main entry point to bootstrap the NestJS Fastify application.
 *
 * @description 使用 @hl8/nestjs-infra 的 EnterpriseFastifyAdapter
 * 提供企业级功能：CORS、安全头、性能监控、健康检查、速率限制、熔断器
 *
 * @returns {Promise<void>} A promise that resolves when the application has started.
 */
const main = async (): Promise<void> => {
  // 使用企业级 Fastify 适配器
  const adapter = new EnterpriseFastifyAdapter({
    enableCors: true,
    corsOptions: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    enablePerformanceMonitoring: true,
    enableHealthCheck: true,
    healthCheckPath: '/health',
    enableRateLimit: process.env.NODE_ENV === 'production',
    rateLimitOptions: {
      max: 100,
      timeWindow: 60000, // 1 minute in ms
    },
    enableSecurity: true,
    securityOptions: {
      enableHelmet: true,
    },
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  await bootstrap(app);
};

/**
 * Invokes the main bootstrap function and handles any errors.
 *
 * @returns {void}
 */
main().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
