/**
 * 完整的消息队列使用示例
 *
 * 展示如何使用@hl8/messaging模块进行完整的消息队列操作。
 *
 * @description 此示例展示如何使用@hl8/messaging模块进行完整的消息队列操作。
 * 包括事件发布、任务处理、租户隔离、缓存集成等功能。
 * 专为SAAS平台设计，支持多租户架构和微服务架构。
 *
 * ## 业务规则
 *
 * ### 模块集成规则
 * - 支持消息队列模块集成
 * - 支持配置模块集成
 * - 支持多租户模块集成
 * - 支持缓存模块集成
 *
 * ### 功能演示规则
 * - 支持事件发布和订阅
 * - 支持任务处理和调度
 * - 支持租户隔离和上下文
 * - 支持缓存集成和监控
 *
 * ### 使用场景规则
 * - 支持用户管理场景
 * - 支持订单处理场景
 * - 支持通知发送场景
 * - 支持数据分析场景
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { MessagingConfigModule } from '@hl8/messaging';
 * import { MessagingModule } from '@hl8/messaging';
 *
 * @Module({
 *   imports: [
 *     MessagingConfigModule.forRoot({
 *       configPath: './config/messaging.yml',
 *     }),
 *     MessagingModule.forRootWithConfig(configService),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Injectable, Module } from "@nestjs/common";
// 移除ConfigService导入，使用直接注入配置类
import { MessagingConfigModule } from "../lib/config/messaging-config.module";
import { MessagingModule } from "../lib/messaging.module";
import { MessagingService } from "../lib/messaging.service";
import { EventService } from "../lib/event.service";
import { TaskService } from "../lib/task.service";
import {
  TenantContextService,
  TenantIsolationService,
} from "@hl8/multi-tenancy";
import { MessagingAdapterType } from "../lib/types/messaging.types";
import { MessagingConfig } from "../lib/config/messaging.config";
import { PinoLogger } from "@hl8/logger";

/**
 * 用户服务示例
 *
 * @description 展示如何在业务服务中使用消息队列
 */
@Injectable()
export class UserService {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly config: MessagingConfig,
    private readonly messagingService: MessagingService,
    private readonly eventService: EventService,
    private readonly taskService: TaskService,
    private readonly tenantContextService: TenantContextService,
    private readonly tenantIsolationService: TenantIsolationService,
  ) {
    this.logger.setContext({ requestId: "user-service" });
  }

  /**
   * 创建用户
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // 获取配置
      const config = this.config;

      // 创建用户
      const user = await this.saveUser(userData);

      // 发布用户创建事件
      await this.eventService.emit("user.created", {
        userId: user.id,
        email: user.email,
        createdAt: user.createdAt,
        tenantId: this.tenantContextService.getTenant(),
      });

      // 发送欢迎邮件任务
      await this.taskService.addTask("send-welcome-email", {
        userId: user.id,
        email: user.email,
        template: "welcome",
      });

      // 如果启用了消息去重，记录操作
      if (config?.cache?.enableMessageDeduplication) {
        await this.logMessageDeduplication("user.created", user.id);
      }

      this.logger.info("用户创建成功", {
        userId: user.id,
        email: user.email,
        tenantId: this.tenantContextService.getTenant(),
      });

      return user;
    } catch (error) {
      this.logger.error("用户创建失败", {
        error: (error as Error).message,
        userData,
      });
      throw error;
    }
  }

  /**
   * 更新用户
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      // 获取当前租户上下文
      const tenantId = this.tenantContextService.getTenant();

      // 更新用户
      const user = await this.saveUserUpdate(userId, updateData);

      // 发布用户更新事件
      await this.eventService.emit("user.updated", {
        userId: user.id,
        changes: updateData,
        updatedAt: user.updatedAt,
        tenantId,
      });

      this.logger.info("用户更新成功", {
        userId: user.id,
        tenantId,
        changes: Object.keys(updateData),
      });

      return user;
    } catch (error) {
      this.logger.error("用户更新失败", {
        error: (error as Error).message,
        userId,
        updateData,
      });
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      // 删除用户
      await this.removeUser(userId);

      // 发布用户删除事件
      await this.eventService.emit("user.deleted", {
        userId,
        deletedAt: new Date(),
        tenantId,
      });

      // 发送数据清理任务
      await this.taskService.addTask("cleanup-user-data", {
        userId,
        tenantId,
      });

      this.logger.info("用户删除成功", {
        userId,
        tenantId,
      });
    } catch (error) {
      this.logger.error("用户删除失败", {
        error: (error as Error).message,
        userId,
      });
      throw error;
    }
  }

  /**
   * 批量处理用户
   */
  async batchProcessUsers(userIds: string[]): Promise<BatchProcessResult> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      // 发布批量处理任务
      await this.taskService.addTask("batch-process-users", {
        userIds,
        tenantId,
        batchSize: 100,
        priority: "high",
      });

      // 生成任务ID用于跟踪
      const taskId = `batch-process-${Date.now()}`;

      this.logger.info("批量处理任务已发布", {
        taskId,
        userIdCount: userIds.length,
        tenantId,
      });

      return {
        taskId,
        userIdCount: userIds.length,
        status: "processing",
      };
    } catch (error) {
      this.logger.error("批量处理任务发布失败", {
        error: (error as Error).message,
        userIdCount: userIds.length,
      });
      throw error;
    }
  }

  private async saveUser(userData: CreateUserData): Promise<User> {
    // 模拟保存用户到数据库
    return {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async saveUserUpdate(
    userId: string,
    updateData: UpdateUserData,
  ): Promise<User> {
    // 模拟更新用户
    return {
      id: userId,
      email: updateData.email || "user@example.com",
      name: updateData.name || "User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async removeUser(userId: string): Promise<void> {
    // 模拟删除用户
    this.logger.info("用户已从数据库删除", { userId });
  }

  private async logMessageDeduplication(
    event: string,
    userId: string,
  ): Promise<void> {
    this.logger.info("消息去重记录", {
      event,
      userId,
      timestamp: new Date(),
    });
  }
}

/**
 * 邮件服务示例
 *
 * @description 展示如何处理异步任务
 */
@Injectable()
export class EmailService {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly taskService: TaskService,
    private readonly tenantContextService: TenantContextService,
  ) {
    this.logger.setContext({ requestId: "email-service" });
    this.setupTaskHandlers();
  }

  /**
   * 设置任务处理器
   */
  private setupTaskHandlers(): void {
    // 注意：TaskService使用装饰器模式注册处理器
    // 实际的任务处理器应该使用@TaskHandler装饰器定义
    // 例如：
    // @TaskHandler('send-welcome-email')
    // async handleWelcomeEmail(data: WelcomeEmailData): Promise<void> { ... }

    this.logger.info("任务处理器设置完成");
  }

  /**
   * 处理欢迎邮件任务
   */
  @TaskHandler("send-welcome-email")
  async handleWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      this.logger.info("开始发送欢迎邮件", {
        userId: data.userId,
        email: data.email,
        tenantId,
      });

      // 模拟发送邮件
      await this.sendEmail({
        to: data.email,
        subject: "欢迎加入我们的平台！",
        template: data.template,
        data: {
          userId: data.userId,
          tenantId,
        },
      });

      this.logger.info("欢迎邮件发送成功", {
        userId: data.userId,
        email: data.email,
        tenantId,
      });
    } catch (error) {
      this.logger.error("欢迎邮件发送失败", {
        error: (error as Error).message,
        data,
      });
      throw error;
    }
  }

  /**
   * 处理批量邮件任务
   */
  @TaskHandler("send-batch-emails")
  async handleBatchEmails(data: BatchEmailData): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      this.logger.info("开始批量发送邮件", {
        emailCount: data.emails.length,
        tenantId,
      });

      // 批量发送邮件
      const results = await Promise.allSettled(
        data.emails.map((email) => this.sendEmail(email)),
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failureCount = results.length - successCount;

      this.logger.info("批量邮件发送完成", {
        totalCount: data.emails.length,
        successCount,
        failureCount,
        tenantId,
      });
    } catch (error) {
      this.logger.error("批量邮件发送失败", {
        error: (error as Error).message,
        data,
      });
      throw error;
    }
  }

  private async sendEmail(emailData: EmailData): Promise<void> {
    // 模拟发送邮件
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.logger.info("邮件发送成功", { to: emailData.to });
  }
}

/**
 * 数据分析服务示例
 *
 * @description 展示如何监听和处理事件
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new PinoLogger();

  constructor(
    private readonly eventService: EventService,
    private readonly tenantContextService: TenantContextService,
  ) {
    this.logger.setContext({ requestId: "analytics-service" });
    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 注册用户事件处理器
    this.eventService.on("user.created", this.handleUserCreated.bind(this));
    this.eventService.on("user.updated", this.handleUserUpdated.bind(this));
    this.eventService.on("user.deleted", this.handleUserDeleted.bind(this));
  }

  /**
   * 处理用户创建事件
   */
  @EventHandler("user.created")
  async handleUserCreated(data: UserCreatedEvent): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      this.logger.info("处理用户创建事件", {
        userId: data.userId,
        tenantId,
      });

      // 更新用户统计
      await this.updateUserStats(tenantId || "default", "created", 1);

      // 记录用户行为
      await this.recordUserBehavior(data.userId, "account_created", {
        email: data.email,
        createdAt: data.createdAt,
      });

      this.logger.info("用户创建事件处理完成", {
        userId: data.userId,
        tenantId,
      });
    } catch (error) {
      this.logger.error("用户创建事件处理失败", {
        error: (error as Error).message,
        data,
      });
    }
  }

  /**
   * 处理用户更新事件
   */
  @EventHandler("user.updated")
  async handleUserUpdated(data: UserUpdatedEvent): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      this.logger.info("处理用户更新事件", {
        userId: data.userId,
        tenantId,
        changes: Object.keys(data.changes),
      });

      // 更新用户统计
      await this.updateUserStats(tenantId || "default", "updated", 1);

      // 记录用户行为
      await this.recordUserBehavior(data.userId, "profile_updated", {
        changes: data.changes,
        updatedAt: data.updatedAt,
      });

      this.logger.info("用户更新事件处理完成", {
        userId: data.userId,
        tenantId,
      });
    } catch (error) {
      this.logger.error("用户更新事件处理失败", {
        error: (error as Error).message,
        data,
      });
    }
  }

  /**
   * 处理用户删除事件
   */
  @EventHandler("user.deleted")
  async handleUserDeleted(data: UserDeletedEvent): Promise<void> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      this.logger.info("处理用户删除事件", {
        userId: data.userId,
        tenantId,
      });

      // 更新用户统计
      await this.updateUserStats(tenantId || "default", "deleted", 1);

      // 清理用户数据
      await this.cleanupUserData(data.userId);

      this.logger.info("用户删除事件处理完成", {
        userId: data.userId,
        tenantId,
      });
    } catch (error) {
      this.logger.error("用户删除事件处理失败", {
        error: (error as Error).message,
        data,
      });
    }
  }

  private async updateUserStats(
    tenantId: string,
    action: string,
    count: number,
  ): Promise<void> {
    // 模拟更新统计数据
    this.logger.info("更新用户统计", { tenantId, action, count });
  }

  private async recordUserBehavior(
    userId: string,
    action: string,
    data: unknown,
  ): Promise<void> {
    // 模拟记录用户行为
    this.logger.info("记录用户行为", { userId, action, data });
  }

  private async cleanupUserData(userId: string): Promise<void> {
    // 模拟清理用户数据
    this.logger.info("清理用户数据", { userId });
  }
}

/**
 * 应用模块示例
 *
 * @description 展示如何配置完整的消息队列模块
 */
@Module({
  imports: [
    // 配置模块 - 类型安全的配置管理
    MessagingConfigModule.forRoot({
      configPath: "./config/messaging.yml",
      envPrefix: "MESSAGING_",
      validate: true,
      cache: true,
    }),

    // 消息队列模块 - 使用配置
    MessagingModule.forRootWithConfig({
      adapter: MessagingAdapterType.RABBITMQ,
      enableTenantIsolation: true,
      cache: {
        enableMessageDeduplication: true,
        enableConsumerStateCache: true,
        enableDeadLetterCache: true,
        enableTenantConfigCache: true,
        enableStatsCache: true,
      },
    }),
  ],
  providers: [UserService, EmailService, AnalyticsService],
  exports: [UserService, EmailService, AnalyticsService],
})
export class MessagingUsageExampleModule {}

// 类型定义
interface CreateUserData {
  email: string;
  name: string;
}

interface UpdateUserData {
  email?: string;
  name?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BatchProcessResult {
  taskId: string;
  userIdCount: number;
  status: string;
}

interface WelcomeEmailData {
  userId: string;
  email: string;
  template: string;
}

interface BatchEmailData {
  emails: EmailData[];
}

interface EmailData {
  to: string;
  subject: string;
  template?: string;
  data?: unknown;
}

interface UserCreatedEvent {
  userId: string;
  email: string;
  createdAt: Date;
  tenantId?: string;
}

interface UserUpdatedEvent {
  userId: string;
  changes: UpdateUserData;
  updatedAt: Date;
  tenantId?: string;
}

interface UserDeletedEvent {
  userId: string;
  deletedAt: Date;
  tenantId?: string;
}

// 装饰器定义
function TaskHandler(_taskName: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) {
    // 装饰器实现
  };
}

function EventHandler(_eventName: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) {
    // 装饰器实现
  };
}
