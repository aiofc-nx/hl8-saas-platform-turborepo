/**
 * 基础聚合根类
 *
 * 聚合根是领域驱动设计中的核心概念，是聚合的入口点，负责维护聚合内部的一致性边界。
 * 聚合根封装了业务规则，管理聚合内部实体的生命周期，并发布领域事件。
 *
 * ## 业务规则
 *
 * ### 一致性边界规则
 * - 聚合根是聚合内部一致性的保证者
 * - 聚合内部的所有变更都必须通过聚合根进行
 * - 聚合根负责维护业务不变量的完整性
 * - 跨聚合的交互只能通过聚合根进行
 *
 * ### 领域事件规则
 * - 聚合根负责收集和发布领域事件
 * - 领域事件在聚合状态变更时自动生成
 * - 事件发布是事务性操作，确保最终一致性
 * - 事件版本与聚合版本保持同步
 *
 * ### 版本控制规则
 * - 聚合根维护版本号用于乐观锁控制
 * - 每次状态变更时版本号自动递增
 * - 版本号用于并发控制和冲突检测
 * - 支持事件的版本演化管理
 *
 * ### 多租户规则
 * - 聚合根必须属于特定的租户
 * - 租户信息在聚合生命周期内不可变更
 * - 支持跨租户的聚合隔离
 * - 租户信息用于数据访问控制
 *
 * ### 生命周期规则
 * - 聚合根支持完整的生命周期管理
 * - 包括创建、更新、删除、恢复等操作
 * - 每个生命周期阶段都有相应的事件发布
 * - 支持软删除和硬删除两种模式
 *
 * @description 所有聚合根的基类，提供聚合根的一致行为
 * @example
 * ```typescript
 * class User extends BaseAggregateRoot {
 *   private _email: string;
 *   private _name: string;
 *   private _isActive: boolean = true;
 *
 *   constructor(
 *     id: EntityId,
 *     email: string,
 *     name: string,
 *     auditInfo: IPartialAuditInfo
 *   ) {
 *     super(id, auditInfo);
 *     this._email = email;
 *     this._name = name;
 *     this.addDomainEvent(new UserCreatedEvent(id, this.version, this.tenantId, id, email, name));
 *   }
 *
 *   updateEmail(newEmail: string): void {
 *     if (this._email === newEmail) {
 *       return;
 *     }
 *     this._email = newEmail;
 *     this.addDomainEvent(new UserEmailUpdatedEvent(this.id, this.version, this.tenantId, newEmail));
 *   }
 *
 *   deactivate(): void {
 *     if (!this._isActive) {
 *       return;
 *     }
 *     this._isActive = false;
 *     this.addDomainEvent(new UserDeactivatedEvent(this.id, this.version, this.tenantId));
 *   }
 *
 *   get email(): string {
 *     return this._email;
 *   }
 *
 *   get name(): string {
 *     return this._name;
 *   }
 *
 *   get isActive(): boolean {
 *     return this._isActive;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
import { BaseEntity } from "../../entities/base/base-entity.js";
import { BaseDomainEvent } from "../../events/base/base-domain-event.js";
import { EntityId } from "@hl8/isolation-model";
import { IPartialAuditInfo } from "../../entities/base/audit-info.js";
// import { any } from '@hl8/nestjs-isolation'; // TODO: 需要实现
import type { IPureLogger } from "@hl8/pure-logger";
import { IAggregateRoot } from "./aggregate-root.interface.js";

export abstract class BaseAggregateRoot
  extends BaseEntity
  implements IAggregateRoot
{
  private _domainEvents: BaseDomainEvent[] = [];
  private _uncommittedEvents: BaseDomainEvent[] = [];

  /**
   * 构造函数
   *
   * @param id - 聚合根唯一标识符
   * @param auditInfo - 审计信息，可以是完整的或部分的
   * @param logger - 日志记录器，可选
   */
  protected constructor(
    id: EntityId,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);
  }

  /**
   * 获取所有领域事件
   *
   * @returns 领域事件列表
   */
  public get domainEvents(): readonly BaseDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * 获取未提交的领域事件
   *
   * @returns 未提交的领域事件列表
   */
  public get uncommittedEvents(): readonly BaseDomainEvent[] {
    return [...this._uncommittedEvents];
  }

  /**
   * 添加领域事件
   *
   * 将领域事件添加到聚合根的事件列表中。
   * 事件将在聚合根提交时发布。
   * 自动绑定多租户上下文信息。
   *
   * @param event - 要添加的领域事件
   */
  public addDomainEvent(event: BaseDomainEvent): void {
    if (!event) {
      throw new Error("Domain event cannot be null or undefined");
    }

    // 尝试绑定多租户上下文信息
    try {
      const tenantContext = (this as any).getTenantContext?.() || {
        tenantId: "default",
      };
      if (tenantContext) {
        // 如果事件支持租户上下文，则绑定相关信息
        if ("tenantId" in event && !event.tenantId) {
          (event as any).tenantId = tenantContext.tenantId;
        }
        if ("userId" in event && !event.userId && tenantContext.userId) {
          (event as any).userId = tenantContext.userId;
        }
        if (
          "requestId" in event &&
          !event.requestId &&
          tenantContext.requestId
        ) {
          (event as any).requestId = tenantContext.requestId;
        }
      }
    } catch (error) {
      // 如果绑定上下文失败，记录警告但不影响事件添加
      console.warn("Failed to bind tenant context to domain event:", error);
    }

    this._domainEvents.push(event);
    this._uncommittedEvents.push(event);

    // 记录事件添加日志
    (this as any).logOperation?.("DomainEventAdded", {
      eventType: event.constructor.name,
      eventId: event.eventId.toString(),
      aggregateId: this.id.toString(),
      eventCount: this._domainEvents.length,
    });
  }

  /**
   * 移除领域事件
   *
   * 从聚合根的事件列表中移除指定的领域事件。
   *
   * @param event - 要移除的领域事件
   */
  protected removeDomainEvent(event: BaseDomainEvent): void {
    if (!event) {
      return;
    }

    const domainEventIndex = this._domainEvents.indexOf(event);
    if (domainEventIndex > -1) {
      this._domainEvents.splice(domainEventIndex, 1);
    }

    const uncommittedEventIndex = this._uncommittedEvents.indexOf(event);
    if (uncommittedEventIndex > -1) {
      this._uncommittedEvents.splice(uncommittedEventIndex, 1);
    }
  }

  /**
   * 清除所有领域事件
   *
   * 清除聚合根中的所有领域事件。
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
    this._uncommittedEvents = [];
  }

  /**
   * 清除未提交的领域事件
   *
   * 清除聚合根中的未提交领域事件。
   * 通常在事件发布后调用。
   */
  public clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  /**
   * 获取未提交的领域事件
   *
   * @description 返回聚合根产生的所有未提交的领域事件
   * 这些事件将在聚合根保存时被发布
   *
   * @returns 未提交的领域事件数组
   */
  public getUncommittedEvents(): BaseDomainEvent[] {
    return [...this._uncommittedEvents];
  }

  /**
   * 清除未提交的领域事件
   *
   * @description 清除所有未提交的领域事件，通常在事件发布完成后调用
   * 这个方法应该在事件成功发布到事件总线后调用
   */
  public clearEvents(): void {
    this._uncommittedEvents = [];
  }

  /**
   * 标记事件为已提交
   *
   * @description 标记所有未提交的领域事件为已提交状态（实际执行清除）
   * 这是 clearUncommittedEvents() 的语义化别名方法，
   * 用于在事件发布到事件总线后调用，表明事件已被处理
   *
   * ## 业务规则
   *
   * ### 调用时机
   * - 事件成功保存到事件存储后
   * - 事件成功发布到事件总线后
   * - 聚合根状态持久化完成后
   *
   * ### 使用场景
   * - Event Sourcing: 事件存储保存成功后调用
   * - Event-Driven Architecture: 事件发布成功后调用
   * - CQRS: 命令处理完成后调用
   *
   * @example
   * ```typescript
   * // 在命令处理器中使用
   * const events = aggregate.getUncommittedEvents();
   * await this.eventStore.saveEvents(aggregateId, events);
   * await this.eventBus.publishAll(events);
   * aggregate.markEventsAsCommitted(); // 标记事件为已提交
   * ```
   *
   * @since 1.0.0
   */
  public markEventsAsCommitted(): void {
    this.clearUncommittedEvents();
  }

  /**
   * 检查是否有未提交的事件
   *
   * @returns 如果有未提交的事件则返回 true，否则返回 false
   */
  public hasUncommittedEvents(): boolean {
    return this._uncommittedEvents.length > 0;
  }

  /**
   * 检查是否有领域事件
   *
   * @returns 如果有领域事件则返回 true，否则返回 false
   */
  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * 获取指定类型的事件
   *
   * @param eventType - 事件类型名称
   * @returns 指定类型的事件列表
   */
  public getEventsOfType(eventType: string): BaseDomainEvent[] {
    return this._domainEvents.filter((event) => event.isOfType(eventType));
  }

  /**
   * 获取未提交的指定类型事件
   *
   * @param eventType - 事件类型名称
   * @returns 未提交的指定类型事件列表
   */
  public getUncommittedEventsOfType(eventType: string): BaseDomainEvent[] {
    return this._uncommittedEvents.filter((event) => event.isOfType(eventType));
  }

  /**
   * 检查是否有指定类型的事件
   *
   * @param eventType - 事件类型名称
   * @returns 如果有指定类型的事件则返回 true，否则返回 false
   */
  public hasEventOfType(eventType: string): boolean {
    return this._domainEvents.some((event) => event.isOfType(eventType));
  }

  /**
   * 检查是否有未提交的指定类型事件
   *
   * @param eventType - 事件类型名称
   * @returns 如果有未提交的指定类型事件则返回 true，否则返回 false
   */
  public hasUncommittedEventOfType(eventType: string): boolean {
    return this._uncommittedEvents.some((event) => event.isOfType(eventType));
  }

  /**
   * 获取最新的事件
   *
   * @returns 最新的事件，如果没有事件则返回 undefined
   */
  public getLatestEvent(): BaseDomainEvent | undefined {
    if (this._domainEvents.length === 0) {
      return undefined;
    }

    return this._domainEvents[this._domainEvents.length - 1];
  }

  /**
   * 获取最新的未提交事件
   *
   * @returns 最新的未提交事件，如果没有未提交事件则返回 undefined
   */
  public getLatestUncommittedEvent(): BaseDomainEvent | undefined {
    if (this._uncommittedEvents.length === 0) {
      return undefined;
    }

    return this._uncommittedEvents[this._uncommittedEvents.length - 1];
  }

  /**
   * 获取事件数量
   *
   * @returns 事件总数
   */
  public getEventCount(): number {
    return this._domainEvents.length;
  }

  /**
   * 获取未提交事件数量
   *
   * @returns 未提交事件数量
   */
  public getUncommittedEventCount(): number {
    return this._uncommittedEvents.length;
  }

  /**
   * 标记聚合根为已修改
   *
   * 在聚合根状态发生变更时调用此方法。
   * 子类应该重写此方法以实现具体的状态更新逻辑。
   *
   * @protected
   */
  protected markAsModified(): void {
    (this as any).updateTimestamp?.();
  }

  /**
   * 应用领域事件
   *
   * 将领域事件应用到聚合根的状态上。
   * 子类应该重写此方法以实现具体的事件应用逻辑。
   *
   * @param event - 要应用的领域事件
   * @protected
   */
  protected applyEvent(_event: BaseDomainEvent): void {
    // 子类实现具体的事件应用逻辑
  }

  /**
   * 重放领域事件
   *
   * 从事件存储中重放历史事件来重建聚合根状态。
   * 子类应该重写此方法以实现具体的事件重放逻辑。
   *
   * @param events - 要重放的事件列表
   * @protected
   */
  protected replayEvents(events: BaseDomainEvent[]): void {
    this.clearDomainEvents();

    for (const event of events) {
      this.applyEvent(event);
      this._domainEvents.push(event);
    }
  }

  /**
   * 将聚合根转换为 JSON 表示
   *
   * @returns JSON 表示
   */
  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      eventCount: this.getEventCount(),
      uncommittedEventCount: this.getUncommittedEventCount(),
      hasUncommittedEvents: this.hasUncommittedEvents(),
    };
  }

  /**
   * 获取聚合根的字符串表示
   *
   * @returns 字符串表示
   */
  public override toString(): string {
    return `${
      this.constructor.name
    }(${this.id.toString()}) - Events: ${this.getEventCount()}, Uncommitted: ${this.getUncommittedEventCount()}`;
  }

  /**
   * 检查聚合根是否为新创建的
   *
   * @description 检查聚合根是否是新创建的（尚未持久化）
   * 这个信息对于仓储模式的实现很重要
   *
   * @returns 如果是新创建的返回true，否则返回false
   */
  public override isNew(): boolean {
    return this.getVersion() === 1 && this._domainEvents.length === 0;
  }
}
