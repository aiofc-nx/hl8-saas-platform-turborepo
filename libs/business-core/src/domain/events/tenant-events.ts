import { EntityId } from "@hl8/isolation-model";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { BaseDomainEvent } from "../events/base/base-domain-event.js";

/**
 * 租户创建事件
 *
 * @description 当租户被创建时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发条件
 * - 租户聚合根成功创建
 * - 租户数据已持久化到数据库
 * - 租户状态为活跃状态
 *
 * ### 事件数据规则
 * - 事件必须包含完整的租户信息
 * - 事件必须包含创建者信息
 * - 事件必须包含平台信息
 * - 事件时间戳必须准确
 *
 * ### 事件处理规则
 * - 事件处理器应该幂等
 * - 事件处理失败不应该影响主要业务流程
 * - 事件应该支持重试机制
 *
 * @example
 * ```typescript
 * // 事件发布
 * const event = new TenantCreatedEvent(
 *   tenantId,
 *   version,
 *   platformId,
 *   "企业租户",
 *   TenantType.ENTERPRISE,
 *   platformId
 * );
 * await eventBus.publish(event);
 *
 * // 事件处理
 * @EventHandler(TenantCreatedEvent)
 * async handleTenantCreated(event: TenantCreatedEvent) {
 *   // 发送欢迎邮件
 *   // 初始化租户配置
 *   // 创建默认组织架构
 * }
 * ```
 *
 * @since 1.0.0
 */
export class TenantCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly name: string,
    public readonly type: TenantType,
    public readonly platformId: EntityId,
  ) {
    super(aggregateId, version, tenantId);
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型标识
   */
  get eventType(): string {
    return "TenantCreated";
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据对象
   */
  get eventData(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type.toString(),
      platformId: this.platformId.toString(),
    };
  }
}

/**
 * 租户更新事件
 *
 * @description 当租户信息被更新时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发条件
 * - 租户基本信息发生变更
 * - 租户类型发生变更
 * - 租户配置发生变更
 *
 * ### 事件数据规则
 * - 事件必须包含变更前后的值
 * - 事件必须包含更新者信息
 * - 事件必须包含变更时间
 *
 * @example
 * ```typescript
 * // 事件发布
 * const event = new TenantUpdatedEvent(
 *   tenantId,
 *   version,
 *   tenantId,
 *   "新企业租户",
 *   TenantType.ENTERPRISE
 * );
 * await eventBus.publish(event);
 * ```
 *
 * @since 1.0.0
 */
export class TenantUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly name: string,
    public readonly type: TenantType,
  ) {
    super(aggregateId, version, tenantId);
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型标识
   */
  get eventType(): string {
    return "TenantUpdated";
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据对象
   */
  get eventData(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type.toString(),
    };
  }
}

/**
 * 租户删除事件
 *
 * @description 当租户被删除时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发条件
 * - 租户被软删除
 * - 租户被硬删除
 * - 租户被禁用
 *
 * ### 事件数据规则
 * - 事件必须包含删除原因
 * - 事件必须包含删除者信息
 * - 事件必须包含删除时间
 *
 * @example
 * ```typescript
 * // 事件发布
 * const event = new TenantDeletedEvent(
 *   tenantId,
 *   version,
 *   tenantId,
 *   "管理员删除",
 *   "admin"
 * );
 * await eventBus.publish(event);
 * ```
 *
 * @since 1.0.0
 */
export class TenantDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly reason: string,
    public readonly deletedBy: string,
  ) {
    super(aggregateId, version, tenantId);
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型标识
   */
  get eventType(): string {
    return "TenantDeleted";
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据对象
   */
  get eventData(): Record<string, unknown> {
    return {
      reason: this.reason,
      deletedBy: this.deletedBy,
    };
  }
}

/**
 * 租户状态变更事件
 *
 * @description 当租户状态发生变更时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发条件
 * - 租户从活跃状态变为禁用状态
 * - 租户从禁用状态变为活跃状态
 * - 租户从活跃状态变为锁定状态
 *
 * ### 事件数据规则
 * - 事件必须包含变更前后的状态
 * - 事件必须包含状态变更原因
 * - 事件必须包含操作者信息
 *
 * @example
 * ```typescript
 * // 事件发布
 * const event = new TenantStatusChangedEvent(
 *   tenantId,
 *   version,
 *   tenantId,
 *   "ACTIVE",
 *   "DISABLED",
 *   "管理员禁用",
 *   "admin"
 * );
 * await eventBus.publish(event);
 * ```
 *
 * @since 1.0.0
 */
export class TenantStatusChangedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly reason: string,
    public readonly changedBy: string,
  ) {
    super(aggregateId, version, tenantId);
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型标识
   */
  get eventType(): string {
    return "TenantStatusChanged";
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据对象
   */
  get eventData(): Record<string, unknown> {
    return {
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      reason: this.reason,
      changedBy: this.changedBy,
    };
  }
}
