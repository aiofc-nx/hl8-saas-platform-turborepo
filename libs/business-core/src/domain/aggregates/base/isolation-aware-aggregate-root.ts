/**
 * 隔离感知聚合根基类
 *
 * 为多租户SAAS应用提供完整的多层级数据隔离支持。
 * 所有需要数据隔离的聚合根都应继承此类。
 *
 * ## 通用功能
 *
 * ### 多层级隔离验证
 * - 平台级隔离：跨租户数据访问
 * - 租户级隔离：租户内数据访问
 * - 组织级隔离：组织内数据访问
 * - 部门级隔离：部门内数据访问
 * - 用户级隔离：用户私有数据访问
 *
 * ### 隔离上下文管理
 * - 自动获取当前隔离上下文
 * - 验证隔离级别是否满足要求
 * - 支持跨层级数据访问控制
 * - 提供隔离上下文验证方法
 *
 * ### 隔离事件管理
 * - 自动注入隔离上下文到领域事件
 * - 支持隔离级别的事件过滤
 * - 提供隔离级别的审计追踪
 *
 * ### 隔离日志管理
 * - 自动包含隔离上下文信息
 * - 支持隔离级别的日志过滤
 * - 提供隔离级别的操作审计
 *
 * @description 为多租户SAAS应用提供聚合根级别的完整数据隔离支持。
 * 整合 @hl8/isolation-model 的隔离上下文服务，提供多层级隔离验证、
 * 隔离事件发布、隔离日志记录等通用功能，为业务聚合根提供统一的数据隔离能力。
 *
 * ## 业务规则
 *
 * ### 隔离上下文规则
 * - 聚合根必须在隔离上下文中创建和操作
 * - 隔离上下文在聚合根生命周期内不可变更
 * - 隔离上下文验证应在操作入口统一执行
 * - 隔离上下文信息包含在所有日志和事件中
 *
 * ### 隔离一致性规则
 * - 聚合内部的所有实体必须属于同一隔离级别
 * - 跨聚合操作时必须验证隔离一致性
 * - 禁止跨隔离级别的数据访问和操作
 * - 隔离一致性检查应在业务逻辑执行前完成
 *
 * ### 隔离事件规则
 * - 所有领域事件必须包含隔离上下文
 * - 隔离事件自动注入聚合根ID、版本号、隔离上下文
 * - 隔离事件用于隔离级别的审计和追踪
 * - 隔离事件发布遵循事务一致性
 *
 * ### 隔离日志规则
 * - 所有隔离操作必须记录日志
 * - 日志包含隔离上下文、聚合根ID、操作类型等信息
 * - 日志用于审计、调试和性能分析
 * - 敏感信息不应出现在日志中
 *
 * ## 业务逻辑流程
 *
 * 1. **聚合根创建**：验证隔离上下文 → 创建聚合根实例 → 发布创建事件
 * 2. **业务操作**：验证隔离上下文 → 验证隔离一致性 → 执行业务逻辑 → 发布事件
 * 3. **跨聚合操作**：验证隔离一致性 → 协调聚合间交互 → 发布事件
 * 4. **隔离切换**：验证切换权限 → 更新隔离上下文 → 记录审计日志
 *
 * @example
 * ```typescript
 * // 租户聚合根示例
 * export class TenantAggregate extends IsolationAwareAggregateRoot {
 *   private _tenant: Tenant;
 *
 *   constructor(
 *     id: EntityId,
 *     tenant: Tenant,
 *     auditInfo: IPartialAuditInfo,
 *     logger?: IPureLogger
 *   ) {
 *     super(id, auditInfo, logger);
 *     this._tenant = tenant;
 *   }
 *
 *   public updateName(name: string, updatedBy: string): void {
 *     // ✅ 自动验证隔离上下文
 *     this.ensureIsolationContext();
 *
 *     // 执行业务逻辑
 *     this._tenant.updateName(name, updatedBy);
 *
 *     // ✅ 简化事件创建（自动注入隔离上下文）
 *     this.publishIsolationEvent((id, version, context) =>
 *       new TenantNameUpdatedEvent(id, version, context, name)
 *     );
 *   }
 *
 *   public addUser(userId: EntityId, userContext: IsolationContext): void {
 *     // ✅ 验证隔离一致性
 *     this.ensureSameIsolationLevel(userContext, 'User');
 *
 *     // 执行业务逻辑
 *     // ...
 *   }
 * }
 *
 * // 组织聚合根示例
 * export class OrganizationAggregate extends IsolationAwareAggregateRoot {
 *   public addDepartment(department: Department): void {
 *     // ✅ 验证组织级隔离
 *     this.ensureOrganizationLevel();
 *     this.ensureSameOrganization(department.organizationId);
 *
 *     // 执行业务逻辑
 *     this._departments.push(department);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import { IsolationContext, IsolationLevel } from "@hl8/isolation-model";
import { BaseAggregateRoot } from "./base-aggregate-root.js";
import { BaseDomainEvent } from "../../events/base/base-domain-event.js";
import { BusinessRuleViolationException } from "../../exceptions/base/base-domain-exception.js";
import { DomainPermissionException } from "../../exceptions/base/base-domain-exception.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../../entities/base/audit-info.js";

/**
 * 隔离感知聚合根基类
 *
 * @description 为多租户SAAS应用提供完整的多层级数据隔离支持
 */
export abstract class IsolationAwareAggregateRoot extends BaseAggregateRoot {
  private _isolationContext?: IsolationContext;

  /**
   * 构造函数
   *
   * @param id - 聚合根标识符
   * @param auditInfo - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);
  }

  /**
   * 设置隔离上下文
   *
   * @description 设置聚合根的隔离上下文，用于数据隔离验证
   *
   * @param context - 隔离上下文
   * @protected
   */
  protected setIsolationContext(context: IsolationContext): void {
    this._isolationContext = context;
  }

  /**
   * 确保隔离上下文存在
   *
   * @description 验证聚合根必须关联到有效的隔离上下文。
   * 此方法应在所有隔离敏感操作的入口处调用，确保操作在隔离上下文中执行。
   *
   * ## 业务规则
   *
   * ### 验证规则
   * - 隔离上下文不能为null或undefined
   * - 隔离上下文必须有效且完整
   * - 验证失败时抛出明确的异常，包含上下文信息
   *
   * ### 调用时机
   * - 聚合根构造函数中自动调用
   * - 所有隔离敏感操作的入口处调用
   * - 跨隔离级别操作前必须调用
   * - 可以在业务方法开始时调用以确保安全
   *
   * ### 异常处理
   * - 抛出 BusinessRuleViolationException 异常
   * - 异常消息清晰描述问题原因
   * - 异常详情包含聚合根类型和ID
   * - 便于调试和问题追踪
   *
   * @throws {BusinessRuleViolationException} 当隔离上下文无效时
   *
   * @protected
   *
   * @example
   * ```typescript
   * export class TenantAggregate extends IsolationAwareAggregateRoot {
   *   public updateTenant(name: string): void {
   *     // 确保在隔离上下文中执行
   *     this.ensureIsolationContext();
   *
   *     // 执行业务逻辑
   *     this._tenant.updateName(name);
   *   }
   * }
   * ```
   */
  protected ensureIsolationContext(): void {
    if (!this._isolationContext) {
      throw new BusinessRuleViolationException(
        "隔离上下文缺失，所有操作必须在隔离上下文中执行",
        "MISSING_ISOLATION_CONTEXT",
      );
    }
  }

  /**
   * 确保隔离级别满足要求
   *
   * @description 验证当前隔离级别是否满足所需的最低隔离级别。
   * 用于验证操作权限，确保数据访问符合隔离策略。
   *
   * ## 业务规则
   *
   * ### 隔离级别规则
   * - 平台级可以访问所有级别的数据
   * - 租户级可以访问租户内所有数据
   * - 组织级可以访问组织内所有数据
   * - 部门级可以访问部门内所有数据
   * - 用户级只能访问用户私有数据
   *
   * ### 验证规则
   * - 使用隔离级别枚举进行比较
   * - 高级别可以访问低级别数据
   * - 低级别不能访问高级别数据
   * - 验证失败时提供详细的错误信息
   *
   * ### 使用场景
   * - 数据访问权限验证
   * - 跨层级操作权限检查
   * - 业务规则中的权限验证
   * - 审计日志中的权限记录
   *
   * ### 异常处理
   * - 抛出 DomainPermissionException 异常
   * - 异常消息描述权限不足
   * - 异常详情包含当前级别和所需级别
   * - 支持审计和安全监控
   *
   * @param requiredLevel - 所需的最低隔离级别
   * @param operation - 操作描述（用于错误消息，可选）
   *
   * @throws {DomainPermissionException} 当隔离级别不满足要求时
   *
   * @protected
   *
   * @example
   * ```typescript
   * export class OrganizationAggregate extends IsolationAwareAggregateRoot {
   *   public addDepartment(department: Department): void {
   *     // 验证组织级隔离权限
   *     this.ensureIsolationLevel(IsolationLevel.ORGANIZATION, '添加部门');
   *
   *     // 执行业务逻辑
   *     this._departments.push(department);
   *   }
   * }
   * ```
   */
  protected ensureIsolationLevel(
    requiredLevel: IsolationLevel,
    operation: string = "操作",
  ): void {
    this.ensureIsolationContext();

    const currentLevel = this._isolationContext!.getIsolationLevel();

    // 平台级可以访问所有级别
    if (currentLevel === IsolationLevel.PLATFORM) {
      return;
    }

    // 检查隔离级别是否满足要求
    const levelHierarchy = {
      [IsolationLevel.PLATFORM]: 5,
      [IsolationLevel.TENANT]: 4,
      [IsolationLevel.ORGANIZATION]: 3,
      [IsolationLevel.DEPARTMENT]: 2,
      [IsolationLevel.USER]: 1,
    };

    const currentLevelValue = levelHierarchy[currentLevel];
    const requiredLevelValue = levelHierarchy[requiredLevel];

    if (currentLevelValue < requiredLevelValue) {
      throw new DomainPermissionException(
        `${operation}需要${requiredLevel}级隔离权限，当前为${currentLevel}级`,
        "INSUFFICIENT_ISOLATION_LEVEL",
        operation,
        {
          currentLevel,
          requiredLevel,
          operation,
        },
      );
    }
  }

  /**
   * 确保实体属于同一隔离级别
   *
   * @description 验证另一个实体或隔离上下文是否属于同一隔离级别。
   * 用于跨实体操作时的隔离一致性验证，防止跨隔离级别的数据访问和操作。
   *
   * ## 业务规则
   *
   * ### 隔离一致性规则
   * - 聚合内部的所有实体必须属于同一隔离级别
   * - 跨聚合操作时必须验证隔离一致性
   * - 不同隔离级别的实体不能直接交互
   * - 隔离不一致时抛出明确的禁止访问异常
   *
   * ### 验证规则
   * - 使用隔离上下文比较隔离级别
   * - 比较基于隔离级别，而非具体ID
   * - 隔离级别必须完全相等
   * - 验证失败时提供详细的错误信息
   *
   * ### 使用场景
   * - 聚合根添加实体时验证
   * - 实体间建立关联时验证
   * - 跨聚合引用时验证
   * - 任何可能涉及多个隔离级别的操作
   *
   * ### 异常处理
   * - 抛出 DomainPermissionException 异常
   * - 异常消息描述跨隔离级别操作被禁止
   * - 异常详情包含双方隔离级别和实体类型
   * - 支持审计和安全监控
   *
   * @param entityContext - 要比较的隔离上下文
   * @param entityType - 实体类型（用于错误消息，可选，默认为'Entity'）
   *
   * @throws {DomainPermissionException} 当不属于同一隔离级别时
   *
   * @protected
   *
   * @example
   * ```typescript
   * export class OrganizationAggregate extends IsolationAwareAggregateRoot {
   *   public addDepartment(department: Department): void {
   *     // 验证部门属于同一隔离级别
   *     this.ensureSameIsolationLevel(department.isolationContext, 'Department');
   *
   *     // 执行业务逻辑
   *     this._departments.push(department);
   *   }
   * }
   * ```
   */
  protected ensureSameIsolationLevel(
    entityContext: IsolationContext,
    entityType: string = "Entity",
  ): void {
    this.ensureIsolationContext();

    const currentLevel = this._isolationContext!.getIsolationLevel();
    const entityLevel = entityContext.getIsolationLevel();

    if (currentLevel !== entityLevel) {
      throw new DomainPermissionException(
        `无法操作其他隔离级别的${entityType}，数据隔离策略禁止跨隔离级别操作`,
        "CROSS_ISOLATION_LEVEL_OPERATION_FORBIDDEN",
        entityType,
        {
          currentLevel,
          entityLevel,
          entityType,
        },
      );
    }
  }

  /**
   * 确保实体属于同一租户
   *
   * @description 验证另一个实体或ID是否属于同一租户。
   * 用于跨实体操作时的租户隔离验证，防止跨租户数据访问和操作。
   *
   * @param entityTenantId - 要比较的租户ID
   * @param entityType - 实体类型（用于错误消息，可选，默认为'Entity'）
   *
   * @throws {DomainPermissionException} 当不属于同一租户时
   *
   * @protected
   */
  protected ensureSameTenant(
    entityTenantId: EntityId,
    entityType: string = "Entity",
  ): void {
    this.ensureIsolationContext();

    const currentTenantId = this._isolationContext!.tenantId;
    if (!currentTenantId || !currentTenantId.equals(entityTenantId)) {
      throw new DomainPermissionException(
        `无法操作其他租户的${entityType}，数据隔离策略禁止跨租户操作`,
        "CROSS_TENANT_OPERATION_FORBIDDEN",
        entityType,
        {
          currentTenantId: currentTenantId?.toString(),
          targetTenantId: entityTenantId.toString(),
          entityType,
        },
      );
    }
  }

  /**
   * 确保实体属于同一组织
   *
   * @description 验证另一个实体或ID是否属于同一组织。
   * 用于跨实体操作时的组织隔离验证，防止跨组织数据访问和操作。
   *
   * @param entityOrganizationId - 要比较的组织ID
   * @param entityType - 实体类型（用于错误消息，可选，默认为'Entity'）
   *
   * @throws {DomainPermissionException} 当不属于同一组织时
   *
   * @protected
   */
  protected ensureSameOrganization(
    entityOrganizationId: EntityId,
    entityType: string = "Entity",
  ): void {
    this.ensureIsolationContext();

    const currentOrganizationId = this._isolationContext!.organizationId;
    if (
      !currentOrganizationId ||
      !currentOrganizationId.equals(entityOrganizationId)
    ) {
      throw new DomainPermissionException(
        `无法操作其他组织的${entityType}，数据隔离策略禁止跨组织操作`,
        "CROSS_ORGANIZATION_OPERATION_FORBIDDEN",
        entityType,
        {
          currentOrganizationId: currentOrganizationId?.toString(),
          targetOrganizationId: entityOrganizationId.toString(),
          entityType,
        },
      );
    }
  }

  /**
   * 确保实体属于同一部门
   *
   * @description 验证另一个实体或ID是否属于同一部门。
   * 用于跨实体操作时的部门隔离验证，防止跨部门数据访问和操作。
   *
   * @param entityDepartmentId - 要比较的部门ID
   * @param entityType - 实体类型（用于错误消息，可选，默认为'Entity'）
   *
   * @throws {DomainPermissionException} 当不属于同一部门时
   *
   * @protected
   */
  protected ensureSameDepartment(
    entityDepartmentId: EntityId,
    entityType: string = "Entity",
  ): void {
    this.ensureIsolationContext();

    const currentDepartmentId = this._isolationContext!.departmentId;
    if (
      !currentDepartmentId ||
      !currentDepartmentId.equals(entityDepartmentId)
    ) {
      throw new DomainPermissionException(
        `无法操作其他部门的${entityType}，数据隔离策略禁止跨部门操作`,
        "CROSS_DEPARTMENT_OPERATION_FORBIDDEN",
        entityType,
        {
          currentDepartmentId: currentDepartmentId?.toString(),
          targetDepartmentId: entityDepartmentId.toString(),
          entityType,
        },
      );
    }
  }

  /**
   * 确保实体属于同一用户
   *
   * @description 验证另一个实体或ID是否属于同一用户。
   * 用于跨实体操作时的用户隔离验证，防止跨用户数据访问和操作。
   *
   * @param entityUserId - 要比较的用户ID
   * @param entityType - 实体类型（用于错误消息，可选，默认为'Entity'）
   *
   * @throws {DomainPermissionException} 当不属于同一用户时
   *
   * @protected
   */
  protected ensureSameUser(
    entityUserId: EntityId,
    entityType: string = "Entity",
  ): void {
    this.ensureIsolationContext();

    const currentUserId = this._isolationContext!.userId;
    if (!currentUserId || !currentUserId.equals(entityUserId)) {
      throw new DomainPermissionException(
        `无法操作其他用户的${entityType}，数据隔离策略禁止跨用户操作`,
        "CROSS_USER_OPERATION_FORBIDDEN",
        entityType,
        {
          currentUserId: currentUserId?.toString(),
          targetUserId: entityUserId.toString(),
          entityType,
        },
      );
    }
  }

  /**
   * 发布隔离事件
   *
   * @description 创建并发布隔离相关的领域事件。
   * 自动注入聚合根ID、版本号、隔离上下文，简化事件创建过程。
   *
   * ## 业务规则
   *
   * ### 事件创建规则
   * - 事件工厂函数接收聚合根ID、版本号、隔离上下文
   * - 事件工厂函数返回创建好的事件实例
   * - 事件自动包含隔离信息，用于审计和追踪
   * - 事件创建失败时抛出异常
   *
   * ### 事件发布规则
   * - 事件通过 addDomainEvent() 添加到事件列表
   * - 事件在聚合根保存时统一发布
   * - 事件发布遵循事务一致性
   * - 事件发布失败时支持重试机制
   *
   * ### 事件内容规则
   * - 事件必须包含聚合根ID（aggregateId）
   * - 事件必须包含版本号（version）
   * - 事件必须包含隔离上下文（isolationContext）
   * - 事件可以包含业务相关的其他信息
   *
   * ### 使用场景
   * - 简化隔离事件的创建
   * - 确保事件包含必要的隔离信息
   * - 减少重复代码，提高代码可读性
   * - 统一事件创建模式
   *
   * @param eventFactory - 事件工厂函数，接收aggregateId, version, isolationContext，返回事件实例
   *
   * @protected
   *
   * @example
   * ```typescript
   * export class TenantAggregate extends IsolationAwareAggregateRoot {
   *   public updateName(name: string): void {
   *     this._tenant.updateName(name);
   *
   *     // ✅ 简化的事件发布
   *     this.publishIsolationEvent((id, version, context) =>
   *       new TenantNameUpdatedEvent(id, version, context, name)
   *     );
   *
   *     // 等价于以下代码：
   *     // this.addDomainEvent(
   *     //   new TenantNameUpdatedEvent(
   *     //     this.id,
   *     //     this.version,
   *     //     this._isolationContext,
   *     //     name
   *     //   )
   *     // );
   *   }
   * }
   * ```
   */
  protected publishIsolationEvent(
    eventFactory: (
      aggregateId: EntityId,
      version: number,
      isolationContext: IsolationContext,
    ) => BaseDomainEvent,
  ): void {
    this.ensureIsolationContext();
    const event = eventFactory(this.id, this.version, this._isolationContext!);
    this.addDomainEvent(event);
  }

  /**
   * 获取隔离上下文（便捷方法）
   *
   * @description 返回聚合根的隔离上下文。
   * 这是一个便捷方法，直接访问聚合根的隔离上下文。
   *
   * ## 业务规则
   *
   * ### 访问规则
   * - 隔离上下文来自聚合根设置
   * - 隔离上下文在聚合根生命周期内不可变更
   * - 隔离上下文保证非空（构造函数已验证）
   * - 返回的是IsolationContext值对象，非原始数据
   *
   * ### 使用场景
   * - 获取当前聚合根的隔离上下文
   * - 用于隔离一致性比较
   * - 用于日志记录和审计
   * - 用于权限验证
   *
   * @returns 隔离上下文
   *
   * @public
   *
   * @example
   * ```typescript
   * const aggregate = new TenantAggregate(...);
   * const context = aggregate.getIsolationContext();
   * console.log('Isolation Level:', context.getIsolationLevel());
   * ```
   */
  public getIsolationContext(): IsolationContext | undefined {
    return this._isolationContext;
  }

  /**
   * 检查是否属于指定隔离级别
   *
   * @description 检查聚合根是否属于指定的隔离级别。
   * 使用IsolationLevel枚举进行比较。
   *
   * ## 业务规则
   *
   * ### 比较规则
   * - 使用IsolationLevel枚举进行比较
   * - 比较基于隔离级别，而非具体ID
   * - 隔离级别必须完全相等
   * - 支持安全的跨隔离级别检查
   *
   * ### 使用场景
   * - 权限验证时检查隔离级别
   * - 查询过滤时验证隔离级别
   * - 业务规则中判断隔离级别
   * - 审计日志中记录隔离级别
   *
   * ### 返回值
   * - true: 聚合根属于指定隔离级别
   * - false: 聚合根不属于指定隔离级别
   *
   * @param isolationLevel - 要检查的隔离级别
   * @returns 如果属于指定隔离级别返回true，否则返回false
   *
   * @public
   *
   * @example
   * ```typescript
   * const aggregate = new TenantAggregate(...);
   * const currentLevel = IsolationLevel.TENANT;
   *
   * if (aggregate.belongsToIsolationLevel(currentLevel)) {
   *   console.log('聚合根属于租户级隔离');
   * } else {
   *   console.log('聚合根属于其他隔离级别');
   * }
   * ```
   */
  public belongsToIsolationLevel(isolationLevel: IsolationLevel): boolean {
    if (!this._isolationContext) {
      return false;
    }
    return this._isolationContext.getIsolationLevel() === isolationLevel;
  }

  /**
   * 记录隔离级别的日志
   *
   * @description 记录包含隔离信息的日志，用于审计、调试和监控。
   * 自动包含聚合根类型、聚合根ID、隔离上下文等上下文信息。
   *
   * ## 业务规则
   *
   * ### 日志内容规则
   * - 日志必须包含隔离上下文
   * - 日志必须包含聚合根类型
   * - 日志必须包含聚合根ID
   * - 日志可以包含业务相关的其他数据
   *
   * ### 日志级别规则
   * - 使用info级别记录正常操作
   * - 敏感信息不应出现在日志中
   * - 日志应清晰描述操作内容
   * - 日志应便于查询和分析
   *
   * ### 使用场景
   * - 记录重要的业务操作
   * - 审计隔离级别的操作
   * - 调试隔离相关问题
   * - 性能分析和监控
   *
   * ### 日志格式
   * - message: 日志消息，描述操作内容
   * - aggregateType: 聚合根类型名称
   * - aggregateId: 聚合根ID
   * - isolationContext: 隔离上下文
   * - data: 附加的业务数据
   *
   * @param message - 日志消息
   * @param data - 附加数据（可选）
   *
   * @protected
   *
   * @example
   * ```typescript
   * export class TenantAggregate extends IsolationAwareAggregateRoot {
   *   public updateName(name: string): void {
   *     this._tenant.updateName(name);
   *
   *     // 记录隔离操作日志
   *     this.logIsolationOperation('租户名称已更新', {
   *       oldName: this._tenant.getName(),
   *       newName: name,
   *       operation: 'update-name',
   *     });
   *   }
   * }
   * ```
   */
  protected logIsolationOperation(
    message: string,
    _data?: Record<string, unknown>,
  ): void {
    this.logger.info(message);
  }

  /**
   * 序列化时包含隔离信息
   *
   * @description 序列化聚合根时自动包含隔离信息。
   * 隔离信息已包含在super.toData()中（来自BaseEntity），
   * 这里保持一致性，确保隔离信息正确序列化。
   *
   * ## 业务规则
   *
   * ### 序列化规则
   * - 隔离信息来自聚合根设置
   * - 隔离上下文以对象形式序列化
   * - 序列化结果包含所有审计信息
   * - 序列化结果可用于持久化和传输
   *
   * ### 使用场景
   * - 持久化聚合根到数据库
   * - 序列化聚合根用于消息传递
   * - 导出聚合根数据
   * - API响应中返回聚合根数据
   *
   * @returns 包含隔离信息的数据对象
   *
   * @public
   *
   * @example
   * ```typescript
   * const aggregate = new TenantAggregate(...);
   * const data = aggregate.toData();
   * console.log(data);
   * // {
   * //   id: 'aggregate-123',
   * //   isolationContext: { ... },
   * //   createdAt: '2025-10-08T...',
   * //   updatedAt: '2025-10-08T...',
   * //   version: 1,
   * //   ...
   * // }
   * ```
   */
  public override toData(): Record<string, unknown> {
    return {
      ...super.toData(),
      isolationContext: this._isolationContext,
    };
  }
}
