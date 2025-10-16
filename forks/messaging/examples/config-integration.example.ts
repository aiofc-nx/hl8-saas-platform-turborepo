/**
 * 消息队列配置模块集成示例
 *
 * @description 展示如何使用@hl8/config模块进行类型安全的配置管理
 * 支持环境变量、配置文件、配置验证等功能
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { MessagingConfigModule } from '@hl8/messaging';
 * import { MessagingModule } from '@hl8/messaging';
 *
 * @Module({
 *   imports: [
 *     // 配置模块 - 类型安全的配置管理
 *     MessagingConfigModule.forRoot({
 *       configPath: './config/messaging.yml',
 *       envPrefix: 'MESSAGING_',
 *     }),
 *     // 消息队列模块 - 使用配置
 *     MessagingModule.forRootWithConfig(configService),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Injectable } from "@nestjs/common";
// 移除ConfigService导入，使用直接注入配置类
import { MessagingConfig } from "../lib/config/messaging.config";
import { MessagingService } from "../lib/messaging.service";
import { PinoLogger } from "@hl8/logger";

/**
 * 配置集成示例服务
 *
 * @description 展示如何在服务中使用类型安全的配置
 */
@Injectable()
export class MessagingConfigIntegrationExample {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly config: MessagingConfig,
    private readonly messagingService: MessagingService,
  ) {
    this.logger.setContext({ requestId: "config-integration-example" });
  }

  /**
   * 演示配置访问
   */
  demonstrateConfigAccess(): void {
    // 获取完整的消息队列配置
    const messagingConfig = this.config;

    this.logger.info("消息队列配置", {
      adapter: messagingConfig?.adapter,
      enableTenantIsolation: messagingConfig?.enableTenantIsolation,
      keyPrefix: messagingConfig?.keyPrefix,
    });

    // 获取特定配置项
    const adapter = this.config?.adapter;
    const rabbitmqUrl = this.config?.rabbitmq?.url;
    const cacheEnabled = this.config?.cache?.enableMessageDeduplication;

    this.logger.info("配置项访问", {
      adapter,
      rabbitmqUrl,
      cacheEnabled,
    });
  }

  /**
   * 演示配置验证
   */
  demonstrateConfigValidation(): void {
    try {
      // 配置验证在模块启动时自动进行
      const config = this.config;

      if (!config) {
        throw new Error("消息队列配置未找到");
      }

      // 运行时配置检查
      if (!config.adapter) {
        throw new Error("消息队列适配器未配置");
      }

      this.logger.info("配置验证通过", {
        adapter: config.adapter,
        hasMultiTenancy: !!config.multiTenancy,
        hasCache: !!config.cache,
      });
    } catch (error) {
      this.logger.error("配置验证失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 演示环境变量覆盖
   */
  demonstrateEnvironmentOverrides(): void {
    // 展示环境变量如何覆盖配置文件
    const config = this.config;

    this.logger.info("环境变量覆盖演示", {
      // 这些值可能来自环境变量 MESSAGING_ADAPTER, MESSAGING_KEY_PREFIX 等
      adapter: config?.adapter,
      keyPrefix: config?.keyPrefix,
      tenantIsolation: config?.enableTenantIsolation,
    });
  }

  /**
   * 演示动态配置更新
   */
  demonstrateDynamicConfig(): void {
    // 注意：配置通常是只读的，这里仅作演示
    const currentConfig = this.config;

    this.logger.info("当前配置状态", {
      adapter: currentConfig?.adapter,
      cacheConfig: currentConfig?.cache
        ? {
            messageDeduplication:
              currentConfig.cache.enableMessageDeduplication,
            consumerState: currentConfig.cache.enableConsumerStateCache,
          }
        : null,
    });
  }
}

/**
 * 配置模块使用示例
 */
export class ConfigUsageExamples {
  /**
   * 基本配置模块使用
   */
  static basicUsage() {
    return `
// 1. 基本配置模块导入
import { MessagingConfigModule } from '@hl8/messaging';

@Module({
  imports: [
    MessagingConfigModule.forRoot({
      configPath: './config/messaging.yml',
      envPrefix: 'MESSAGING_',
    }),
  ],
})
export class AppModule {}
    `;
  }

  /**
   * 高级配置模块使用
   */
  static advancedUsage() {
    return `
// 2. 高级配置模块使用
import { MessagingConfigModule } from '@hl8/messaging';

@Module({
  imports: [
    MessagingConfigModule.forRootAsync({
      useFactory: async (databaseService: DatabaseService) => {
        // 从数据库加载配置
        const dbConfig = await databaseService.getMessagingConfig();
        
        // 从环境变量加载配置
        const envConfig = {
          adapter: process.env.MESSAGING_ADAPTER,
          keyPrefix: process.env.MESSAGING_KEY_PREFIX,
        };
        
        // 合并配置
        return {
          ...dbConfig,
          ...envConfig,
        };
      },
      inject: [DatabaseService],
    }),
  ],
})
export class AppModule {}
    `;
  }

  /**
   * 配置文件示例
   */
  static configFileExample() {
    return `
# config/messaging.yml
adapter: rabbitmq
keyPrefix: "hl8:messaging:"
enableTenantIsolation: true

rabbitmq:
  url: "amqp://localhost:5672"
  exchange: "hl8_saas"
  queuePrefix: "hl8_"
  heartbeat: 30

redis:
  host: "localhost"
  port: 6379
  db: 1
  streamPrefix: "hl8:messaging:stream:"

cache:
  enableMessageDeduplication: true
  enableConsumerStateCache: true
  cacheTTL:
    messageDedup: 300
    consumerState: 3600

multiTenancy:
  context:
    enableAutoInjection: true
    contextTimeout: 30000
    enableAuditLog: true
  isolation:
    strategy: "key-prefix"
    keyPrefix: "hl8:messaging:"
    enableIsolation: true
    level: "strict"

monitoring:
  enableStats: true
  enableHealthCheck: true
  statsInterval: 60000

retry:
  maxRetries: 3
  retryDelay: 1000
  backoff: "exponential"
  enableDeadLetterQueue: true
    `;
  }

  /**
   * 环境变量示例
   */
  static environmentVariablesExample() {
    return `
# .env 文件示例
MESSAGING_ADAPTER=rabbitmq
MESSAGING_KEY_PREFIX=hl8:messaging:
MESSAGING_ENABLE_TENANT_ISOLATION=true

# RabbitMQ 配置
MESSAGING_RABBITMQ__URL=amqp://localhost:5672
MESSAGING_RABBITMQ__EXCHANGE=hl8_saas
MESSAGING_RABBITMQ__QUEUE_PREFIX=hl8_

# Redis 配置
MESSAGING_REDIS__HOST=localhost
MESSAGING_REDIS__PORT=6379
MESSAGING_REDIS__DB=1

# 缓存配置
MESSAGING_CACHE__ENABLE_MESSAGE_DEDUPLICATION=true
MESSAGING_CACHE__ENABLE_CONSUMER_STATE_CACHE=true
MESSAGING_CACHE__CACHE_TTL__MESSAGE_DEDUP=300
MESSAGING_CACHE__CACHE_TTL__CONSUMER_STATE=3600

# 多租户配置
MESSAGING_MULTI_TENANCY__CONTEXT__ENABLE_AUTO_INJECTION=true
MESSAGING_MULTI_TENANCY__CONTEXT__CONTEXT_TIMEOUT=30000
MESSAGING_MULTI_TENANCY__ISOLATION__STRATEGY=key-prefix
MESSAGING_MULTI_TENANCY__ISOLATION__KEY_PREFIX=hl8:messaging:
    `;
  }

  /**
   * 服务中使用配置示例
   */
  static serviceUsageExample() {
    return `
// 3. 在服务中使用配置
import { Injectable } from '@nestjs/common';
// 移除ConfigService导入，使用直接注入配置类
import { MessagingConfig } from '@hl8/messaging';

@Injectable()
export class MessageProcessor {
  constructor(
    private readonly config: MessagingConfig,
    private readonly messagingService: MessagingService
  ) {}

  async processMessage() {
    // 获取配置
    const config = this.config;
    
    // 使用配置进行业务逻辑
    if (config?.cache?.enableMessageDeduplication) {
      // 启用消息去重
      await this.messagingService.publish('user.created', userData);
    }
    
    // 检查重试配置
    if (config?.retry?.maxRetries > 0) {
      // 实现重试逻辑
    }
  }
}
    `;
  }
}
