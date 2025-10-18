/**
 * 组织事件处理器
 *
 * @description 处理组织相关的领域事件，包括创建、更新、删除、激活、停用等
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
 * // 组织创建事件处理器
 * const organizationCreatedEventHandler = new OrganizationCreatedEventHandler(
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
import { OrganizationCreatedEvent } from "../../../domain/events/organization/organization-created.event.js";
import { OrganizationUpdatedEvent } from "../../../domain/events/organization/organization-updated.event.js";
import { OrganizationDeletedEvent } from "../../../domain/events/organization/organization-deleted.event.js";
import { OrganizationActivatedEvent } from "../../../domain/events/organization/organization-activated.event.js";
import { OrganizationDeactivatedEvent } from "../../../domain/events/organization/organization-deactivated.event.js";

// 外部服务接口
import type { IEmailService } from "../ports/email-service.interface.js";
import type { IAuditService } from "../ports/audit-service.interface.js";
import type { INotificationService } from "../ports/notification-service.interface.js";

/**
 * 组织创建事件处理器
 *
 * @description 处理OrganizationCreatedEvent，发送通知邮件并记录审计日志
 */
@EventsHandler(OrganizationCreatedEvent)
export class OrganizationCreatedEventHandler implements IEventHandler<OrganizationCreatedEvent> {
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("OrganizationCreatedEventHandler initialized");
  }

  async handle(event: OrganizationCreatedEvent): Promise<void> {
    this.logger.info(`处理组织创建事件: ${event.organizationId.toString()}`);

    try {
      // 1. 发送通知邮件
      await this.sendOrganizationCreatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logOrganizationCreation(event);

      // 3. 发送系统通知
      await this.notificationService.sendOrganizationCreatedNotification(event);

      this.logger.info(`组织创建事件处理成功: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理组织创建事件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 根据业务需求，可能需要重试或发送到死信队列
      throw error;
    }
  }

  /**
   * 发送组织创建通知邮件
   *
   * @param event - 组织创建事件
   * @private
   */
  private async sendOrganizationCreatedNotification(event: OrganizationCreatedEvent): Promise<void> {
    try {
      // 发送给组织管理员
      await this.emailService.sendOrganizationCreatedEmail(
        event.organizationName,
        event.organizationType,
        event.createdBy,
      );

      this.logger.debug(`组织创建通知邮件已发送: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送组织创建通知邮件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 组织更新事件处理器
 *
 * @description 处理OrganizationUpdatedEvent，记录审计日志并发送通知
 */
@EventsHandler(OrganizationUpdatedEvent)
export class OrganizationUpdatedEventHandler implements IEventHandler<OrganizationUpdatedEvent> {
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("OrganizationUpdatedEventHandler initialized");
  }

  async handle(event: OrganizationUpdatedEvent): Promise<void> {
    this.logger.info(`处理组织更新事件: ${event.organizationId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logOrganizationUpdate(event);

      // 2. 发送系统通知
      await this.notificationService.sendOrganizationUpdatedNotification(event);

      this.logger.info(`组织更新事件处理成功: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理组织更新事件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 组织删除事件处理器
 *
 * @description 处理OrganizationDeletedEvent，记录审计日志并发送通知
 */
@EventsHandler(OrganizationDeletedEvent)
export class OrganizationDeletedEventHandler implements IEventHandler<OrganizationDeletedEvent> {
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("OrganizationDeletedEventHandler initialized");
  }

  async handle(event: OrganizationDeletedEvent): Promise<void> {
    this.logger.info(`处理组织删除事件: ${event.organizationId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logOrganizationDeletion(event);

      // 2. 发送系统通知
      await this.notificationService.sendOrganizationDeletedNotification(event);

      this.logger.info(`组织删除事件处理成功: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理组织删除事件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 组织激活事件处理器
 *
 * @description 处理OrganizationActivatedEvent，发送激活通知并记录审计日志
 */
@EventsHandler(OrganizationActivatedEvent)
export class OrganizationActivatedEventHandler implements IEventHandler<OrganizationActivatedEvent> {
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("OrganizationActivatedEventHandler initialized");
  }

  async handle(event: OrganizationActivatedEvent): Promise<void> {
    this.logger.info(`处理组织激活事件: ${event.organizationId.toString()}`);

    try {
      // 1. 发送激活通知邮件
      await this.sendOrganizationActivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logOrganizationActivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendOrganizationActivatedNotification(event);

      this.logger.info(`组织激活事件处理成功: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理组织激活事件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送组织激活通知邮件
   *
   * @param event - 组织激活事件
   * @private
   */
  private async sendOrganizationActivatedNotification(event: OrganizationActivatedEvent): Promise<void> {
    try {
      // 发送给组织管理员
      await this.emailService.sendOrganizationActivatedEmail(
        event.organizationName,
        event.activatedBy,
      );

      this.logger.debug(`组织激活通知邮件已发送: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送组织激活通知邮件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 组织停用事件处理器
 *
 * @description 处理OrganizationDeactivatedEvent，发送停用通知并记录审计日志
 */
@EventsHandler(OrganizationDeactivatedEvent)
export class OrganizationDeactivatedEventHandler implements IEventHandler<OrganizationDeactivatedEvent> {
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("OrganizationDeactivatedEventHandler initialized");
  }

  async handle(event: OrganizationDeactivatedEvent): Promise<void> {
    this.logger.info(`处理组织停用事件: ${event.organizationId.toString()}`);

    try {
      // 1. 发送停用通知邮件
      await this.sendOrganizationDeactivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logOrganizationDeactivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendOrganizationDeactivatedNotification(event);

      this.logger.info(`组织停用事件处理成功: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `处理组织停用事件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送组织停用通知邮件
   *
   * @param event - 组织停用事件
   * @private
   */
  private async sendOrganizationDeactivatedNotification(event: OrganizationDeactivatedEvent): Promise<void> {
    try {
      // 发送给组织管理员
      await this.emailService.sendOrganizationDeactivatedEmail(
        event.organizationName,
        event.deactivatedBy,
        event.deactivateReason,
      );

      this.logger.debug(`组织停用通知邮件已发送: ${event.organizationId.toString()}`);
    } catch (error) {
      this.logger.error(
        `发送组织停用通知邮件失败: ${event.organizationId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}
