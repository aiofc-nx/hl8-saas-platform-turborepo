import {
  createFastifyLoggerConfig,
  EnterpriseFastifyAdapter,
} from "@hl8/nestjs-fastify";
import { NestFactory } from "@nestjs/core";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { bootstrap } from "./bootstrap.js";
import { setupSwagger } from "./swagger.js";

/**
 * Main entry point to bootstrap the NestJS Fastify application.
 *
 * @description 使用 @hl8/nestjs-fastify 的 EnterpriseFastifyAdapter
 * 提供企业级功能：CORS、安全头、性能监控、健康检查、速率限制、熔断器
 *
 * @returns {Promise<void>} A promise that resolves when the application has started.
 */
const main = async (): Promise<void> => {
  // 使用企业级 Fastify 适配器
  const adapter = new EnterpriseFastifyAdapter({
    // Fastify 基础配置
    fastifyOptions: {
      logger: createFastifyLoggerConfig({
        level: process.env.LOG_LEVEL || "info",
        prettyPrint: process.env.NODE_ENV === "development",
        colorize: process.env.NODE_ENV === "development",
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      }),
      trustProxy: true,
    },
    // CORS 配置（暂时禁用，避免冲突 - NestJS 可能已经注册）
    enableCors: false,
    // corsOptions: {
    //   origin: true,
    //   credentials: true,
    // },
    // 性能监控
    enablePerformanceMonitoring: true,
    // 健康检查（暂时禁用，避免路由冲突）
    enableHealthCheck: false,
    // healthCheckPath: '/health',
    // 安全配置
    enableSecurity: true,
    // 限流（生产环境启用）
    enableRateLimit: process.env.NODE_ENV === "production",
    rateLimitOptions: {
      timeWindow: 60000, // 1分钟
      max: 100, // 100次请求
    },
    // 熔断器（生产环境启用）
    enableCircuitBreaker: process.env.NODE_ENV === "production",
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  // 设置 Swagger API 文档
  await setupSwagger(app);

  await bootstrap(app);
};

/**
 * Invokes the main bootstrap function and handles any errors.
 *
 * @returns {void}
 */
main().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
