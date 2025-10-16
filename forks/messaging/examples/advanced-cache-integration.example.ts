/**
 * 高级缓存集成使用示例
 *
 * @description 展示如何使用第二阶段的缓存集成功能
 * 包括死信队列缓存、租户配置缓存、高级监控缓存等企业级功能
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { MessagingModule } from '@hl8/messaging';
 * import { AdvancedCacheIntegrationExample } from './advanced-cache-integration.example';
 *
 * @Module({
 *   imports: [
 *     MessagingModule.forRoot({
 *       adapter: 'rabbitmq',
 *       cache: {
 *         enableMessageDeduplication: true,
 *         enableConsumerStateCache: true,
 *         enableDeadLetterCache: true,
 *         enableTenantConfigCache: true,
 *         enableAdvancedMonitoringCache: true,
 *       },
 *     }),
 *   ],
 *   providers: [AdvancedCacheIntegrationExample],
 * })
 * export class AppModule {}
 * ```
 */

import { Injectable, Module } from "@nestjs/common";
import { MessagingService } from "../src/lib/messaging.service";
import { EventService } from "../src/lib/event.service";
import { TaskService } from "../src/lib/task.service";
import { DeadLetterCacheService } from "../src/lib/services/dead-letter-cache.service";
import { TenantConfigCacheService } from "../src/lib/services/tenant-config-cache.service";
import { AdvancedMonitoringCacheService } from "../src/lib/services/advanced-monitoring-cache.service";
import { TenantContextService } from "@hl8/multi-tenancy";
import type { TenantMessagingConfig } from "../src/lib/services/tenant-config-cache.service";
import { PinoLogger } from "@hl8/logger";
import { EntityId } from "@hl8/business-core";

/**
 * 高级缓存集成示例服务
 *
 * @description 展示如何使用第二阶段的高级缓存功能
 */
@Injectable()
export class AdvancedCacheIntegrationExample {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly deadLetterCache: DeadLetterCacheService,
    private readonly tenantConfigCache: TenantConfigCacheService,
    private readonly monitoringCache: AdvancedMonitoringCacheService,
    private readonly messagingService: MessagingService,
    private readonly eventService: EventService,
    private readonly taskService: TaskService,
    private readonly tenantContextService: TenantContextService,
  ) {
    this.logger.setContext({ requestId: "advanced-cache-integration" });
  }

  /**
   * 死信队列缓存使用示例
   */
  async demonstrateDeadLetterCache(): Promise<void> {
    this.logger.info("开始演示死信队列缓存功能");

    try {
      const tenantId = this.tenantContextService.getTenant() || "demo-tenant";

      // 1. 模拟消息处理失败并存储到死信队列
      const testMessage = {
        id: "msg_001",
        content: "测试消息",
        timestamp: new Date().toISOString(),
      };

      const testError = new Error("模拟处理失败");
      const cacheKey = await this.deadLetterCache.storeDeadMessage(
        testMessage,
        testError,
        0,
        tenantId,
      );

      this.logger.info("消息已存储到死信队列", { cacheKey });

      // 2. 获取死信消息
      const deadMessage = await this.deadLetterCache.getDeadMessage(
        testMessage.id,
        tenantId,
      );

      if (deadMessage) {
        this.logger.info("获取死信消息成功", {
          messageId: deadMessage.messageId,
          retryCount: deadMessage.retryCount,
          retryable: deadMessage.retryable,
        });
      }

      // 3. 重试死信消息
      const retryResult = await this.deadLetterCache.retryDeadMessage(
        testMessage.id,
        async (message: unknown) => {
          const msg = message as {
            id: string;
            data: unknown;
            tenantId: string;
          };
          this.logger.info("重试处理消息", { message: msg });
          // 模拟重试成功
          return Promise.resolve();
        },
        tenantId,
      );

      this.logger.info("死信消息重试结果", retryResult);

      // 4. 获取死信队列统计
      const stats = await this.deadLetterCache.getDeadLetterStats(tenantId);
      this.logger.info("死信队列统计", stats);

      // 5. 清理过期的死信消息
      const cleanupResult =
        await this.deadLetterCache.cleanupExpiredDeadMessages(
          tenantId,
          new Date(Date.now() - 24 * 60 * 60 * 1000), // 清理24小时前的消息
        );

      this.logger.info("死信消息清理结果", cleanupResult);
    } catch (error) {
      this.logger.error("死信队列缓存演示失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 租户配置缓存使用示例
   */
  async demonstrateTenantConfigCache(): Promise<void> {
    this.logger.info("开始演示租户配置缓存功能");

    try {
      const tenantId = this.tenantContextService.getTenant() || "demo-tenant";

      // 1. 获取租户配置
      const config = await this.tenantConfigCache.getTenantConfig(tenantId);
      this.logger.info("获取租户配置", {
        tenantId: config.tenantId,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay,
      });

      // 2. 更新租户配置
      const updateResult = await this.tenantConfigCache.updateTenantConfig(
        tenantId,
        {
          maxRetries: 5,
          retryDelay: 2000,
          enableDeadLetterQueue: true,
          rateLimit: {
            enabled: true,
            maxMessagesPerSecond: 100,
            burstSize: 500,
          },
        },
        true, // 持久化到数据源
      );

      this.logger.info("租户配置更新结果", {
        success: updateResult.success,
        message: updateResult.message,
      });

      // 3. 批量更新多个租户配置
      const batchUpdates = [
        {
          tenantId: "tenant-1",
          config: { maxRetries: 3, retryDelay: 1000 },
        },
        {
          tenantId: "tenant-2",
          config: { maxRetries: 7, retryDelay: 3000 },
        },
      ];

      const batchResult = await this.tenantConfigCache.batchUpdateTenantConfigs(
        batchUpdates,
        true,
      );

      this.logger.info("批量更新租户配置结果", {
        totalCount: batchResult.totalCount,
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
      });

      // 4. 获取租户配置统计
      const stats = await this.tenantConfigCache.getTenantConfigStats(tenantId);
      this.logger.info("租户配置统计", stats);

      // 5. 刷新租户配置缓存
      const refreshResult =
        await this.tenantConfigCache.refreshTenantConfigCache(tenantId);
      this.logger.info("租户配置缓存刷新结果", refreshResult);
    } catch (error) {
      this.logger.error("租户配置缓存演示失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 高级监控缓存使用示例
   */
  async demonstrateAdvancedMonitoringCache(): Promise<void> {
    this.logger.info("开始演示高级监控缓存功能");

    try {
      const tenantId = this.tenantContextService.getTenant() || "demo-tenant";

      // 1. 记录消息处理指标
      for (let i = 0; i < 10; i++) {
        await this.monitoringCache.recordMessageProcessed(
          `msg_${i}`,
          Math.random() * 1000, // 随机处理时间
          1024, // 消息大小
          i % 3 === 0 ? "failed" : "success", // 模拟一些失败
          tenantId,
        );
      }

      this.logger.info("已记录10个消息处理指标");

      // 2. 记录队列性能指标
      await this.monitoringCache.recordQueueMetrics(
        "test-queue",
        {
          queueName: "test-queue",
          depth: 100,
          throughput: 50,
          avgLatency: 200,
          consumerCount: 3,
          timestamp: Date.now(),
        },
        tenantId,
      );

      this.logger.info("已记录队列性能指标");

      // 3. 记录错误指标
      const testError = new Error("测试错误");
      await this.monitoringCache.recordErrorMetrics(
        testError,
        {
          messageId: "msg_error_001",
          queueName: "test-queue",
          consumerId: "consumer_001",
          retryCount: 2,
          additionalInfo: {
            userId: "user_123",
            sessionId: "session_456",
          },
        },
        tenantId,
      );

      this.logger.info("已记录错误指标");

      // 4. 获取实时监控指标
      const realtimeMetrics = await this.monitoringCache.getRealtimeMetrics(
        tenantId,
        5, // 5分钟时间范围
      );

      this.logger.info("实时监控指标", {
        messagesProcessed: realtimeMetrics.messagesProcessed,
        avgProcessingTime: realtimeMetrics.avgProcessingTime,
        throughput: realtimeMetrics.throughput,
        errorRate: realtimeMetrics.errorRate,
      });

      // 5. 获取历史趋势分析
      const historicalTrends = await this.monitoringCache.getHistoricalTrends(
        tenantId,
        24, // 24小时
        15, // 15分钟粒度
      );

      this.logger.info("历史趋势分析", {
        dataPointsCount: historicalTrends.dataPoints.length,
        trends: historicalTrends.trends,
        predictions: historicalTrends.predictions,
      });

      // 6. 获取告警状态
      const alertStatus = await this.monitoringCache.getAlertStatus(tenantId, {
        maxThroughput: 100,
        maxLatency: 1000,
        maxErrorRate: 0.1,
        maxQueueDepth: 1000,
      });

      this.logger.info("告警状态", {
        isHealthy: alertStatus.isHealthy,
        alertCount: alertStatus.alertCount,
        severity: alertStatus.severity,
        activeAlerts: alertStatus.activeAlerts.map((alert) => ({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
        })),
      });

      // 7. 清理过期监控数据
      const cleanupResult =
        await this.monitoringCache.cleanupExpiredMetrics(tenantId);
      this.logger.info("监控数据清理结果", cleanupResult);
    } catch (error) {
      this.logger.error("高级监控缓存演示失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 综合使用示例
   */
  async demonstrateComprehensiveUsage(): Promise<void> {
    this.logger.info("开始综合使用示例演示");

    try {
      const tenantId = EntityId.fromString(
        this.tenantContextService.getTenant()?.toString() || "demo-tenant",
      );

      // 1. 设置租户上下文
      // 设置租户上下文
      await this.tenantContextService.setContext({
        tenantId,
        userId: "demo-user",
        requestId: "demo-request",
        timestamp: new Date(),
        metadata: {},
      });
      try {
        // 2. 获取租户特定配置
        const tenantConfig =
          await this.tenantConfigCache.getTenantConfig(tenantId);

        // 3. 使用配置处理消息
        const message = {
          id: "comprehensive_msg_001",
          data: "综合测试消息",
          tenantId: tenantId,
        };

        const startTime = Date.now();

        try {
          // 模拟消息处理
          await this.processMessageWithConfig(message, tenantConfig);

          // 记录成功指标
          await this.monitoringCache.recordMessageProcessed(
            message.id,
            Date.now() - startTime,
            JSON.stringify(message).length,
            "success",
            tenantId,
          );

          this.logger.info("消息处理成功", { messageId: message.id });
        } catch (error) {
          // 记录失败指标
          await this.monitoringCache.recordMessageProcessed(
            message.id,
            Date.now() - startTime,
            JSON.stringify(message).length,
            "failed",
            tenantId,
          );

          // 记录错误指标
          await this.monitoringCache.recordErrorMetrics(
            error as Error,
            {
              messageId: message.id,
              queueName: "comprehensive-queue",
              consumerId: "comprehensive-consumer",
            },
            tenantId,
          );

          // 存储到死信队列
          await this.deadLetterCache.storeDeadMessage(
            message,
            error as Error,
            0,
            tenantId,
          );

          this.logger.error("消息处理失败，已存储到死信队列", {
            messageId: message.id,
            error: (error as Error).message,
          });
        }

        // 4. 获取综合监控状态
        const realtimeMetrics =
          await this.monitoringCache.getRealtimeMetrics(tenantId);
        const alertStatus = await this.monitoringCache.getAlertStatus(tenantId);
        const deadLetterStats =
          await this.deadLetterCache.getDeadLetterStats(tenantId);
        const tenantConfigStats =
          await this.tenantConfigCache.getTenantConfigStats(tenantId);

        this.logger.info("综合监控状态", {
          realtimeMetrics: {
            messagesProcessed: realtimeMetrics.messagesProcessed,
            avgProcessingTime: realtimeMetrics.avgProcessingTime,
            throughput: realtimeMetrics.throughput,
            errorRate: realtimeMetrics.errorRate,
          },
          alertStatus: {
            isHealthy: alertStatus.isHealthy,
            alertCount: alertStatus.alertCount,
            severity: alertStatus.severity,
          },
          deadLetterStats: {
            totalStored: deadLetterStats.totalStored,
            currentCount: deadLetterStats.currentCount,
            retrySuccessCount: deadLetterStats.retrySuccessCount,
          },
          tenantConfigStats: {
            isCached: tenantConfigStats.isCached,
            lastAccessed: tenantConfigStats.lastAccessed,
          },
        });
      } finally {
        // 清理租户上下文
        await this.tenantContextService.clearContext();
      }
    } catch (error) {
      this.logger.error("综合使用示例演示失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 使用租户配置处理消息
   */
  private async processMessageWithConfig(
    message: { id: string; data: unknown; tenantId: string },
    config: TenantMessagingConfig,
  ): Promise<void> {
    // 模拟根据配置处理消息
    this.logger.debug("使用租户配置处理消息", {
      messageId: message.id,
      tenantId: message.tenantId,
      queuePrefix: config.queuePrefix,
      exchangePrefix: config.exchangePrefix,
    });

    // 模拟处理延迟
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    // 模拟偶尔的处理失败
    if (Math.random() < 0.1) {
      throw new Error("模拟处理失败");
    }
  }

  /**
   * 运行所有演示
   */
  async runAllDemonstrations(): Promise<void> {
    this.logger.info("开始运行所有高级缓存集成演示");

    try {
      await this.demonstrateDeadLetterCache();
      await this.demonstrateTenantConfigCache();
      await this.demonstrateAdvancedMonitoringCache();
      await this.demonstrateComprehensiveUsage();

      this.logger.info("所有高级缓存集成演示完成");
    } catch (error) {
      this.logger.error("运行演示失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}

/**
 * 高级缓存集成示例模块
 */
@Module({
  providers: [AdvancedCacheIntegrationExample],
  exports: [AdvancedCacheIntegrationExample],
})
export class AdvancedCacheIntegrationExampleModule {}
