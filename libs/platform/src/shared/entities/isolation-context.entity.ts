/**
 * 隔离上下文实体
 *
 * @description 表示请求的多层级隔离上下文（充血模型）
 *
 * ## 业务规则
 *
 * ### 层级规则
 * - **平台级**：所有标识符均为空
 * - **租户级**：有 tenantId，其他为空
 * - **组织级**：有 organizationId 必须有 tenantId
 * - **部门级**：有 departmentId 必须有 organizationId 和 tenantId
 * - **用户级**：userId 可以独立存在或与其他层级组合
 *
 * ### 不可变性
 * - 创建后不可修改
 * - 使用值对象保证不可变性
 *
 * @example
 * ```typescript
 * // 平台级隔离
 * const platformContext = IsolationContext.createPlatform();
 * console.log(platformContext.getIsolationLevel()); // IsolationLevel.PLATFORM
 *
 * // 租户级隔离
 * const tenantContext = IsolationContext.createTenant(tenantId);
 * console.log(tenantContext.getIsolationLevel()); // IsolationLevel.TENANT
 *
 * // 验证（会在构造时自动验证）
 * // 如果无效会抛出运行时错误
 * ```
 *
 * @since 0.2.0
 */

import { IsolationLevel } from '../enums/isolation-level.enum.js';
import { TenantId } from '../value-objects/tenant-id.vo.js';
import { OrganizationId } from '../value-objects/organization-id.vo.js';
import { DepartmentId } from '../value-objects/department-id.vo.js';
import { UserId } from '../value-objects/user-id.vo.js';

/**
 * 隔离上下文实体
 *
 * @description 封装多层级数据隔离的上下文信息
 */
export class IsolationContext {
  private readonly _tenantId?: TenantId;
  private readonly _organizationId?: OrganizationId;
  private readonly _departmentId?: DepartmentId;
  private readonly _userId?: UserId;
  private readonly _createdAt: Date;

  private constructor(params: {
    tenantId?: TenantId;
    organizationId?: OrganizationId;
    departmentId?: DepartmentId;
    userId?: UserId;
  }) {
    this._tenantId = params.tenantId;
    this._organizationId = params.organizationId;
    this._departmentId = params.departmentId;
    this._userId = params.userId;
    this._createdAt = new Date();

    // 创建时验证（值对象内部错误，不抛出 HTTP 异常）
    if (!this.validate()) {
      throw new Error('Invalid isolation context: 层级关系不一致');
    }
  }

  /**
   * 租户 ID
   */
  get tenantId(): TenantId | undefined {
    return this._tenantId;
  }

  /**
   * 组织 ID
   */
  get organizationId(): OrganizationId | undefined {
    return this._organizationId;
  }

  /**
   * 部门 ID
   */
  get departmentId(): DepartmentId | undefined {
    return this._departmentId;
  }

  /**
   * 用户 ID
   */
  get userId(): UserId | undefined {
    return this._userId;
  }

  /**
   * 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 创建平台级上下文
   *
   * @returns 平台级隔离上下文
   *
   * @example
   * ```typescript
   * const context = IsolationContext.createPlatform();
   * console.log(context.isEmpty()); // true
   * ```
   */
  static createPlatform(): IsolationContext {
    return new IsolationContext({});
  }

  /**
   * 创建租户级上下文
   *
   * @param tenantId - 租户 ID
   * @returns 租户级隔离上下文
   */
  static createTenant(tenantId: TenantId): IsolationContext {
    return new IsolationContext({ tenantId });
  }

  /**
   * 创建组织级上下文
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns 组织级隔离上下文
   */
  static createOrganization(
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext {
    return new IsolationContext({ tenantId, organizationId });
  }

  /**
   * 创建部门级上下文
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @returns 部门级隔离上下文
   */
  static createDepartment(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext {
    return new IsolationContext({ tenantId, organizationId, departmentId });
  }

  /**
   * 创建用户级上下文
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @param userId - 用户 ID
   * @returns 用户级隔离上下文
   */
  static createUser(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    userId: UserId,
  ): IsolationContext {
    return new IsolationContext({ tenantId, organizationId, departmentId, userId });
  }

  /**
   * 验证上下文有效性
   *
   * @description 验证层级关系是否一致
   * @returns 如果有效返回 true
   *
   * ## 业务规则
   * - 有部门必须有组织和租户
   * - 有组织必须有租户
   * - 平台级所有标识符均为空
   */
  validate(): boolean {
    // 平台级：所有标识符均为空
    if (!this._tenantId && !this._organizationId && !this._departmentId) {
      return true;
    }

    // 租户级：只有 tenantId
    if (this._tenantId && !this._organizationId && !this._departmentId) {
      return true;
    }

    // 组织级：有 organizationId 必须有 tenantId
    if (this._organizationId && !this._tenantId) {
      return false;
    }

    // 部门级：有 departmentId 必须有 organizationId 和 tenantId
    if (this._departmentId && (!this._organizationId || !this._tenantId)) {
      return false;
    }

    // 用户级：userId 可以独立存在或与其他层级组合
    return true;
  }

  /**
   * 获取隔离级别
   *
   * @returns 隔离级别
   *
   * @example
   * ```typescript
   * const level = context.getIsolationLevel();
   * ```
   */
  getIsolationLevel(): IsolationLevel {
    if (this._userId) {
      return IsolationLevel.USER;
    }
    if (this._departmentId) {
      return IsolationLevel.DEPARTMENT;
    }
    if (this._organizationId) {
      return IsolationLevel.ORGANIZATION;
    }
    if (this._tenantId) {
      return IsolationLevel.TENANT;
    }
    return IsolationLevel.PLATFORM;
  }

  /**
   * 判断是否为平台级
   *
   * @returns 如果是平台级返回 true
   */
  isEmpty(): boolean {
    return (
      !this._tenantId &&
      !this._organizationId &&
      !this._departmentId &&
      !this._userId
    );
  }

  /**
   * 判断是否包含租户
   *
   * @returns 如果包含租户返回 true
   */
  hasTenant(): boolean {
    return this._tenantId !== undefined;
  }

  /**
   * 判断是否包含组织
   *
   * @returns 如果包含组织返回 true
   */
  hasOrganization(): boolean {
    return this._organizationId !== undefined;
  }

  /**
   * 判断是否包含部门
   *
   * @returns 如果包含部门返回 true
   */
  hasDepartment(): boolean {
    return this._departmentId !== undefined;
  }

  /**
   * 判断是否包含用户
   *
   * @returns 如果包含用户返回 true
   */
  hasUser(): boolean {
    return this._userId !== undefined;
  }

  /**
   * 序列化为 JSON
   *
   * @returns JSON 对象
   */
  toJSON(): {
    tenantId?: string;
    organizationId?: string;
    departmentId?: string;
    userId?: string;
    createdAt: string;
  } {
    return {
      tenantId: this._tenantId?.toString(),
      organizationId: this._organizationId?.toString(),
      departmentId: this._departmentId?.toString(),
      userId: this._userId?.toString(),
      createdAt: this._createdAt.toISOString(),
    };
  }

  /**
   * 转换为简单对象
   *
   * @returns 简单对象
   */
  toPlainObject(): {
    tenantId?: string;
    organizationId?: string;
    departmentId?: string;
    userId?: string;
  } {
    return {
      tenantId: this._tenantId?.value,
      organizationId: this._organizationId?.value,
      departmentId: this._departmentId?.value,
      userId: this._userId?.value,
    };
  }
}

