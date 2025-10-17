/**
 * 消息队列适配器
 *
 * 实现消息发布和订阅功能，提供统一的消息队列能力。
 * 作为通用功能组件，支持多种消息队列实现。
 *
 * @description 消息队列适配器实现消息发布和订阅功能
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { CacheService } from "@hl8/caching";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { RabbitMQMessageQueueService } from "./rabbitmq-message-queue.service.js";

/**
 * 消息队列配置接口
 */
export interface IMessageQueueConfig {
  /** 是否启用缓存 */
  enableCache: boolean;
  /** 缓存TTL（秒） */
  cacheTtl: number;
  /** 是否启用重试 */
  enableRetry: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用死信队列 */
  enableDeadLetterQueue: boolean;
  /** 是否启用消息持久化 */
  enablePersistence: boolean;
  /** 消息TTL（毫秒） */
  messageTtl: number;
  /** 是否启用消息压缩 */
  enableCompression: boolean;
  /** 是否启用消息加密 */
  enableEncryption: boolean;
}

/**
 * 消息接口
 */
export interface IMessage {
  /** 消息ID */
  messageId: string;
  /** 消息类型 */
  messageType: string;
  /** 消息内容 */
  payload: any;
  /** 消息元数据 */
  metadata: Record<string, any>;
  /** 创建时间 */
  timestamp: Date;
  /** 过期时间 */
  expiresAt?: Date;
  /** 重试次数 */
  retryCount: number;
  /** 租户ID */
  tenantId?: string;
  /** 用户ID */
  userId?: string;
}

/**
 * 消息订阅选项
 */
export interface IMessageSubscriptionOptions {
  /** 队列名称 */
  queueName: string;
  /** 是否自动确认 */
  autoAck: boolean;
  /** 是否独占消费 */
  exclusive: boolean;
  /** 是否持久化 */
  durable: boolean;
  /** 预取数量 */
  prefetchCount: number;
  /** 消息TTL */
  messageTtl: number;
  /** 死信队列 */
  deadLetterQueue?: string;
}

/**
 * 消息处理器接口
 */
export interface IMessageHandler {
  /** 处理器名称 */
  handlerName: string;
  /** 处理函数 */
  handle: (message: IMessage) => Promise<void>;
  /** 错误处理函数 */
  onError?: (error: Error, message: IMessage) => Promise<void>;
}

/**
 * 消息队列适配器
 *
 * 实现消息发布和订阅功能
 */
@Injectable()
export class MessageQueueAdapter {
  private readonly config: IMessageQueueConfig;
  private readonly handlers = new Map<string, IMessageHandler>();
  private connected = false;
  private readonly rabbitmqService: RabbitMQMessageQueueService;

  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: FastifyLoggerService,
    config: Partial<IMessageQueueConfig> = {},
  ) {
    this.config = {
      enableCache: config.enableCache ?? true,
      cacheTtl: config.cacheTtl ?? 300,
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      enableDeadLetterQueue: config.enableDeadLetterQueue ?? true,
      enablePersistence: config.enablePersistence ?? true,
      messageTtl: config.messageTtl ?? 3600000, // 1小时
      enableCompression: config.enableCompression ?? false,
      enableEncryption: config.enableEncryption ?? false,
    };

    // 初始化RabbitMQ服务
    this.rabbitmqService = new RabbitMQMessageQueueService(
      this.logger,
      null as any,
    );
  }

  /**
   * 连接到消息队列
   *
   * @description 建立与消息队列的连接
   */
  async connect(): Promise<void> {
    try {
      if (this.connected) {
        this.logger.log("消息队列已连接");
        return;
      }

      // 连接到RabbitMQ
      await this.rabbitmqService.connect();
      this.connected = true;
      this.logger.log("消息队列连接成功");
    } catch (error) {
      this.logger.error(
        "消息队列连接失败",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 断开消息队列连接
   *
   * @description 断开与消息队列的连接
   */
  async disconnect(): Promise<void> {
    try {
      if (!this.connected) {
        this.logger.debug("消息队列未连接");
        return;
      }

      // 断开RabbitMQ连接
      await this.rabbitmqService.disconnect();
      this.connected = false;
      this.logger.log("消息队列连接已断开");
    } catch (error) {
      this.logger.error(
        "断开消息队列连接失败",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 检查连接状态
   *
   * @description 检查消息队列连接状态
   * @returns 连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 发布消息
   *
   * @param topic - 主题名称
   * @param message - 消息内容
   * @param options - 发布选项
   */
  async publish(
    topic: string,
    message: any,
    options: {
      messageType?: string;
      metadata?: Record<string, any>;
      tenantId?: string;
      userId?: string;
      ttl?: number;
    } = {},
  ): Promise<void> {
    try {
      const messageId = this.generateMessageId();
      const messageType =
        options.messageType || message.constructor?.name || "Unknown";

      const messageData: IMessage = {
        messageId,
        messageType,
        payload: this.serializeMessage(message),
        metadata: {
          ...options.metadata,
          tenantId: options.tenantId,
          userId: options.userId,
          timestamp: new Date(),
        },
        timestamp: new Date(),
        expiresAt: options.ttl ? new Date(Date.now() + options.ttl) : undefined,
        retryCount: 0,
        tenantId: options.tenantId,
        userId: options.userId,
      };

      // 发布消息到RabbitMQ
      await this.rabbitmqService.publish(topic, messageData.payload, {
        persistent: this.config.enablePersistence,
        ttl: options.ttl || this.config.messageTtl,
      });

      // 缓存消息（如果启用）
      if (this.config.enableCache) {
        await this.cacheMessage(messageId, messageData);
      }

      this.logger.debug(`发布消息成功: ${topic}`);
    } catch (error) {
      this.logger.error(
        `发布消息失败: ${topic}`,
        error instanceof Error ? error.stack : undefined,
        {
          messageType: options.messageType,
          topic,
        },
      );
      throw error;
    }
  }

  /**
   * 批量发布消息
   *
   * @param topic - 主题名称
   * @param messages - 消息列表
   * @param options - 发布选项
   */
  async publishBatch(
    topic: string,
    messages: any[],
    options: {
      messageType?: string;
      metadata?: Record<string, any>;
      tenantId?: string;
      userId?: string;
      ttl?: number;
    } = {},
  ): Promise<void> {
    try {
      const messageDataList: IMessage[] = messages.map((message, index) => {
        const messageId = this.generateMessageId();
        const messageType =
          options.messageType || message.constructor?.name || "Unknown";

        return {
          messageId,
          messageType,
          payload: this.serializeMessage(message),
          metadata: {
            ...options.metadata,
            tenantId: options.tenantId,
            userId: options.userId,
            timestamp: new Date(),
            batchIndex: index,
          },
          timestamp: new Date(),
          expiresAt: options.ttl
            ? new Date(Date.now() + options.ttl)
            : undefined,
          retryCount: 0,
          tenantId: options.tenantId,
          userId: options.userId,
        };
      });

      // 批量发布消息到RabbitMQ
      const messagePayloads = messageDataList.map((msg) => msg.payload);
      await this.rabbitmqService.publishBatch(topic, messagePayloads, {
        persistent: this.config.enablePersistence,
        ttl: options.ttl || this.config.messageTtl,
      });

      // 缓存消息（如果启用）
      if (this.config.enableCache) {
        for (const messageData of messageDataList) {
          await this.cacheMessage(messageData.messageId, messageData);
        }
      }

      this.logger.debug(`批量发布消息成功: ${topic}`);
    } catch (error) {
      this.logger.error(
        `批量发布消息失败: ${topic}`,
        error instanceof Error ? error.stack : undefined,
        {
          messageCount: messages.length,
          topic,
        },
      );
      throw error;
    }
  }

  /**
   * 订阅消息
   *
   * @param topic - 主题名称
   * @param handler - 消息处理器
   * @param options - 订阅选项
   */
  async subscribe(
    topic: string,
    handler: IMessageHandler,
    options: IMessageSubscriptionOptions = {
      queueName: topic,
      autoAck: true,
      exclusive: false,
      durable: true,
      prefetchCount: 1,
      messageTtl: this.config.messageTtl,
    },
  ): Promise<void> {
    try {
      // 注册处理器
      this.handlers.set(handler.handlerName, handler);

      // 订阅消息到RabbitMQ
      await this.rabbitmqService.subscribe(
        topic,
        async (message: any) => {
          let messageObj: IMessage;
          try {
            // 构造消息对象
            messageObj = {
              messageId: message.id || this.generateMessageId(),
              messageType: message.type || "Unknown",
              payload: message,
              metadata: message.metadata || {},
              timestamp: message.timestamp || new Date(),
              expiresAt: message.expiresAt,
              retryCount: message.retryCount || 0,
              tenantId: message.tenantId,
              userId: message.userId,
            };

            // 检查消息是否过期
            if (messageObj.expiresAt && messageObj.expiresAt < new Date()) {
              this.logger.warn(`消息已过期: ${messageObj.messageId}`);
              return;
            }

            // 处理消息
            await handler.handle(messageObj);

            // 自动确认消息
            if (options.autoAck) {
              await this.ackMessage(messageObj.messageId);
            }

            this.logger.debug(`处理消息成功: ${messageObj.messageId}`);
          } catch (error) {
            this.logger.error(
              `处理消息失败: ${messageObj.messageId}`,
              error instanceof Error ? error.stack : undefined,
              {
                messageId: messageObj.messageId,
                messageType: messageObj.messageType,
                handlerName: handler.handlerName,
              },
            );

            // 错误处理
            if (handler.onError) {
              await handler.onError(error as Error, messageObj);
            }

            // 重试逻辑
            if (
              this.config.enableRetry &&
              (messageObj.retryCount || 0) < this.config.maxRetries
            ) {
              await this.retryMessage(messageObj, options);
            } else {
              // 发送到死信队列
              if (this.config.enableDeadLetterQueue) {
                await this.sendToDeadLetterQueue(messageObj, error as Error);
              }
            }
          }
        },
        {
          queueName: options.queueName,
          durable: options.durable,
          exclusive: options.exclusive,
          prefetchCount: options.prefetchCount,
        },
      );

      this.logger.debug(`订阅消息成功: ${topic}`);
    } catch (error) {
      this.logger.error(
        `订阅消息失败: ${topic}`,
        error instanceof Error ? error.stack : undefined,
        {
          topic,
          handlerName: handler.handlerName,
        },
      );
      throw error;
    }
  }

  /**
   * 取消订阅
   *
   * @param topic - 主题名称
   * @param handlerName - 处理器名称
   */
  async unsubscribe(topic: string, handlerName: string): Promise<void> {
    try {
      // 移除处理器
      this.handlers.delete(handlerName);

      // 取消订阅RabbitMQ
      await this.rabbitmqService.unsubscribe(topic);

      this.logger.debug(`取消订阅成功: ${topic}`);
    } catch (error) {
      this.logger.error(
        `取消订阅失败: ${topic}`,
        error instanceof Error ? error.stack : undefined,
        {
          topic,
          handlerName,
        },
      );
      throw error;
    }
  }

  /**
   * 确认消息
   *
   * @param messageId - 消息ID
   */
  async ackMessage(messageId: string): Promise<void> {
    try {
      // 确认消息到RabbitMQ
      await this.rabbitmqService.ackMessage(messageId);

      // 清除缓存
      if (this.config.enableCache) {
        await this.clearMessageCache(messageId);
      }

      this.logger.debug(`确认消息成功: ${messageId}`);
    } catch (error) {
      this.logger.error(
        `确认消息失败: ${messageId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 拒绝消息
   *
   * @param messageId - 消息ID
   * @param requeue - 是否重新入队
   */
  async nackMessage(messageId: string, requeue = false): Promise<void> {
    try {
      // 拒绝消息到RabbitMQ
      await this.rabbitmqService.nackMessage(messageId, requeue);

      this.logger.debug(`拒绝消息成功: ${messageId}`);
    } catch (error) {
      this.logger.error(
        `拒绝消息失败: ${messageId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 获取队列统计信息
   *
   * @param topic - 主题名称
   * @returns 队列统计信息
   */
  async getQueueStatistics(topic: string): Promise<{
    messageCount: number;
    consumerCount: number;
    publishedCount: number;
    consumedCount: number;
    errorCount: number;
  }> {
    try {
      // 获取队列统计信息从RabbitMQ
      const stats = await this.rabbitmqService.getQueueStats(`${topic}.queue`);

      return {
        messageCount: stats.messageCount,
        consumerCount: stats.consumerCount,
        publishedCount: 0, // 需要额外的统计逻辑
        consumedCount: 0, // 需要额外的统计逻辑
        errorCount: 0, // 需要额外的统计逻辑
      };
    } catch (error) {
      this.logger.error(
        `获取队列统计信息失败: ${topic}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 清理过期消息
   *
   * @returns 清理的消息数量
   */
  async cleanupExpiredMessages(): Promise<number> {
    try {
      // 清理所有队列的过期消息
      let totalCleaned = 0;

      for (const [handlerName] of this.handlers) {
        const cleaned = await this.rabbitmqService.cleanupExpiredMessages(
          `${handlerName}.queue`,
        );
        totalCleaned += cleaned;
      }

      this.logger.debug("清理过期消息完成", { totalCleaned });
      return totalCleaned;
    } catch (error) {
      this.logger.error(
        "清理过期消息失败",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 序列化消息
   */
  private serializeMessage(message: any): any {
    let data = message;

    if (this.config.enableCompression) {
      data = this.compressData(data);
    }

    if (this.config.enableEncryption) {
      data = this.encryptData(data);
    }

    return data;
  }

  /**
   * 反序列化消息
   */
  private deserializeMessage(data: any): any {
    let message = data;

    if (this.config.enableEncryption) {
      message = this.decryptData(message);
    }

    if (this.config.enableCompression) {
      message = this.decompressData(message);
    }

    return message;
  }

  /**
   * 压缩数据
   */
  private compressData(data: any): any {
    // 实现数据压缩逻辑
    return data;
  }

  /**
   * 解压缩数据
   */
  private decompressData(data: any): any {
    // 实现数据解压缩逻辑
    return data;
  }

  /**
   * 加密数据
   */
  private encryptData(data: any): any {
    // 实现数据加密逻辑
    return data;
  }

  /**
   * 解密数据
   */
  private decryptData(data: any): any {
    // 实现数据解密逻辑
    return data;
  }

  /**
   * 重试消息
   */
  private async retryMessage(
    message: IMessage,
    options: IMessageSubscriptionOptions,
  ): Promise<void> {
    const retryMessage = {
      ...message,
      retryCount: message.retryCount + 1,
    };

    // 延迟重试
    await this.delay(this.config.retryDelay * message.retryCount);

    // 重新发布消息
    await this.publish(options.queueName, retryMessage.payload, {
      messageType: message.messageType,
      metadata: message.metadata,
      tenantId: message.tenantId,
      userId: message.userId,
    });

    this.logger.debug(`重试消息: ${message.messageId}`);
  }

  /**
   * 发送到死信队列
   */
  private async sendToDeadLetterQueue(
    message: IMessage,
    error: Error,
  ): Promise<void> {
    const deadLetterMessage = {
      ...message,
      metadata: {
        ...message.metadata,
        originalError: error.message,
        deadLetterTimestamp: new Date(),
      },
    };

    await this.publish("dead-letter-queue", deadLetterMessage.payload, {
      messageType: `DeadLetter:${message.messageType}`,
      metadata: deadLetterMessage.metadata,
      tenantId: message.tenantId,
      userId: message.userId,
    });

    this.logger.warn(`发送到死信队列: ${message.messageId}`);
  }

  /**
   * 延迟执行
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 缓存消息
   */
  private async cacheMessage(
    messageId: string,
    message: IMessage,
  ): Promise<void> {
    const cacheKey = this.getMessageCacheKey(messageId);
    await this.cacheService.set(
      "message-queue",
      cacheKey,
      message,
      this.config.cacheTtl,
    );
  }

  /**
   * 清除消息缓存
   */
  private async clearMessageCache(messageId: string): Promise<void> {
    const cacheKey = this.getMessageCacheKey(messageId);
    await this.cacheService.del("message-queue", cacheKey);
  }

  /**
   * 获取消息缓存键
   */
  private getMessageCacheKey(messageId: string): string {
    return `message:${messageId}`;
  }
}
