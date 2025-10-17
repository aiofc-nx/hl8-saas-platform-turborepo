/**
 * 角色类型枚举
 *
 * @description 定义系统中所有角色类型的枚举值
 *
 * ## 业务规则
 *
 * ### 角色类型规则
 * - 系统角色：系统级别的角色，影响整个平台
 * - 租户角色：租户级别的角色，影响特定租户
 * - 组织角色：组织级别的角色，影响特定组织
 * - 部门角色：部门级别的角色，影响特定部门
 * - 自定义角色：用户自定义的角色，可以灵活配置权限
 *
 * ### 角色作用域规则
 * - 系统角色：最高权限，可以管理所有租户
 * - 租户角色：可以管理租户内的所有资源
 * - 组织角色：可以管理组织内的资源
 * - 部门角色：可以管理部门内的资源
 * - 自定义角色：根据配置的权限决定作用域
 *
 * @example
 * ```typescript
 * import { RoleType } from './role-type.enum.js';
 *
 * // 检查角色类型
 * console.log(RoleType.SYSTEM); // "SYSTEM"
 * console.log(RoleTypeUtils.isSystemRole(RoleType.SYSTEM)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum RoleType {
  /** 系统角色 */
  SYSTEM = "SYSTEM",
  /** 租户角色 */
  TENANT = "TENANT",
  /** 组织角色 */
  ORGANIZATION = "ORGANIZATION",
  /** 部门角色 */
  DEPARTMENT = "DEPARTMENT",
  /** 自定义角色 */
  CUSTOM = "CUSTOM",
}

/**
 * 角色类型工具类
 *
 * @description 提供角色类型相关的工具方法
 */
export class RoleTypeUtils {
  /**
   * 角色类型层级映射
   */
  private static readonly TYPE_HIERARCHY: Record<RoleType, number> = {
    [RoleType.SYSTEM]: 5,
    [RoleType.TENANT]: 4,
    [RoleType.ORGANIZATION]: 3,
    [RoleType.DEPARTMENT]: 2,
    [RoleType.CUSTOM]: 1,
  };

  /**
   * 角色类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<RoleType, string> = {
    [RoleType.SYSTEM]: "系统角色",
    [RoleType.TENANT]: "租户角色",
    [RoleType.ORGANIZATION]: "组织角色",
    [RoleType.DEPARTMENT]: "部门角色",
    [RoleType.CUSTOM]: "自定义角色",
  };

  /**
   * 检查是否为系统角色
   *
   * @param type - 角色类型
   * @returns 是否为系统角色
   * @example
   * ```typescript
   * const isSystem = RoleTypeUtils.isSystemRole(RoleType.SYSTEM);
   * console.log(isSystem); // true
   * ```
   */
  static isSystemRole(type: RoleType): boolean {
    return type === RoleType.SYSTEM;
  }

  /**
   * 检查是否为租户角色
   *
   * @param type - 角色类型
   * @returns 是否为租户角色
   */
  static isTenantRole(type: RoleType): boolean {
    return type === RoleType.TENANT;
  }

  /**
   * 检查是否为组织角色
   *
   * @param type - 角色类型
   * @returns 是否为组织角色
   */
  static isOrganizationRole(type: RoleType): boolean {
    return type === RoleType.ORGANIZATION;
  }

  /**
   * 检查是否为部门角色
   *
   * @param type - 角色类型
   * @returns 是否为部门角色
   */
  static isDepartmentRole(type: RoleType): boolean {
    return type === RoleType.DEPARTMENT;
  }

  /**
   * 检查是否为自定义角色
   *
   * @param type - 角色类型
   * @returns 是否为自定义角色
   */
  static isCustomRole(type: RoleType): boolean {
    return type === RoleType.CUSTOM;
  }

  /**
   * 检查角色类型是否高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否高于类型2
   */
  static hasHigherScope(type1: RoleType, type2: RoleType): boolean {
    return this.TYPE_HIERARCHY[type1] > this.TYPE_HIERARCHY[type2];
  }

  /**
   * 检查角色类型是否等于或高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否等于或高于类型2
   */
  static hasScopeOrHigher(type1: RoleType, type2: RoleType): boolean {
    return this.TYPE_HIERARCHY[type1] >= this.TYPE_HIERARCHY[type2];
  }

  /**
   * 获取角色类型描述
   *
   * @param type - 角色类型
   * @returns 角色类型描述
   */
  static getDescription(type: RoleType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知角色类型";
  }

  /**
   * 获取所有角色类型
   *
   * @returns 所有角色类型数组
   */
  static getAllTypes(): RoleType[] {
    return Object.values(RoleType);
  }

  /**
   * 获取管理角色类型（系统、租户、组织、部门）
   *
   * @returns 管理角色类型数组
   */
  static getManagementTypes(): RoleType[] {
    return [
      RoleType.SYSTEM,
      RoleType.TENANT,
      RoleType.ORGANIZATION,
      RoleType.DEPARTMENT,
    ];
  }
}
