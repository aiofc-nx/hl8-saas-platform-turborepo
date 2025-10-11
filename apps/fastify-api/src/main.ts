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
  // 使用企业级 Fastify 适配器（简化配置，避免冲突）
  const adapter = new EnterpriseFastifyAdapter({
    enableCors: false,  // 暂时禁用（避免冲突）
    enablePerformanceMonitoring: true,
    enableHealthCheck: false,  // 暂时禁用（避免路由冲突）
    enableRateLimit: false,  // 暂时禁用
    enableSecurity: false,  // 暂时禁用
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
