/**
 * 租户事件处理器
 *
 * @description 处理租户相关的领域事件，包括创建、更新、删除、激活、停用等
 *
 * ## 业务规则
 *
 * ### 事件处理规则
 * - 事件处理器负责处理领域事件
 * - 事件处理器不包含业务逻辑，只负责副作用处理
 * - 事件处理器负责异常处理和日志记录
 * - 事件处理器支持重试机制
 *
 * ### 副作用处理规则
 * - 发送通知邮件
 * - 记录审计日志
 * - 更新统计信息
 * - 触发其他业务流程
 *
 * @example
 * ```typescript
 * // 租户创建事件处理器
 * const tenantCreatedEventHandler = new TenantCreatedEventHandler(
 *   emailService,
 *   auditService,
 *   notificationService,
 *   logger
 * );
 * ```
 *
 * @since 1.0.0
 */

import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 领域事件
import { TenantCreatedEvent } from "../../../domain/events/tenant/tenant-created.event.js";
import { TenantUpdatedEvent } from "../../../domain/events/tenant/tenant-updated.event.js";
import { TenantDeletedEvent } from "../../../domain/events/tenant/tenant-deleted.event.js";
import { TenantActivatedEvent } from "../../../domain/events/tenant/tenant-activated.event.js";
import { TenantDeactivatedEvent } from "../../../domain/events/tenant/tenant-deactivated.event.js";

// 外部服务接口
import type { IEmailService } from "../ports/email-service.interface.js";
import type { IAuditService } from "../ports/audit-service.interface.js";
import type { INotificationService } from "../ports/notification-service.interface.js";

/**
 * 租户创建事件处理器
 *
 * @description 处理TenantCreatedEvent，发送通知邮件并记录审计日志
 */
@EventsHandler(TenantCreatedEvent)
export class TenantCreatedEventHandler
  implements IEventHandler<TenantCreatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("TenantCreatedEventHandler initialized");
  }

  async handle(event: TenantCreatedEvent): Promise<void> {
    this.logger.info(`处理租户创建事件: ${event.tenantId.toString()}`);

    try {
      // 1. 发送通知邮件
      await this.sendTenantCreatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logTenantCreation(event);

      // 3. 发送系统通知
      await this.notificationService.sendTenantCreatedNotification(event);

      this.logger.info(`租户创建事件处理成功: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理租户创建事件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 根据业务需求，可能需要重试或发送到死信队列
      throw error;
    }
  }

  /**
   * 发送租户创建通知邮件
   *
   * @param event - 租户创建事件
   * @private
   */
  private async sendTenantCreatedNotification(
    event: TenantCreatedEvent,
  ): Promise<void> {
    try {
      // 发送给租户管理员
      await this.emailService.sendTenantCreatedEmail(
        event.tenantName,
        event.tenantType,
        event.createdBy,
      );

      this.logger.debug(`租户创建通知邮件已发送: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送租户创建通知邮件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 租户更新事件处理器
 *
 * @description 处理TenantUpdatedEvent，记录审计日志并发送通知
 */
@EventsHandler(TenantUpdatedEvent)
export class TenantUpdatedEventHandler
  implements IEventHandler<TenantUpdatedEvent>
{
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("TenantUpdatedEventHandler initialized");
  }

  async handle(event: TenantUpdatedEvent): Promise<void> {
    this.logger.info(`处理租户更新事件: ${event.tenantId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logTenantUpdate(event);

      // 2. 发送系统通知
      await this.notificationService.sendTenantUpdatedNotification(event);

      this.logger.info(`租户更新事件处理成功: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理租户更新事件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 租户删除事件处理器
 *
 * @description 处理TenantDeletedEvent，记录审计日志并发送通知
 */
@EventsHandler(TenantDeletedEvent)
export class TenantDeletedEventHandler
  implements IEventHandler<TenantDeletedEvent>
{
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("TenantDeletedEventHandler initialized");
  }

  async handle(event: TenantDeletedEvent): Promise<void> {
    this.logger.info(`处理租户删除事件: ${event.tenantId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logTenantDeletion(event);

      // 2. 发送系统通知
      await this.notificationService.sendTenantDeletedNotification(event);

      this.logger.info(`租户删除事件处理成功: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理租户删除事件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 租户激活事件处理器
 *
 * @description 处理TenantActivatedEvent，发送激活通知并记录审计日志
 */
@EventsHandler(TenantActivatedEvent)
export class TenantActivatedEventHandler
  implements IEventHandler<TenantActivatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("TenantActivatedEventHandler initialized");
  }

  async handle(event: TenantActivatedEvent): Promise<void> {
    this.logger.info(`处理租户激活事件: ${event.tenantId.toString()}`);

    try {
      // 1. 发送激活通知邮件
      await this.sendTenantActivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logTenantActivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendTenantActivatedNotification(event);

      this.logger.info(`租户激活事件处理成功: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理租户激活事件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送租户激活通知邮件
   *
   * @param event - 租户激活事件
   * @private
   */
  private async sendTenantActivatedNotification(
    event: TenantActivatedEvent,
  ): Promise<void> {
    try {
      // 发送给租户管理员
      await this.emailService.sendTenantActivatedEmail(
        event.tenantName,
        event.tenantType,
        event.activatedBy,
      );

      this.logger.debug(`租户激活通知邮件已发送: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送租户激活通知邮件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 租户停用事件处理器
 *
 * @description 处理TenantDeactivatedEvent，发送停用通知并记录审计日志
 */
@EventsHandler(TenantDeactivatedEvent)
export class TenantDeactivatedEventHandler
  implements IEventHandler<TenantDeactivatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("TenantDeactivatedEventHandler initialized");
  }

  async handle(event: TenantDeactivatedEvent): Promise<void> {
    this.logger.info(`处理租户停用事件: ${event.tenantId.toString()}`);

    try {
      // 1. 发送停用通知邮件
      await this.sendTenantDeactivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logTenantDeactivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendTenantDeactivatedNotification(event);

      this.logger.info(`租户停用事件处理成功: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理租户停用事件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送租户停用通知邮件
   *
   * @param event - 租户停用事件
   * @private
   */
  private async sendTenantDeactivatedNotification(
    event: TenantDeactivatedEvent,
  ): Promise<void> {
    try {
      // 发送给租户管理员
      await this.emailService.sendTenantDeactivatedEmail(
        event.tenantName,
        event.tenantType,
        event.deactivatedBy,
        event.deactivateReason,
      );

      this.logger.debug(`租户停用通知邮件已发送: ${event.tenantId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送租户停用通知邮件失败: ${event.tenantId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}
