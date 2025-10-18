/**
 * 部门事件处理器
 *
 * @description 处理部门相关的领域事件，包括创建、更新、删除、激活、停用等
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
 * // 部门创建事件处理器
 * const departmentCreatedEventHandler = new DepartmentCreatedEventHandler(
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
import { DepartmentCreatedEvent } from "../../../domain/events/department/department-created.event.js";
import { DepartmentUpdatedEvent } from "../../../domain/events/department/department-updated.event.js";
import { DepartmentDeletedEvent } from "../../../domain/events/department/department-deleted.event.js";
import { DepartmentActivatedEvent } from "../../../domain/events/department/department-activated.event.js";
import { DepartmentDeactivatedEvent } from "../../../domain/events/department/department-deactivated.event.js";

// 外部服务接口
import type { IEmailService } from "../ports/email-service.interface.js";
import type { IAuditService } from "../ports/audit-service.interface.js";
import type { INotificationService } from "../ports/notification-service.interface.js";

/**
 * 部门创建事件处理器
 *
 * @description 处理DepartmentCreatedEvent，发送通知邮件并记录审计日志
 */
@EventsHandler(DepartmentCreatedEvent)
export class DepartmentCreatedEventHandler
  implements IEventHandler<DepartmentCreatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("DepartmentCreatedEventHandler initialized");
  }

  async handle(event: DepartmentCreatedEvent): Promise<void> {
    this.logger.info(`处理部门创建事件: ${event.departmentId.toString()}`);

    try {
      // 1. 发送通知邮件
      await this.sendDepartmentCreatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logDepartmentCreation(event);

      // 3. 发送系统通知
      await this.notificationService.sendDepartmentCreatedNotification(event);

      this.logger.info(
        `部门创建事件处理成功: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `处理部门创建事件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 根据业务需求，可能需要重试或发送到死信队列
      throw error;
    }
  }

  /**
   * 发送部门创建通知邮件
   *
   * @param event - 部门创建事件
   * @private
   */
  private async sendDepartmentCreatedNotification(
    event: DepartmentCreatedEvent,
  ): Promise<void> {
    try {
      // 发送给部门管理员
      await this.emailService.sendDepartmentCreatedEmail(
        event.departmentName,
        event.departmentLevel,
        event.organizationName,
        event.createdBy,
      );

      this.logger.debug(
        `部门创建通知邮件已发送: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `发送部门创建通知邮件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 部门更新事件处理器
 *
 * @description 处理DepartmentUpdatedEvent，记录审计日志并发送通知
 */
@EventsHandler(DepartmentUpdatedEvent)
export class DepartmentUpdatedEventHandler
  implements IEventHandler<DepartmentUpdatedEvent>
{
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("DepartmentUpdatedEventHandler initialized");
  }

  async handle(event: DepartmentUpdatedEvent): Promise<void> {
    this.logger.info(`处理部门更新事件: ${event.departmentId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logDepartmentUpdate(event);

      // 2. 发送系统通知
      await this.notificationService.sendDepartmentUpdatedNotification(event);

      this.logger.info(
        `部门更新事件处理成功: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `处理部门更新事件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 部门删除事件处理器
 *
 * @description 处理DepartmentDeletedEvent，记录审计日志并发送通知
 */
@EventsHandler(DepartmentDeletedEvent)
export class DepartmentDeletedEventHandler
  implements IEventHandler<DepartmentDeletedEvent>
{
  constructor(
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("DepartmentDeletedEventHandler initialized");
  }

  async handle(event: DepartmentDeletedEvent): Promise<void> {
    this.logger.info(`处理部门删除事件: ${event.departmentId.toString()}`);

    try {
      // 1. 记录审计日志
      await this.auditService.logDepartmentDeletion(event);

      // 2. 发送系统通知
      await this.notificationService.sendDepartmentDeletedNotification(event);

      this.logger.info(
        `部门删除事件处理成功: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `处理部门删除事件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }
}

/**
 * 部门激活事件处理器
 *
 * @description 处理DepartmentActivatedEvent，发送激活通知并记录审计日志
 */
@EventsHandler(DepartmentActivatedEvent)
export class DepartmentActivatedEventHandler
  implements IEventHandler<DepartmentActivatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("DepartmentActivatedEventHandler initialized");
  }

  async handle(event: DepartmentActivatedEvent): Promise<void> {
    this.logger.info(`处理部门激活事件: ${event.departmentId.toString()}`);

    try {
      // 1. 发送激活通知邮件
      await this.sendDepartmentActivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logDepartmentActivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendDepartmentActivatedNotification(event);

      this.logger.info(
        `部门激活事件处理成功: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `处理部门激活事件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送部门激活通知邮件
   *
   * @param event - 部门激活事件
   * @private
   */
  private async sendDepartmentActivatedNotification(
    event: DepartmentActivatedEvent,
  ): Promise<void> {
    try {
      // 发送给部门管理员
      await this.emailService.sendDepartmentActivatedEmail(
        event.departmentName,
        event.organizationName,
        event.activatedBy,
      );

      this.logger.debug(
        `部门激活通知邮件已发送: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `发送部门激活通知邮件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}

/**
 * 部门停用事件处理器
 *
 * @description 处理DepartmentDeactivatedEvent，发送停用通知并记录审计日志
 */
@EventsHandler(DepartmentDeactivatedEvent)
export class DepartmentDeactivatedEventHandler
  implements IEventHandler<DepartmentDeactivatedEvent>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.debug("DepartmentDeactivatedEventHandler initialized");
  }

  async handle(event: DepartmentDeactivatedEvent): Promise<void> {
    this.logger.info(`处理部门停用事件: ${event.departmentId.toString()}`);

    try {
      // 1. 发送停用通知邮件
      await this.sendDepartmentDeactivatedNotification(event);

      // 2. 记录审计日志
      await this.auditService.logDepartmentDeactivation(event);

      // 3. 发送系统通知
      await this.notificationService.sendDepartmentDeactivatedNotification(
        event,
      );

      this.logger.info(
        `部门停用事件处理成功: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `处理部门停用事件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送部门停用通知邮件
   *
   * @param event - 部门停用事件
   * @private
   */
  private async sendDepartmentDeactivatedNotification(
    event: DepartmentDeactivatedEvent,
  ): Promise<void> {
    try {
      // 发送给部门管理员
      await this.emailService.sendDepartmentDeactivatedEmail(
        event.departmentName,
        event.organizationName,
        event.deactivatedBy,
        event.deactivateReason,
      );

      this.logger.debug(
        `部门停用通知邮件已发送: ${event.departmentId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `发送部门停用通知邮件失败: ${event.departmentId.toString()}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      // 邮件发送失败不应该阻止事件处理
    }
  }
}
