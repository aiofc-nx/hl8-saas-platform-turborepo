/**
 * 用户事件处理器
 *
 * @description 处理用户相关的领域事件，包括用户创建、更新、删除等事件
 *
 * ## 业务规则
 *
 * ### 事件处理规则
 * - 事件处理应该是幂等的
 * - 事件处理应该是异步的
 * - 事件处理失败应该有重试机制
 * - 事件处理应该有超时机制
 *
 * ### 事件处理职责
 * - 处理领域事件
 * - 执行业务逻辑
 * - 发布后续事件
 * - 记录处理日志
 *
 * ### 错误处理规则
 * - 事件处理失败应该记录错误日志
 * - 事件处理失败应该支持重试
 * - 事件处理失败应该支持死信队列
 * - 事件处理失败不应该影响其他处理器
 *
 * @example
 * ```typescript
 * // 用户创建事件处理器
 * const handler = new UserCreatedEventHandler(emailService, auditService, logger);
 * 
 * // 处理用户创建事件
 * await handler.handle(userCreatedEvent);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { IEventHandler } from "../../../ports/event-handler.interface.js";
import type { DomainEvent } from "../../../../domain/events/base/domain-event.js";

// 事件类型（需要根据实际的事件类型进行调整）
import type { UserCreatedEvent } from "../../../../domain/events/user/user-created.event.js";
import type { UserUpdatedEvent } from "../../../../domain/events/user/user-updated.event.js";
import type { UserDeletedEvent } from "../../../../domain/events/user/user-deleted.event.js";
import type { UserActivatedEvent } from "../../../../domain/events/user/user-activated.event.js";
import type { UserDeactivatedEvent } from "../../../../domain/events/user/user-deactivated.event.js";

// 服务接口
import type { IEmailService } from "../../../ports/email-service.interface.js";
import type { IAuditService } from "../../../ports/audit-service.interface.js";
import type { INotificationService } from "../../../ports/notification-service.interface.js";

/**
 * 用户创建事件处理器
 *
 * @description 处理用户创建事件，包括发送欢迎邮件、记录审计日志等
 */
export class UserCreatedEventHandler implements IEventHandler {
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   */
  async handle(event: DomainEvent): Promise<void> {
    if (!this.supportsEventType(event.constructor.name)) {
      return;
    }

    const userCreatedEvent = event as UserCreatedEvent;

    try {
      this.logger.info("开始处理用户创建事件", {
        userId: userCreatedEvent.userId.toString(),
        email: userCreatedEvent.email,
        username: userCreatedEvent.username,
      });

      // 1. 发送欢迎邮件
      await this.sendWelcomeEmail(userCreatedEvent);

      // 2. 记录审计日志
      await this.logUserCreation(userCreatedEvent);

      // 3. 发送通知
      await this.sendNotification(userCreatedEvent);

      this.logger.info("用户创建事件处理成功", {
        userId: userCreatedEvent.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户创建事件处理失败", {
        error: error.message,
        userId: userCreatedEvent.userId.toString(),
      });
      throw error;
    }
  }

  /**
   * 发送欢迎邮件
   *
   * @param event - 用户创建事件
   * @private
   */
  private async sendWelcomeEmail(event: UserCreatedEvent): Promise<void> {
    try {
      await this.emailService.sendWelcomeEmail(event.email, event.username);
      this.logger.debug("欢迎邮件发送成功", { email: event.email });
    } catch (error) {
      this.logger.error("欢迎邮件发送失败", {
        error: error.message,
        email: event.email,
      });
      // 邮件发送失败不应该影响事件处理
    }
  }

  /**
   * 记录用户创建审计日志
   *
   * @param event - 用户创建事件
   * @private
   */
  private async logUserCreation(event: UserCreatedEvent): Promise<void> {
    try {
      await this.auditService.logUserCreation({
        userId: event.userId,
        email: event.email,
        username: event.username,
        createdAt: event.createdAt,
        createdBy: event.createdBy,
      });
      this.logger.debug("用户创建审计日志记录成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户创建审计日志记录失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
      // 审计日志记录失败不应该影响事件处理
    }
  }

  /**
   * 发送通知
   *
   * @param event - 用户创建事件
   * @private
   */
  private async sendNotification(event: UserCreatedEvent): Promise<void> {
    try {
      await this.notificationService.sendUserCreatedNotification({
        userId: event.userId,
        email: event.email,
        username: event.username,
      });
      this.logger.debug("用户创建通知发送成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户创建通知发送失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
      // 通知发送失败不应该影响事件处理
    }
  }

  /**
   * 获取支持的事件类型
   *
   * @returns 支持的事件类型列表
   */
  getSupportedEventTypes(): string[] {
    return ["UserCreatedEvent"];
  }

  /**
   * 检查是否支持事件类型
   *
   * @param eventType - 事件类型
   * @returns 是否支持
   */
  supportsEventType(eventType: string): boolean {
    return this.getSupportedEventTypes().includes(eventType);
  }

  /**
   * 获取处理器名称
   *
   * @returns 处理器名称
   */
  getName(): string {
    return "UserCreatedEventHandler";
  }

  /**
   * 获取处理器优先级
   *
   * @returns 优先级
   */
  getPriority(): number {
    return 1; // 高优先级
  }
}

/**
 * 用户更新事件处理器
 *
 * @description 处理用户更新事件，包括发送更新通知、记录审计日志等
 */
export class UserUpdatedEventHandler implements IEventHandler {
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   */
  async handle(event: DomainEvent): Promise<void> {
    if (!this.supportsEventType(event.constructor.name)) {
      return;
    }

    const userUpdatedEvent = event as UserUpdatedEvent;

    try {
      this.logger.info("开始处理用户更新事件", {
        userId: userUpdatedEvent.userId.toString(),
        updatedBy: userUpdatedEvent.updatedBy,
      });

      // 1. 记录审计日志
      await this.logUserUpdate(userUpdatedEvent);

      // 2. 发送通知
      await this.sendNotification(userUpdatedEvent);

      this.logger.info("用户更新事件处理成功", {
        userId: userUpdatedEvent.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户更新事件处理失败", {
        error: error.message,
        userId: userUpdatedEvent.userId.toString(),
      });
      throw error;
    }
  }

  /**
   * 记录用户更新审计日志
   *
   * @param event - 用户更新事件
   * @private
   */
  private async logUserUpdate(event: UserUpdatedEvent): Promise<void> {
    try {
      await this.auditService.logUserUpdate({
        userId: event.userId,
        updatedBy: event.updatedBy,
        updatedAt: event.updatedAt,
        changes: event.changes,
      });
      this.logger.debug("用户更新审计日志记录成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户更新审计日志记录失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
    }
  }

  /**
   * 发送通知
   *
   * @param event - 用户更新事件
   * @private
   */
  private async sendNotification(event: UserUpdatedEvent): Promise<void> {
    try {
      await this.notificationService.sendUserUpdatedNotification({
        userId: event.userId,
        updatedBy: event.updatedBy,
        changes: event.changes,
      });
      this.logger.debug("用户更新通知发送成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户更新通知发送失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
    }
  }

  getSupportedEventTypes(): string[] {
    return ["UserUpdatedEvent"];
  }

  supportsEventType(eventType: string): boolean {
    return this.getSupportedEventTypes().includes(eventType);
  }

  getName(): string {
    return "UserUpdatedEventHandler";
  }

  getPriority(): number {
    return 2; // 中等优先级
  }
}

/**
 * 用户删除事件处理器
 *
 * @description 处理用户删除事件，包括发送删除通知、记录审计日志等
 */
export class UserDeletedEventHandler implements IEventHandler {
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   */
  async handle(event: DomainEvent): Promise<void> {
    if (!this.supportsEventType(event.constructor.name)) {
      return;
    }

    const userDeletedEvent = event as UserDeletedEvent;

    try {
      this.logger.info("开始处理用户删除事件", {
        userId: userDeletedEvent.userId.toString(),
        deletedBy: userDeletedEvent.deletedBy,
        deleteReason: userDeletedEvent.deleteReason,
      });

      // 1. 记录审计日志
      await this.logUserDeletion(userDeletedEvent);

      // 2. 发送通知
      await this.sendNotification(userDeletedEvent);

      this.logger.info("用户删除事件处理成功", {
        userId: userDeletedEvent.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户删除事件处理失败", {
        error: error.message,
        userId: userDeletedEvent.userId.toString(),
      });
      throw error;
    }
  }

  /**
   * 记录用户删除审计日志
   *
   * @param event - 用户删除事件
   * @private
   */
  private async logUserDeletion(event: UserDeletedEvent): Promise<void> {
    try {
      await this.auditService.logUserDeletion({
        userId: event.userId,
        deletedBy: event.deletedBy,
        deletedAt: event.deletedAt,
        deleteReason: event.deleteReason,
      });
      this.logger.debug("用户删除审计日志记录成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户删除审计日志记录失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
    }
  }

  /**
   * 发送通知
   *
   * @param event - 用户删除事件
   * @private
   */
  private async sendNotification(event: UserDeletedEvent): Promise<void> {
    try {
      await this.notificationService.sendUserDeletedNotification({
        userId: event.userId,
        deletedBy: event.deletedBy,
        deleteReason: event.deleteReason,
      });
      this.logger.debug("用户删除通知发送成功", {
        userId: event.userId.toString(),
      });
    } catch (error) {
      this.logger.error("用户删除通知发送失败", {
        error: error.message,
        userId: event.userId.toString(),
      });
    }
  }

  getSupportedEventTypes(): string[] {
    return ["UserDeletedEvent"];
  }

  supportsEventType(eventType: string): boolean {
    return this.getSupportedEventTypes().includes(eventType);
  }

  getName(): string {
    return "UserDeletedEventHandler";
  }

  getPriority(): number {
    return 3; // 低优先级
  }
}
