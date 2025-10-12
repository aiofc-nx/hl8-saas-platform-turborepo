/**
 * 安全配置的 Main 入口示例
 *
 * @description 展示如何在应用启动时应用配置安全措施
 *
 * ## 安全措施
 *
 * 1. **配置不可变性** - 使用 deepFreeze 冻结配置对象
 * 2. **敏感信息清理** - 启动后删除敏感环境变量
 * 3. **类型安全** - 使用 AppConfig 而不是直接访问 process.env
 *
 * ## 使用方法
 *
 * 1. 将此文件重命名为 main.ts（替换现有的）
 * 2. 或者将相关代码复制到现有的 main.ts 中
 *
 * @example
 * ```bash
 * # 重命名使用
 * mv src/main.ts src/main.old.ts
 * mv src/main.secure.example.ts src/main.ts
 * ```
 */

import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { EnterpriseFastifyAdapter } from '@hl8/nestjs-fastify';
import { AppModule } from './app.module.js';
import { AppConfig } from './config/app.config.js';
import {
  deepFreeze,
  cleanupSensitiveEnvVars,
  isFrozen,
  getSafeConfigCopy,
} from './config/config-security.util.js';
import { setupSwagger } from './swagger.js';

/**
 * 应用启动入口
 *
 * @description 使用类型安全的配置和安全增强措施
 */
async function bootstrap(): Promise<void> {
  // 创建企业级 Fastify 适配器
  const adapter = new EnterpriseFastifyAdapter({
    fastifyOptions: {
      logger: true,  // 日志由 FastifyLoggingModule 统一管理
      trustProxy: true,
    },
    enableCors: false,  // 避免重复配置
    enablePerformanceMonitoring: true,
    enableHealthCheck: false,
    enableSecurity: true,
    enableRateLimit: process.env.NODE_ENV === 'production',
    enableCircuitBreaker: process.env.NODE_ENV === 'production',
  });

  // 创建应用实例
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔒 安全措施：获取配置并应用保护
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const config = app.get(AppConfig);

  // 1. 深度冻结配置对象（防止运行时修改）
  deepFreeze(config);
  console.log('[Security] Configuration frozen:', isFrozen(config));

  // 2. 生产环境清理敏感环境变量
  if (config.isProduction) {
    cleanupSensitiveEnvVars();
  }

  // 3. 记录安全的配置副本（用于调试）
  if (config.isDevelopment) {
    const safeConfig = getSafeConfigCopy(config);
    console.log('[Config] Loaded configuration:', JSON.stringify(safeConfig, null, 2));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 应用配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 全局验证管道
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

  // 设置 Swagger 文档（非生产环境）
  if (!config.isProduction) {
    await setupSwagger(app);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 启动应用
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 使用配置中的端口（而不是直接读取 process.env）
  const port = config.PORT;
  const host = '0.0.0.0';

  await app.listen(port, host);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 启动信息
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const displayHost = 'localhost';

  console.log('\n' + '='.repeat(70));
  console.log('🚀 HL8 SAAS Platform - Application Started Successfully');
  console.log('='.repeat(70));
  console.log(`📍 Local:        http://${displayHost}:${port}`);
  console.log(`🌐 Network:      http://${host}:${port}`);
  
  if (!config.isProduction) {
    console.log(`📚 API Docs:     http://${displayHost}:${port}/api-docs`);
    console.log(`📄 OpenAPI JSON: http://${displayHost}:${port}/api-docs-json`);
  }
  
  console.log('='.repeat(70));
  console.log(`✅ Environment:  ${config.NODE_ENV}`);  // 使用配置而不是 process.env
  console.log(`⚡ Powered by:   Fastify + NestJS`);
  console.log(`🔒 Security:     Enhanced (config frozen)`);
  
  if (config.isProduction) {
    console.log(`🔐 Protection:   Sensitive env vars cleaned`);
  }
  
  console.log('='.repeat(70) + '\n');
}

/**
 * 启动应用并处理错误
 */
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

