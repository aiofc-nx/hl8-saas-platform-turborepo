/**
 * 消息队列模块异常处理使用示例
 *
 * @description 展示如何在消息队列模块中使用统一的异常处理机制
 * 包括异常抛出、捕获、自定义异常过滤器等场景
 *
 * @example
 * ```typescript
 * import { MessagingModule } from '@hl8/messaging';
 * import { ExceptionModule } from '@hl8/common/exceptions';
 * import { Module, Injectable } from '@nestjs/common';
 * import {
 *   MessagingService,
 *   MessagingConnectionException,
 *   MessagingPublishException,
 *   MessagingTenantIsolationException,
 * } from '@hl8/messaging';
 *
 * // 配置消息队列模块（自动集成异常处理）
 * @Module({
 *   imports: [
 *     MessagingModule.forRoot({
 *       adapter: 'rabbitmq',
 *       rabbitmq: {
 *         url: 'amqp://localhost:5672',
 *       },
 *       documentationUrl: 'https://docs.hl8.com/messaging/errors',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // 在服务中使用异常处理
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly messagingService: MessagingService) {}
 *
 *   async createUser(userData: any) {
 *     try {
 *       // 业务逻辑
 *       const user = await this.saveUser(userData);
 *
 *       // 发布用户创建事件
 *       await this.messagingService.publish('user.created', {
 *         id: user.id,
 *         email: user.email,
 *         createdAt: user.createdAt,
 *       });
 *
 *       return user;
 *     } catch (error) {
 *       // 捕获并重新抛出标准化异常
 *       if (error instanceof MessagingPublishException) {
 *         // 消息发布失败，记录详细错误信息
 *         this.logger.error('用户事件发布失败', {
 *           userId: userData.id,
 *           error: error.getExceptionInfo(),
 *         });
 *         // 可以选择重试或降级处理
 *       }
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */

import { Injectable } from "@nestjs/common";
import { PinoLogger } from "@hl8/logger";
import { MessagingService } from "../lib/messaging.service";
import {
  MessagingConnectionException,
  MessagingPublishException,
  MessagingConfigException,
  MessagingSerializationException,
} from "../lib/exceptions/messaging.exceptions";

/**
 * 消息队列异常处理示例服务
 *
 * @description 展示各种异常处理场景的最佳实践
 */
@Injectable()
export class MessagingExceptionExampleService {
  private readonly logger = new PinoLogger();

  constructor(private readonly messagingService: MessagingService) {}

  /**
   * 连接异常处理示例
   */
  async handleConnectionErrors(): Promise<void> {
    try {
      await this.messagingService.connect();
    } catch (error) {
      if (error instanceof MessagingConnectionException) {
        this.logger.error("消息队列连接失败", {
          errorCode: error.errorCode,
          detail: error.detail,
          data: error.data,
        });

        // 可以根据错误类型进行不同的处理
        if (
          (error.data as Record<string, unknown>)?.["adapterType"] ===
          "rabbitmq"
        ) {
          this.logger.warn("RabbitMQ连接失败，尝试切换到Redis适配器");
          // 实现适配器切换逻辑
        }
      }
      throw error;
    }
  }

  /**
   * 消息发布异常处理示例
   */
  async handlePublishErrors(): Promise<void> {
    try {
      await this.messagingService.publish("user.created", {
        id: "user-123",
        email: "user@example.com",
      });
    } catch (error) {
      if (error instanceof MessagingPublishException) {
        this.logger.error("消息发布失败", {
          topic: (error.data as Record<string, unknown>)?.["topic"],
          tenantId: (error.data as Record<string, unknown>)?.["tenantId"],
          errorCode: error.errorCode,
        });

        // 实现重试逻辑
        await this.retryPublish("user.created", {
          id: "user-123",
          email: "user@example.com",
        });
      }
      throw error;
    }
  }

  /**
   * 租户隔离异常处理示例
   */
  async handleTenantIsolationErrors(): Promise<void> {
    try {
      // 尝试跨租户访问
      await this.messagingService.publish("tenant.sensitive.topic", {
        data: "sensitive-data",
      });
    } catch (error) {
      if (error instanceof MessagingSerializationException) {
        this.logger.warn("租户隔离违规", {
          tenantId: (error.data as Record<string, unknown>)?.["tenantId"],
          resource: (error.data as Record<string, unknown>)?.["resource"],
          errorCode: error.errorCode,
        });

        // 记录安全事件
        await this.logSecurityEvent({
          type: "tenant_isolation_violation",
          tenantId: (error.data as Record<string, unknown>)?.["tenantId"] as
            | string
            | undefined,
          resource: (error.data as Record<string, unknown>)?.["resource"] as
            | string
            | undefined,
          timestamp: new Date(),
        });
      }
      throw error;
    }
  }

  /**
   * 配置异常处理示例
   */
  async handleConfigErrors(): Promise<void> {
    try {
      // 使用无效配置
      await this.messagingService.publish("test.topic", { data: "test" });
    } catch (error) {
      if (error instanceof MessagingConfigException) {
        this.logger.error("配置错误", {
          missingField: (error.data as Record<string, unknown>)?.[
            "missingField"
          ],
          errorCode: error.errorCode,
        });

        // 提供配置修复建议
        const suggestions = this.getConfigSuggestions(
          (error.data as Record<string, unknown>)?.["missingField"] as
            | string
            | undefined,
        );
        this.logger.info("配置修复建议", { suggestions });
      }
      throw error;
    }
  }

  /**
   * 序列化异常处理示例
   */
  async handleSerializationErrors(): Promise<void> {
    try {
      // 尝试发布无法序列化的消息
      const circularObject: Record<string, unknown> = {};
      (circularObject as any).self = circularObject;

      await this.messagingService.publish("test.circular", circularObject);
    } catch (error) {
      if (error instanceof MessagingSerializationException) {
        this.logger.error("消息序列化失败", {
          messageType: (error.data as Record<string, unknown>)?.["messageType"],
          originalError: (error.data as Record<string, unknown>)?.[
            "originalError"
          ],
          errorCode: error.errorCode,
        });

        // 实现消息清理逻辑
        const cleanedMessage = this.cleanMessage({ id: "test", data: "test" });
        await this.messagingService.publish("test.cleaned", cleanedMessage);
      }
      throw error;
    }
  }

  /**
   * 综合异常处理示例
   */
  async handleMultipleErrors(): Promise<void> {
    const errors = [];

    // 尝试多个操作，收集所有错误
    try {
      await this.messagingService.connect();
    } catch (error) {
      errors.push({ operation: "connect", error });
    }

    try {
      await this.messagingService.publish("test.topic", { data: "test" });
    } catch (error) {
      errors.push({ operation: "publish", error });
    }

    try {
      await this.messagingService.consume("test.queue", async (_message) => {
        // 处理消息
      });
    } catch (error) {
      errors.push({ operation: "consume", error });
    }

    // 统一处理所有错误
    if (errors.length > 0) {
      this.logger.error("多个操作失败", {
        errorCount: errors.length,
        errors: errors.map((e) => ({
          operation: e.operation,
          errorCode: e.error instanceof Error ? e.error.message : "unknown",
        })),
      });

      // 根据错误类型决定是否继续
      const criticalErrors = errors.filter(
        (e) =>
          e.error instanceof MessagingConnectionException ||
          e.error instanceof MessagingConfigException,
      );

      if (criticalErrors.length > 0) {
        throw new Error("关键操作失败，无法继续执行");
      }
    }
  }

  // 辅助方法
  private async retryPublish(topic: string, _message: unknown): Promise<void> {
    // 实现重试逻辑
    this.logger.info("重试发布消息", { topic });
  }

  private async logSecurityEvent(event: {
    type: string;
    tenantId?: string;
    resource?: string;
    timestamp: Date;
  }): Promise<void> {
    // 实现安全事件记录逻辑
    this.logger.warn("安全事件记录", event);
  }

  private getConfigSuggestions(missingField?: string): string[] {
    const suggestions: Record<string, string[]> = {
      "rabbitmq.url": ["配置RabbitMQ连接URL", "检查RabbitMQ服务状态"],
      "redis.host": ["配置Redis主机地址", "检查Redis服务状态"],
      "kafka.brokers": ["配置Kafka代理地址", "检查Kafka集群状态"],
    };

    return (
      suggestions[missingField || ""] || [
        "检查配置文件",
        "查看文档获取配置说明",
      ]
    );
  }

  private cleanMessage(message: unknown): unknown {
    // 实现消息清理逻辑，移除循环引用等
    return JSON.parse(JSON.stringify(message));
  }
}
