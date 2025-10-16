/**
 * 消息队列缓存集成使用示例
 *
 * @description 展示如何使用集成了@hl8/cache的消息队列模块
 * 包括消息去重、消费者状态管理、性能监控缓存等功能
 *
 * @example
 * ```typescript
 * import { MessagingModule } from '@hl8/messaging';
 * import { Module, Injectable } from '@nestjs/common';
 * import {
 *   MessagingService,
 *   MessageDeduplicationService,
 *   ConsumerStateService,
 * } from '@hl8/messaging';
 *
 * // 配置消息队列模块（自动集成缓存）
 * @Module({
 *   imports: [
 *     MessagingModule.forRoot({
 *       adapter: 'rabbitmq',
 *       rabbitmq: {
 *         url: 'amqp://localhost:5672',
 *       },
 *       // 缓存配置
 *       cache: {
 *         enableMessageDeduplication: true,
 *         enableConsumerStateCache: true,
 *         enableStatsCache: true,
 *         cacheTTL: {
 *           messageDedup: 300, // 5分钟
 *           consumerState: 3600, // 1小时
 *           stats: 60, // 1分钟
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // 在服务中使用缓存功能
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     private readonly messagingService: MessagingService,
 *     private readonly deduplicationService: MessageDeduplicationService,
 *     private readonly consumerStateService: ConsumerStateService,
 *   ) {}
 *
 *   async createUser(userData: any) {
 *     // 发布用户创建事件（自动去重）
 *     await this.messagingService.publish('user.created', {
 *       id: userData.id,
 *       email: userData.email,
 *       createdAt: new Date(),
 *     });
 *   }
 *
 *   async processUserEvents() {
 *     // 消费用户事件（自动状态管理）
 *     await this.messagingService.consume('user.events', async (event) => {
 *       await this.handleUserEvent(event);
 *     });
 *   }
 * }
 * ```
 */

import { Injectable } from "@nestjs/common";
import { PinoLogger } from "@hl8/logger";
import { MessagingService } from "../lib/messaging.service";
import { MessageDeduplicationService } from "../lib/services/message-deduplication.service";
import { ConsumerStateService } from "../lib/services/consumer-state.service";

/**
 * 消息队列缓存集成示例服务
 *
 * @description 展示各种缓存功能的使用方法和最佳实践
 */
@Injectable()
export class MessagingCacheIntegrationExampleService {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly deduplicationService: MessageDeduplicationService,
    private readonly consumerStateService: ConsumerStateService,
  ) {}

  /**
   * 消息去重示例
   */
  async demonstrateMessageDeduplication(): Promise<void> {
    const userEvent = {
      id: "user-123",
      email: "user@example.com",
      eventType: "user.created",
      timestamp: new Date(),
    };

    // 第一次发布 - 正常处理
    await this.messagingService.publish("user.created", userEvent);
    this.logger.log("第一次发布用户事件");

    // 第二次发布相同事件 - 会被去重跳过
    await this.messagingService.publish("user.created", userEvent);
    this.logger.log("第二次发布相同事件（已去重）");

    // 手动检查去重
    const isDuplicate = await this.deduplicationService.isDuplicate(userEvent);
    this.logger.log(`手动检查去重结果: ${isDuplicate ? "重复" : "不重复"}`);
  }

  /**
   * 批量消息去重示例
   */
  async demonstrateBatchDeduplication(): Promise<void> {
    const events = [
      { id: "user-1", eventType: "user.created", email: "user1@example.com" },
      { id: "user-2", eventType: "user.updated", email: "user2@example.com" },
      { id: "user-1", eventType: "user.created", email: "user1@example.com" }, // 重复
    ];

    // 批量检查重复
    const duplicateIndexes =
      await this.deduplicationService.checkBatchDuplicate(events);
    this.logger.log(`发现 ${duplicateIndexes.length} 个重复消息`);
    this.logger.debug("重复消息索引", { duplicateIndexes });

    // 过滤掉重复消息
    const uniqueEvents = events.filter(
      (_, index) => !duplicateIndexes.includes(index),
    );
    this.logger.log(`过滤后剩余 ${uniqueEvents.length} 个唯一消息`);

    // 批量发布唯一消息
    for (const event of uniqueEvents) {
      await this.messagingService.publish("user.events", event);
    }
  }

  /**
   * 消费者状态管理示例
   */
  async demonstrateConsumerStateManagement(): Promise<void> {
    const queueName = "user-processing";
    const consumerId = "user-processor-001";

    // 创建消费者状态
    await this.consumerStateService.createConsumerState(consumerId, queueName);
    this.logger.log("创建消费者状态");

    // 模拟消息处理
    const messages = [
      { id: "msg-001", userId: "user-1", action: "create" },
      { id: "msg-002", userId: "user-2", action: "update" },
      { id: "msg-003", userId: "user-3", action: "delete" },
    ];

    for (const message of messages) {
      // 模拟处理消息
      await this.simulateMessageProcessing(message);

      // 更新消费者状态
      await this.consumerStateService.updateProcessedState(
        consumerId,
        queueName,
        message.id,
      );
      this.logger.log(`处理消息 ${message.id} 并更新状态`);
    }

    // 获取最终状态
    const finalState =
      await this.consumerStateService.getConsumerState(consumerId);
    this.logger.log("最终消费者状态");
    this.logger.debug("消费者状态详情", {
      totalProcessed: finalState?.totalProcessedMessages,
      lastMessageId: finalState?.lastProcessedMessageId,
      status: finalState?.status,
    });
  }

  /**
   * 消费者故障恢复示例
   */
  async demonstrateConsumerRecovery(): Promise<void> {
    const queueName = "order-processing";
    const consumerId = "order-processor-001";

    // 模拟消费者重启前的状态
    await this.consumerStateService.createConsumerState(consumerId, queueName);

    // 模拟处理一些消息
    const processedMessages = ["msg-001", "msg-002", "msg-003"];
    for (const msgId of processedMessages) {
      await this.consumerStateService.updateProcessedState(
        consumerId,
        queueName,
        msgId,
      );
    }

    // 模拟消费者重启
    this.logger.log("模拟消费者重启...");

    // 恢复消费者状态
    const recoveredState =
      await this.consumerStateService.getConsumerState(consumerId);
    if (recoveredState) {
      this.logger.log("消费者状态恢复成功");
      this.logger.debug("恢复状态详情", {
        lastProcessedMessageId: recoveredState.lastProcessedMessageId,
        totalProcessed: recoveredState.totalProcessedMessages,
      });

      // 从最后处理的消息继续
      const continueFrom = recoveredState.lastProcessedMessageId;
      this.logger.log(`从消息 ${continueFrom} 继续处理`);
    }
  }

  /**
   * 错误处理和状态更新示例
   */
  async demonstrateErrorHandling(): Promise<void> {
    const consumerId = "error-handler-001";
    const queueName = "error-test";

    // 创建消费者状态
    await this.consumerStateService.createConsumerState(consumerId, queueName);

    try {
      // 模拟正常处理
      await this.consumerStateService.updateProcessedState(
        consumerId,
        queueName,
        "msg-success",
      );
      this.logger.log("正常处理消息");

      // 模拟错误处理
      throw new Error("模拟处理错误");
    } catch (error) {
      // 更新错误状态
      await this.consumerStateService.updateErrorState(
        consumerId,
        (error as Error).message,
      );
      this.logger.error("处理错误并更新状态", {
        error: (error as Error).message,
      });
    }

    // 检查最终状态
    const errorState =
      await this.consumerStateService.getConsumerState(consumerId);
    this.logger.log("错误状态信息");
    this.logger.debug("错误状态详情", {
      status: errorState?.status,
      lastError: errorState?.lastError,
    });
  }

  /**
   * 消费者状态监控示例
   */
  async demonstrateConsumerMonitoring(): Promise<void> {
    // 创建多个消费者
    const consumers = [
      { id: "consumer-1", queue: "queue-1" },
      { id: "consumer-2", queue: "queue-2" },
      { id: "consumer-3", queue: "queue-1" },
    ];

    // 为每个消费者创建状态
    for (const consumer of consumers) {
      await this.consumerStateService.createConsumerState(
        consumer.id,
        consumer.queue,
      );

      // 模拟不同的处理状态
      if (consumer.id === "consumer-1") {
        await this.consumerStateService.updateProcessedState(
          consumer.id,
          consumer.queue,
          "msg-001",
        );
        await this.consumerStateService.updateProcessedState(
          consumer.id,
          consumer.queue,
          "msg-002",
        );
      } else if (consumer.id === "consumer-2") {
        await this.consumerStateService.updateErrorState(
          consumer.id,
          "Connection timeout",
        );
        await this.consumerStateService.updateConsumerStatus(
          consumer.id,
          "paused",
        );
      }
    }

    // 获取所有消费者状态
    const allStates = await this.consumerStateService.getAllConsumerStates();
    this.logger.log("所有消费者状态");
    this.logger.debug("消费者状态统计", {
      totalConsumers: allStates.length,
      activeConsumers: allStates.filter((s) => s.status === "active").length,
      errorConsumers: allStates.filter((s) => s.status === "error").length,
    });
  }

  /**
   * 缓存清理示例
   */
  async demonstrateCacheCleanup(): Promise<void> {
    // 清理过期的去重记录
    const dedupCleaned =
      await this.deduplicationService.cleanupExpiredRecords();
    this.logger.log(`清理去重记录: ${dedupCleaned} 条`);

    // 清理过期的消费者状态
    const stateCleaned = await this.consumerStateService.cleanupExpiredStates();
    this.logger.log(`清理消费者状态: ${stateCleaned} 条`);
  }

  /**
   * 综合使用示例
   */
  async demonstrateComprehensiveUsage(): Promise<void> {
    this.logger.log("开始综合缓存功能演示");

    // 1. 消息去重演示
    await this.demonstrateMessageDeduplication();

    // 2. 批量去重演示
    await this.demonstrateBatchDeduplication();

    // 3. 消费者状态管理演示
    await this.demonstrateConsumerStateManagement();

    // 4. 故障恢复演示
    await this.demonstrateConsumerRecovery();

    // 5. 错误处理演示
    await this.demonstrateErrorHandling();

    // 6. 监控演示
    await this.demonstrateConsumerMonitoring();

    // 7. 清理演示
    await this.demonstrateCacheCleanup();

    this.logger.log("综合缓存功能演示完成");
  }

  // 辅助方法
  private async simulateMessageProcessing(message: {
    id: string;
    userId: string;
    action: string;
  }): Promise<void> {
    // 模拟异步处理
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.logger.debug(`处理消息: ${message.id}`, {
      userId: message.userId,
      action: message.action,
    });
  }
}
