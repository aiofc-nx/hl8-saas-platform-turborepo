/**
 * 权限类型枚举
 *
 * @description 定义系统中所有权限类型的枚举值
 *
 * ## 业务规则
 *
 * ### 权限类型规则
 * - 系统权限：系统级别的权限，影响整个平台
 * - 租户权限：租户级别的权限，影响特定租户
 * - 组织权限：组织级别的权限，影响特定组织
 * - 部门权限：部门级别的权限，影响特定部门
 * - 资源权限：特定资源的权限，如文件、数据等
 * - 功能权限：特定功能的权限，如创建、编辑、删除等
 * - 数据权限：数据访问的权限，如查看、修改等
 *
 * ### 权限作用域规则
 * - 系统权限：最高权限，可以管理所有资源
 * - 租户权限：可以管理租户内的所有资源
 * - 组织权限：可以管理组织内的资源
 * - 部门权限：可以管理部门内的资源
 * - 资源权限：特定资源的操作权限
 * - 功能权限：特定功能的操作权限
 * - 数据权限：数据访问的操作权限
 *
 * @example
 * ```typescript
 * import { PermissionType } from './permission-type.enum.js';
 *
 * // 检查权限类型
 * console.log(PermissionType.SYSTEM); // "SYSTEM"
 * console.log(PermissionTypeUtils.isSystemPermission(PermissionType.SYSTEM)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum PermissionType {
  /** 系统权限 */
  SYSTEM = "SYSTEM",
  /** 租户权限 */
  TENANT = "TENANT",
  /** 组织权限 */
  ORGANIZATION = "ORGANIZATION",
  /** 部门权限 */
  DEPARTMENT = "DEPARTMENT",
  /** 资源权限 */
  RESOURCE = "RESOURCE",
  /** 功能权限 */
  FEATURE = "FEATURE",
  /** 数据权限 */
  DATA = "DATA",
}

/**
 * 权限类型工具类
 *
 * @description 提供权限类型相关的工具方法
 */
export class PermissionTypeUtils {
  /**
   * 权限类型层级映射
   */
  private static readonly TYPE_HIERARCHY: Record<PermissionType, number> = {
    [PermissionType.SYSTEM]: 7,
    [PermissionType.TENANT]: 6,
    [PermissionType.ORGANIZATION]: 5,
    [PermissionType.DEPARTMENT]: 4,
    [PermissionType.RESOURCE]: 3,
    [PermissionType.FEATURE]: 2,
    [PermissionType.DATA]: 1,
  };

  /**
   * 权限类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<PermissionType, string> = {
    [PermissionType.SYSTEM]: "系统权限",
    [PermissionType.TENANT]: "租户权限",
    [PermissionType.ORGANIZATION]: "组织权限",
    [PermissionType.DEPARTMENT]: "部门权限",
    [PermissionType.RESOURCE]: "资源权限",
    [PermissionType.FEATURE]: "功能权限",
    [PermissionType.DATA]: "数据权限",
  };

  /**
   * 检查是否为系统权限
   *
   * @param type - 权限类型
   * @returns 是否为系统权限
   * @example
   * ```typescript
   * const isSystem = PermissionTypeUtils.isSystemPermission(PermissionType.SYSTEM);
   * console.log(isSystem); // true
   * ```
   */
  static isSystemPermission(type: PermissionType): boolean {
    return type === PermissionType.SYSTEM;
  }

  /**
   * 检查是否为租户权限
   *
   * @param type - 权限类型
   * @returns 是否为租户权限
   */
  static isTenantPermission(type: PermissionType): boolean {
    return type === PermissionType.TENANT;
  }

  /**
   * 检查是否为组织权限
   *
   * @param type - 权限类型
   * @returns 是否为组织权限
   */
  static isOrganizationPermission(type: PermissionType): boolean {
    return type === PermissionType.ORGANIZATION;
  }

  /**
   * 检查是否为部门权限
   *
   * @param type - 权限类型
   * @returns 是否为部门权限
   */
  static isDepartmentPermission(type: PermissionType): boolean {
    return type === PermissionType.DEPARTMENT;
  }

  /**
   * 检查是否为资源权限
   *
   * @param type - 权限类型
   * @returns 是否为资源权限
   */
  static isResourcePermission(type: PermissionType): boolean {
    return type === PermissionType.RESOURCE;
  }

  /**
   * 检查是否为功能权限
   *
   * @param type - 权限类型
   * @returns 是否为功能权限
   */
  static isFeaturePermission(type: PermissionType): boolean {
    return type === PermissionType.FEATURE;
  }

  /**
   * 检查是否为数据权限
   *
   * @param type - 权限类型
   * @returns 是否为数据权限
   */
  static isDataPermission(type: PermissionType): boolean {
    return type === PermissionType.DATA;
  }

  /**
   * 检查权限类型是否高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否高于类型2
   */
  static hasHigherScope(type1: PermissionType, type2: PermissionType): boolean {
    return this.TYPE_HIERARCHY[type1] > this.TYPE_HIERARCHY[type2];
  }

  /**
   * 检查权限类型是否等于或高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否等于或高于类型2
   */
  static hasScopeOrHigher(type1: PermissionType, type2: PermissionType): boolean {
    return this.TYPE_HIERARCHY[type1] >= this.TYPE_HIERARCHY[type2];
  }

  /**
   * 获取权限类型描述
   *
   * @param type - 权限类型
   * @returns 权限类型描述
   */
  static getDescription(type: PermissionType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知权限类型";
  }

  /**
   * 获取所有权限类型
   *
   * @returns 所有权限类型数组
   */
  static getAllTypes(): PermissionType[] {
    return Object.values(PermissionType);
  }

  /**
   * 获取管理权限类型（系统、租户、组织、部门）
   *
   * @returns 管理权限类型数组
   */
  static getManagementTypes(): PermissionType[] {
    return [
      PermissionType.SYSTEM,
      PermissionType.TENANT,
      PermissionType.ORGANIZATION,
      PermissionType.DEPARTMENT,
    ];
  }
}
