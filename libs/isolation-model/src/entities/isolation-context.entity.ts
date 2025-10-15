/**
 * 隔离上下文实体
 *
 * @description 封装多层级数据隔离的核心业务逻辑
 *
 * ## 业务规则（充血模型）
 *
 * ### 层级判断规则
 * - 有 departmentId → DEPARTMENT 级
 * - 有 organizationId → ORGANIZATION 级
 * - 有 tenantId → TENANT 级
 * - 有 userId（无租户）→ USER 级
 * - 默认 → PLATFORM 级
 *
 * ### 验证规则
 * - 组织级必须有租户
 * - 部门级必须有租户和组织
 * - 所有 ID 必须有效
 *
 * ### 访问权限规则
 * - 平台级上下文可访问所有数据
 * - 非共享数据：必须完全匹配隔离上下文
 * - 共享数据：检查共享级别是否允许访问
 *
 * ## 业务逻辑方法
 *
 * - buildCacheKey(): 供 caching 模块使用，生成缓存键
 * - buildLogContext(): 供 logging 模块使用，生成日志上下文
 * - buildWhereClause(): 供 database 模块使用，生成查询条件
 * - canAccess(): 供权限模块使用，验证数据访问权限
 *
 * @example
 * ```typescript
 * // 创建部门级上下文
 * const context = IsolationContext.department(
 *   TenantId.create('t123'),
 *   OrganizationId.create('o456'),
 *   DepartmentId.create('d789'),
 * );
 *
 * // 使用业务逻辑方法
 * const cacheKey = context.buildCacheKey('user', 'list');
 * const logContext = context.buildLogContext();
 * const where = context.buildWhereClause();
 * ```
 *
 * @since 1.0.0
 */

import { IsolationLevel } from "../enums/isolation-level.enum.js";
import { SharingLevel } from "../enums/sharing-level.enum.js";
import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import type { DepartmentId } from "../value-objects/department-id.vo.js";
import type { OrganizationId } from "../value-objects/organization-id.vo.js";
import type { TenantId } from "../value-objects/tenant-id.vo.js";
import type { UserId } from "../value-objects/user-id.vo.js";

/**
 * 隔离上下文实体
 *
 * 实体特性：
 * - 有标识符（通过值对象组合）
 * - 有生命周期
 * - 封装业务逻辑
 * - 不可变（所有属性 readonly）
 */
export class IsolationContext {
  private _level?: IsolationLevel; // 延迟计算缓存

  /**
   * 私有构造函数 - 强制使用静态工厂方法
   *
   * @param tenantId - 租户 ID（可选）
   * @param organizationId - 组织 ID（可选）
   * @param departmentId - 部门 ID（可选）
   * @param userId - 用户 ID（可选）
   */
  private constructor(
    public readonly tenantId?: TenantId,
    public readonly organizationId?: OrganizationId,
    public readonly departmentId?: DepartmentId,
    public readonly userId?: UserId,
  ) {
    this.validate();
  }

  /**
   * 创建平台级上下文
   *
   * @description 平台级上下文可以访问所有数据
   *
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.platform();
   * console.log(context.isEmpty()); // true
   * ```
   */
  static platform(): IsolationContext {
    return new IsolationContext();
  }

  /**
   * 创建租户级上下文
   *
   * @param tenantId - 租户 ID
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.tenant(TenantId.create('t123'));
   * ```
   */
  static tenant(tenantId: TenantId): IsolationContext {
    return new IsolationContext(tenantId);
  }

  /**
   * 创建组织级上下文
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns IsolationContext 实例
   * @throws {IsolationValidationError} 如果缺少租户 ID
   *
   * @example
   * ```typescript
   * const context = IsolationContext.organization(
   *   TenantId.create('t123'),
   *   OrganizationId.create('o456')
   * );
   * ```
   */
  static organization(
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId);
  }

  /**
   * 创建部门级上下文
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @returns IsolationContext 实例
   * @throws {IsolationValidationError} 如果缺少必需的 ID
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(
   *   TenantId.create('t123'),
   *   OrganizationId.create('o456'),
   *   DepartmentId.create('d789')
   * );
   * ```
   */
  static department(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId, departmentId);
  }

  /**
   * 创建用户级上下文
   *
   * @param userId - 用户 ID
   * @param tenantId - 租户 ID（可选，用户可能属于租户）
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.user(UserId.create('u999'));
   * ```
   */
  static user(userId: UserId, tenantId?: TenantId): IsolationContext {
    return new IsolationContext(tenantId, undefined, undefined, userId);
  }

  /**
   * 验证上下文有效性
   *
   * @throws {IsolationValidationError} 上下文无效
   * @private
   */
  private validate(): void {
    // 组织级必须有租户
    if (this.organizationId && !this.tenantId) {
      throw new IsolationValidationError(
        "组织级上下文必须包含租户 ID",
        "INVALID_ORGANIZATION_CONTEXT",
        { organizationId: this.organizationId?.getValue() },
      );
    }

    // 部门级必须有租户和组织
    if (this.departmentId && (!this.tenantId || !this.organizationId)) {
      throw new IsolationValidationError(
        "部门级上下文必须包含租户 ID 和组织 ID",
        "INVALID_DEPARTMENT_CONTEXT",
        {
          departmentId: this.departmentId?.getValue(),
          hasTenant: !!this.tenantId,
          hasOrganization: !!this.organizationId,
        },
      );
    }
  }

  /**
   * 获取隔离级别（业务逻辑）
   *
   * @description 根据包含的标识符判断隔离级别
   *
   * @returns 隔离级别枚举
   *
   * @example
   * ```typescript
   * const level = context.getIsolationLevel();
   * console.log(level); // IsolationLevel.TENANT
   * ```
   */
  getIsolationLevel(): IsolationLevel {
    // 延迟计算 + 缓存结果（性能优化）
    if (this._level === undefined) {
      // 按照最具体到最宽泛的顺序判断
      if (this.departmentId) {
        this._level = IsolationLevel.DEPARTMENT;
      } else if (this.organizationId) {
        this._level = IsolationLevel.ORGANIZATION;
      } else if (this.userId) {
        // 用户级优先于租户级（即使有租户，只要有 userId 就是用户级）
        this._level = IsolationLevel.USER;
      } else if (this.tenantId) {
        this._level = IsolationLevel.TENANT;
      } else {
        this._level = IsolationLevel.PLATFORM;
      }
    }

    return this._level;
  }

  /**
   * 判断是否为空上下文（平台级）
   *
   * @returns 如果所有标识符都为空返回 true
   */
  isEmpty(): boolean {
    return (
      !this.tenantId &&
      !this.organizationId &&
      !this.departmentId &&
      !this.userId
    );
  }

  /**
   * 判断是否为租户级
   */
  isTenantLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.TENANT;
  }

  /**
   * 判断是否为组织级
   */
  isOrganizationLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.ORGANIZATION;
  }

  /**
   * 判断是否为部门级
   */
  isDepartmentLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.DEPARTMENT;
  }

  /**
   * 判断是否为用户级
   */
  isUserLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.USER;
  }

  /**
   * 构建缓存键（供 caching 模块使用）
   *
   * @description 根据隔离级别生成缓存键前缀
   *
   * @param namespace - 命名空间
   * @param key - 键名
   * @returns 完整的缓存键
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(t123, o456, d789);
   * const cacheKey = context.buildCacheKey('user', 'list');
   * // 返回: tenant:t123:org:o456:dept:d789:user:list
   * ```
   */
  buildCacheKey(namespace: string, key: string): string {
    const parts: string[] = [];

    switch (this.getIsolationLevel()) {
      case IsolationLevel.PLATFORM:
        parts.push("platform", namespace, key);
        break;

      case IsolationLevel.TENANT:
        parts.push("tenant", this.tenantId!.getValue(), namespace, key);
        break;

      case IsolationLevel.ORGANIZATION:
        parts.push(
          "tenant",
          this.tenantId!.getValue(),
          "org",
          this.organizationId!.getValue(),
          namespace,
          key,
        );
        break;

      case IsolationLevel.DEPARTMENT:
        parts.push(
          "tenant",
          this.tenantId!.getValue(),
          "org",
          this.organizationId!.getValue(),
          "dept",
          this.departmentId!.getValue(),
          namespace,
          key,
        );
        break;

      case IsolationLevel.USER:
        if (this.tenantId) {
          parts.push(
            "tenant",
            this.tenantId.getValue(),
            "user",
            this.userId!.getValue(),
            namespace,
            key,
          );
        } else {
          parts.push("user", this.userId!.getValue(), namespace, key);
        }
        break;
    }

    return parts.join(":");
  }

  /**
   * 构建日志上下文（供 logging 模块使用）
   *
   * @description 生成结构化的日志上下文对象
   *
   * @returns 日志上下文对象
   *
   * @example
   * ```typescript
   * const logContext = context.buildLogContext();
   * logger.info('操作完成', logContext);
   * // 输出: { tenantId: 't123', organizationId: 'o456', ... }
   * ```
   */
  buildLogContext(): Record<string, string> {
    const logContext: Record<string, string> = {};

    if (this.tenantId) {
      logContext.tenantId = this.tenantId.getValue();
    }
    if (this.organizationId) {
      logContext.organizationId = this.organizationId.getValue();
    }
    if (this.departmentId) {
      logContext.departmentId = this.departmentId.getValue();
    }
    if (this.userId) {
      logContext.userId = this.userId.getValue();
    }

    return logContext;
  }

  /**
   * 构建数据库查询条件（供 database 模块使用）
   *
   * @description 根据隔离级别生成 WHERE 子句条件
   *
   * @returns 查询条件对象
   *
   * @example
   * ```typescript
   * const where = context.buildWhereClause();
   * // 返回: { tenantId: 't123', organizationId: 'o456', departmentId: 'd789' }
   *
   * // 使用 TypeORM
   * const users = await userRepository.find({ where });
   *
   * // 使用 Prisma
   * const users = await prisma.user.findMany({ where });
   * ```
   */
  buildWhereClause(): Record<string, string> {
    const where: Record<string, string> = {};

    if (this.tenantId) {
      where.tenantId = this.tenantId.getValue();
    }
    if (this.organizationId) {
      where.organizationId = this.organizationId.getValue();
    }
    if (this.departmentId) {
      where.departmentId = this.departmentId.getValue();
    }

    return where;
  }

  /**
   * 检查是否可以访问数据（核心业务逻辑）
   *
   * @description 验证当前上下文是否可以访问目标数据
   *
   * @param dataContext - 数据的隔离上下文
   * @param isShared - 数据是否共享
   * @param sharingLevel - 共享级别（如果是共享数据）
   * @returns 如果可以访问返回 true，否则返回 false
   *
   * ## 访问规则
   *
   * ### 非共享数据
   * - 只能在数据所有者的隔离层级访问
   * - 示例：部门 A 的非共享数据不能被部门 B 访问
   *
   * ### 共享数据
   * - 可以在共享级别及其下级访问
   * - 示例：租户级共享数据可被该租户的所有组织、部门、用户访问
   *
   * @example
   * ```typescript
   * const userContext = IsolationContext.department(t123, o456, d789);
   * const dataContext = IsolationContext.organization(t123, o456);
   *
   * // 检查访问权限
   * const canAccess = userContext.canAccess(
   *   dataContext,
   *   true,  // 共享数据
   *   SharingLevel.ORGANIZATION
   * );
   * // 返回 true（共享数据，用户在组织内）
   * ```
   */
  canAccess(
    dataContext: IsolationContext,
    isShared: boolean,
    sharingLevel?: SharingLevel,
  ): boolean {
    // 平台级上下文可以访问所有数据
    if (this.isEmpty()) {
      return true;
    }

    // 非共享数据：必须完全匹配
    if (!isShared) {
      return this.matches(dataContext);
    }

    // 共享数据：检查共享级别
    return this.canAccessSharedData(dataContext, sharingLevel);
  }

  /**
   * 检查是否匹配另一个上下文（私有方法）
   *
   * @param other - 另一个隔离上下文
   * @returns 如果完全匹配返回 true
   * @private
   */
  private matches(other: IsolationContext): boolean {
    // 使用值对象的 equals 方法比较
    const tenantMatch =
      this.tenantId?.equals(other.tenantId) ?? !other.tenantId;
    const orgMatch =
      this.organizationId?.equals(other.organizationId) ??
      !other.organizationId;
    const deptMatch =
      this.departmentId?.equals(other.departmentId) ?? !other.departmentId;
    const userMatch = this.userId?.equals(other.userId) ?? !other.userId;

    return tenantMatch && orgMatch && deptMatch && userMatch;
  }

  /**
   * 检查是否可以访问共享数据（私有方法）
   *
   * @param dataContext - 数据的隔离上下文
   * @param sharingLevel - 共享级别
   * @returns 如果可以访问返回 true
   * @private
   */
  private canAccessSharedData(
    dataContext: IsolationContext,
    sharingLevel?: SharingLevel,
  ): boolean {
    if (!sharingLevel) {
      return false;
    }

    switch (sharingLevel) {
      case SharingLevel.PLATFORM:
        // 平台共享，所有人可访问
        return true;

      case SharingLevel.TENANT:
        // 租户共享，需要在同一租户
        return this.tenantId?.equals(dataContext.tenantId) ?? false;

      case SharingLevel.ORGANIZATION:
        // 组织共享，需要在同一组织
        return (
          (this.tenantId?.equals(dataContext.tenantId) &&
            this.organizationId?.equals(dataContext.organizationId)) ??
          false
        );

      case SharingLevel.DEPARTMENT:
        // 部门共享，需要在同一部门
        return (
          (this.tenantId?.equals(dataContext.tenantId) &&
            this.organizationId?.equals(dataContext.organizationId) &&
            this.departmentId?.equals(dataContext.departmentId)) ??
          false
        );

      case SharingLevel.USER:
        // 用户私有，必须是同一用户
        return this.userId?.equals(dataContext.userId) ?? false;

      default:
        return false;
    }
  }

  /**
   * 切换组织（创建新的上下文）
   *
   * @param newOrganizationId - 新的组织 ID
   * @returns 新的 IsolationContext 实例
   *
   * @example
   * ```typescript
   * const newContext = context.switchOrganization(OrganizationId.create('o999'));
   * ```
   */
  switchOrganization(newOrganizationId: OrganizationId): IsolationContext {
    if (!this.tenantId) {
      throw new IsolationValidationError(
        "切换组织需要租户上下文",
        "SWITCH_ORGANIZATION_REQUIRES_TENANT",
      );
    }

    return new IsolationContext(this.tenantId, newOrganizationId);
  }

  /**
   * 切换部门（创建新的上下文）
   *
   * @param newDepartmentId - 新的部门 ID
   * @returns 新的 IsolationContext 实例
   */
  switchDepartment(newDepartmentId: DepartmentId): IsolationContext {
    if (!this.tenantId || !this.organizationId) {
      throw new IsolationValidationError(
        "切换部门需要租户和组织上下文",
        "SWITCH_DEPARTMENT_REQUIRES_TENANT_AND_ORG",
      );
    }

    return new IsolationContext(
      this.tenantId,
      this.organizationId,
      newDepartmentId,
    );
  }
}
