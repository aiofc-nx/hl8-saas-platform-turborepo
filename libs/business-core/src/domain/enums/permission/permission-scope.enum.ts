/**
 * 权限作用域枚举
 *
 * @description 定义系统中所有权限作用域的枚举值
 *
 * ## 业务规则
 *
 * ### 权限作用域规则
 * - 系统级权限：系统级别的权限，影响整个平台
 * - 租户级权限：租户级别的权限，影响特定租户
 * - 组织级权限：组织级别的权限，影响特定组织
 * - 部门级权限：部门级别的权限，影响特定部门
 * - 资源级权限：特定资源的权限，如文件、数据等
 *
 * ### 权限作用域层级规则
 * - 系统级权限：最高权限，可以管理所有资源
 * - 租户级权限：可以管理租户内的所有资源
 * - 组织级权限：可以管理组织内的资源
 * - 部门级权限：可以管理部门内的资源
 * - 资源级权限：特定资源的操作权限
 *
 * @example
 * ```typescript
 * import { PermissionScope } from './permission-scope.enum.js';
 *
 * // 检查作用域
 * console.log(PermissionScope.SYSTEM); // "system"
 * console.log(PermissionScopeUtils.isSystemScope(PermissionScope.SYSTEM)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum PermissionScope {
  /** 系统级权限 */
  SYSTEM = "system",
  /** 租户级权限 */
  TENANT = "tenant",
  /** 组织级权限 */
  ORGANIZATION = "organization",
  /** 部门级权限 */
  DEPARTMENT = "department",
  /** 资源级权限 */
  RESOURCE = "resource",
}

/**
 * 权限作用域工具类
 *
 * @description 提供权限作用域相关的工具方法
 */
export class PermissionScopeUtils {
  /**
   * 作用域层级映射
   */
  private static readonly SCOPE_HIERARCHY: Record<PermissionScope, number> = {
    [PermissionScope.SYSTEM]: 5,
    [PermissionScope.TENANT]: 4,
    [PermissionScope.ORGANIZATION]: 3,
    [PermissionScope.DEPARTMENT]: 2,
    [PermissionScope.RESOURCE]: 1,
  };

  /**
   * 作用域描述映射
   */
  private static readonly SCOPE_DESCRIPTIONS: Record<PermissionScope, string> = {
    [PermissionScope.SYSTEM]: "系统级权限",
    [PermissionScope.TENANT]: "租户级权限",
    [PermissionScope.ORGANIZATION]: "组织级权限",
    [PermissionScope.DEPARTMENT]: "部门级权限",
    [PermissionScope.RESOURCE]: "资源级权限",
  };

  /**
   * 检查是否为系统级权限
   *
   * @param scope - 权限作用域
   * @returns 是否为系统级权限
   * @example
   * ```typescript
   * const isSystem = PermissionScopeUtils.isSystemScope(PermissionScope.SYSTEM);
   * console.log(isSystem); // true
   * ```
   */
  static isSystemScope(scope: PermissionScope): boolean {
    return scope === PermissionScope.SYSTEM;
  }

  /**
   * 检查是否为租户级权限
   *
   * @param scope - 权限作用域
   * @returns 是否为租户级权限
   */
  static isTenantScope(scope: PermissionScope): boolean {
    return scope === PermissionScope.TENANT;
  }

  /**
   * 检查是否为组织级权限
   *
   * @param scope - 权限作用域
   * @returns 是否为组织级权限
   */
  static isOrganizationScope(scope: PermissionScope): boolean {
    return scope === PermissionScope.ORGANIZATION;
  }

  /**
   * 检查是否为部门级权限
   *
   * @param scope - 权限作用域
   * @returns 是否为部门级权限
   */
  static isDepartmentScope(scope: PermissionScope): boolean {
    return scope === PermissionScope.DEPARTMENT;
  }

  /**
   * 检查是否为资源级权限
   *
   * @param scope - 权限作用域
   * @returns 是否为资源级权限
   */
  static isResourceScope(scope: PermissionScope): boolean {
    return scope === PermissionScope.RESOURCE;
  }

  /**
   * 检查权限作用域是否高于指定作用域
   *
   * @param scope1 - 作用域1
   * @param scope2 - 作用域2
   * @returns 作用域1是否高于作用域2
   */
  static hasHigherScope(scope1: PermissionScope, scope2: PermissionScope): boolean {
    return this.SCOPE_HIERARCHY[scope1] > this.SCOPE_HIERARCHY[scope2];
  }

  /**
   * 检查权限作用域是否等于或高于指定作用域
   *
   * @param scope1 - 作用域1
   * @param scope2 - 作用域2
   * @returns 作用域1是否等于或高于作用域2
   */
  static hasScopeOrHigher(scope1: PermissionScope, scope2: PermissionScope): boolean {
    return this.SCOPE_HIERARCHY[scope1] >= this.SCOPE_HIERARCHY[scope2];
  }

  /**
   * 获取作用域描述
   *
   * @param scope - 权限作用域
   * @returns 作用域描述
   */
  static getDescription(scope: PermissionScope): string {
    return this.SCOPE_DESCRIPTIONS[scope] || "未知权限作用域";
  }

  /**
   * 获取所有作用域
   *
   * @returns 所有作用域数组
   */
  static getAllScopes(): PermissionScope[] {
    return Object.values(PermissionScope);
  }

  /**
   * 获取管理作用域（系统、租户、组织、部门）
   *
   * @returns 管理作用域数组
   */
  static getManagementScopes(): PermissionScope[] {
    return [
      PermissionScope.SYSTEM,
      PermissionScope.TENANT,
      PermissionScope.ORGANIZATION,
      PermissionScope.DEPARTMENT,
    ];
  }
}
