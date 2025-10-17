import { EntityId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { Tenant } from "../entities/tenant/tenant.entity.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import type { IPureLogger } from "@hl8/pure-logger";
import { BaseDomainEvent } from "../events/base/base-domain-event.js";
import { BusinessRuleFactory } from "../rules/business-rule-factory.js";
import { BusinessRuleManager } from "../rules/business-rule-manager.js";
import { UsernameValidator } from "../validators/common/username.validator.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { InvalidTenantNameException, TenantStateException } from "../exceptions/business-exceptions.js";

/**
 * 租户创建事件
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

  get eventType(): string {
    return "TenantCreated";
  }
}

/**
 * 租户更新事件
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

  get eventType(): string {
    return "TenantUpdated";
  }
}

/**
 * 租户删除事件
 */
export class TenantDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly deletedBy: string,
    public readonly deleteReason?: string,
  ) {
    super(aggregateId, version, tenantId);
  }

  get eventType(): string {
    return "TenantDeleted";
  }
}

/**
 * 租户聚合根
 *
 * @description 管理租户的生命周期和业务规则，作为租户聚合的入口点。
 * 负责维护租户的一致性边界，协调租户相关的业务操作，并发布领域事件。
 *
 * ## 业务规则
 *
 * ### 租户创建规则
 * - 租户必须属于某个平台
 * - 租户名称在同一平台内必须唯一
 * - 租户类型确定后不可变更
 * - 租户创建时自动发布TenantCreatedEvent
 *
 * ### 租户更新规则
 * - 只有租户管理员可以更新租户信息
 * - 租户名称更新需要验证唯一性
 * - 租户类型变更需要特殊权限
 * - 租户更新时发布TenantUpdatedEvent
 *
 * ### 租户删除规则
 * - 只有平台管理员可以删除租户
 * - 删除前需要验证租户下是否有活跃用户
 * - 租户删除采用软删除方式
 * - 租户删除时发布TenantDeletedEvent
 *
 * ### 租户一致性规则
 * - 聚合内部的所有实体必须属于同一租户
 * - 跨聚合操作时必须验证租户一致性
 * - 租户信息变更需要记录审计日志
 * - 租户状态变更需要发布相应事件
 *
 * @example
 * ```typescript
 * // 创建租户聚合根
 * const tenantAggregate = new TenantAggregate(
 *   TenantId.generate(),
 *   {
 *     name: '企业租户',
 *     type: TenantType.ENTERPRISE,
 *     platformId: platformId
 *   },
 *   { tenantId: platformId, createdBy: 'admin' },
 *   logger
 * );
 *
 * // 更新租户名称
 * tenantAggregate.updateName('新企业租户', 'admin');
 *
 * // 删除租户
 * tenantAggregate.delete('admin', '租户不再需要');
 * ```
 *
 * @since 1.0.0
 */
export class TenantAggregate extends IsolationAwareAggregateRoot {
  private _tenant: Tenant;
  private _platformId: EntityId;
  private _ruleManager: BusinessRuleManager;
  private _exceptionFactory: ExceptionFactory;

  /**
   * 构造函数
   *
   * @param id - 聚合根唯一标识符
   * @param props - 租户属性
   * @param auditInfo - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    props: {
      name: string;
      type: TenantType;
      platformId: EntityId;
    },
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);

    this._ruleManager = BusinessRuleFactory.createTenantManager();
    this._exceptionFactory = ExceptionFactory.getInstance();
    this._platformId = props.platformId;
    this._tenant = new Tenant(
      id,
      { name: props.name, type: props.type },
      auditInfo,
      logger,
    );

    // 发布租户创建事件
    this.publishIsolationEvent(
      (aggregateId, version, context) =>
        new TenantCreatedEvent(
          aggregateId,
          version,
          context,
          props.name,
          props.type,
          props.platformId,
        ),
    );
  }

  /**
   * 获取租户实体
   *
   * @returns 租户实体
   */
  get tenant(): Tenant {
    return this._tenant;
  }

  /**
   * 获取平台ID
   *
   * @returns 平台ID
   */
  get platformId(): EntityId {
    return this._platformId;
  }

  /**
   * 更新租户名称
   *
   * @description 更新租户的名称，需要验证名称的唯一性
   *
   * @param name - 新的租户名称
   * @param updatedBy - 更新者标识符
   *
   * @throws {Error} 当名称为空或无效时
   */
  public updateName(name: string, updatedBy: string): void {
    this.ensureIsolationContext();

    // 使用验证器进行格式验证
    const validatorResult = UsernameValidator.validateFormat(name, {
      minLength: 3,
      maxLength: 100,
      allowNumbers: true,
      allowSpecialChars: false,
      checkReservedWords: true
    });
    
    if (!validatorResult.isValid) {
      throw this._exceptionFactory.createInvalidTenantName(name, validatorResult.errors.join(', '));
    }
    
    // 使用业务规则进行业务逻辑验证
    const ruleResult = this._ruleManager.validateRule('TENANT_NAME_RULE', name);
    if (!ruleResult.isValid) {
      throw this._exceptionFactory.createInvalidTenantName(name, ruleResult.errorMessage || '租户名称验证失败');
    }

    const oldName = this._tenant.name;
    this._tenant.rename(name);

    // 发布租户更新事件
    this.publishIsolationEvent(
      (aggregateId, version, tenantId) =>
        new TenantUpdatedEvent(
          aggregateId,
          version,
          tenantId,
          name,
          this._tenant.type,
        ),
    );

    // 记录操作日志
    this.logIsolationOperation("租户名称已更新", {
      oldName,
      newName: name,
      updatedBy,
      operation: "update-name",
    });
  }

  /**
   * 更新租户类型
   *
   * @description 更新租户的类型，需要特殊权限
   *
   * @param type - 新的租户类型
   * @param updatedBy - 更新者标识符
   *
   * @throws {Error} 当类型无效时
   */
  public updateType(type: TenantType, updatedBy: string): void {
    this.ensureIsolationContext();

    const oldType = this._tenant.type;
    this._tenant.changeType(type);

    // 发布租户更新事件
    this.publishIsolationEvent(
      (aggregateId, version, tenantId) =>
        new TenantUpdatedEvent(
          aggregateId,
          version,
          tenantId,
          this._tenant.name,
          type,
        ),
    );

    // 记录操作日志
    this.logIsolationOperation("租户类型已更新", {
      oldType: oldType.toString(),
      newType: type.toString(),
      updatedBy,
      operation: "update-type",
    });
  }

  /**
   * 删除租户
   *
   * @description 软删除租户，需要平台管理员权限
   *
   * @param deletedBy - 删除者标识符
   * @param deleteReason - 删除原因
   *
   * @throws {Error} 当租户已被删除时
   */
  public delete(deletedBy: string, deleteReason?: string): void {
    this.ensureIsolationContext();

    if (this._tenant.isDeleted) {
      throw this._exceptionFactory.createDomainState("租户已被删除", "deleted", "delete", { tenantId: this._tenant.id.value });
    }

    // 软删除租户
    this._tenant.markAsDeleted(deletedBy, deleteReason);

    // 发布租户删除事件
    this.publishIsolationEvent(
      (aggregateId, version, tenantId) =>
        new TenantDeletedEvent(
          aggregateId,
          version,
          tenantId,
          deletedBy,
          deleteReason,
        ),
    );

    // 记录操作日志
    this.logIsolationOperation("租户已删除", {
      deletedBy,
      deleteReason,
      operation: "delete",
    });
  }

  /**
   * 恢复租户
   *
   * @description 恢复已删除的租户
   *
   * @param restoredBy - 恢复者标识符
   */
  public restore(restoredBy: string): void {
    this.ensureIsolationContext();

    if (!this._tenant.isDeleted) {
      throw this._exceptionFactory.createDomainState("租户未被删除", "active", "restore", { tenantId: this._tenant.id.value });
    }

    // 恢复租户
    this._tenant.restore(restoredBy);

    // 发布租户更新事件
    this.publishIsolationEvent(
      (aggregateId, version, tenantId) =>
        new TenantUpdatedEvent(
          aggregateId,
          version,
          tenantId,
          this._tenant.name,
          this._tenant.type,
        ),
    );

    // 记录操作日志
    this.logIsolationOperation("租户已恢复", {
      restoredBy,
      operation: "restore",
    });
  }

  /**
   * 检查租户是否属于指定平台
   *
   * @param platformId - 平台ID
   * @returns 如果属于指定平台返回true，否则返回false
   */
  public belongsToPlatform(platformId: EntityId): boolean {
    return this._platformId.equals(platformId);
  }

  /**
   * 获取租户状态信息
   *
   * @returns 租户状态信息
   */
  public getStatus(): {
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      isActive: !this._tenant.isDeleted,
      isDeleted: this._tenant.isDeleted,
      createdAt: this._tenant.createdAt,
      updatedAt: this._tenant.updatedAt,
    };
  }

  /**
   * 获取业务规则管理器
   *
   * @returns 业务规则管理器
   */
  public getRuleManager(): BusinessRuleManager {
    return this._ruleManager;
  }

  /**
   * 验证租户名称
   *
   * @param name - 租户名称
   * @returns 验证结果
   */
  public validateTenantName(name: string): { isValid: boolean; errorMessage?: string } {
    const result = this._ruleManager.validateRule('TENANT_NAME_RULE', name);
    return {
      isValid: result.isValid,
      errorMessage: result.errorMessage,
    };
  }

  /**
   * 将聚合根转换为数据对象
   *
   * @returns 包含租户信息的数据对象
   */
  public override toData(): Record<string, unknown> {
    return {
      ...super.toData(),
      platformId: this._platformId.toString(),
      tenant: {
        name: this._tenant.name,
        type: this._tenant.type.toString(),
        isDeleted: this._tenant.isDeleted,
        createdAt: this._tenant.createdAt,
        updatedAt: this._tenant.updatedAt,
      },
    };
  }

  /**
   * 获取聚合根的字符串表示
   *
   * @returns 字符串表示
   */
  public override toString(): string {
    return `TenantAggregate(${this.id.toString()}) - ${this._tenant.name} (${this._tenant.type.toString()})`;
  }
}
