/**
 * 用户角色枚举
 *
 * @description 定义系统中所有用户角色的枚举值
 *
 * ## 业务规则
 *
 * ### 角色层级规则
 * - 超级管理员：最高权限，可以管理所有租户
 * - 系统管理员：可以管理系统配置和监控
 * - 租户管理员：可以管理租户内的所有资源
 * - 组织管理员：可以管理组织内的资源
 * - 部门管理员：可以管理部门内的资源
 * - 普通用户：基本的业务操作权限
 * - 访客：只读权限
 *
 * ### 角色权限规则
 * - 角色决定了用户的基本权限范围
 * - 高角色包含低角色的所有权限
 * - 角色可以通过权限分配进行扩展
 *
 * @example
 * ```typescript
 * import { UserRole } from './user-role.enum.js';
 *
 * // 检查角色
 * console.log(UserRole.SUPER_ADMIN); // "SUPER_ADMIN"
 * console.log(UserRole.isAdmin(UserRole.TENANT_ADMIN)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum UserRole {
  /** 超级管理员 */
  SUPER_ADMIN = "SUPER_ADMIN",
  /** 系统管理员 */
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  /** 租户管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",
  /** 组织管理员 */
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  /** 部门管理员 */
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
  /** 普通用户 */
  USER = "USER",
  /** 访客 */
  GUEST = "GUEST",
}

/**
 * 用户角色工具类
 *
 * @description 提供用户角色相关的工具方法
 */
export class UserRoleUtils {
  /**
   * 角色层级映射
   */
  private static readonly ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 7,
    [UserRole.SYSTEM_ADMIN]: 6,
    [UserRole.TENANT_ADMIN]: 5,
    [UserRole.ORGANIZATION_ADMIN]: 4,
    [UserRole.DEPARTMENT_ADMIN]: 3,
    [UserRole.USER]: 2,
    [UserRole.GUEST]: 1,
  };

  /**
   * 角色描述映射
   */
  private static readonly ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "超级管理员",
    [UserRole.SYSTEM_ADMIN]: "系统管理员",
    [UserRole.TENANT_ADMIN]: "租户管理员",
    [UserRole.ORGANIZATION_ADMIN]: "组织管理员",
    [UserRole.DEPARTMENT_ADMIN]: "部门管理员",
    [UserRole.USER]: "普通用户",
    [UserRole.GUEST]: "访客",
  };

  /**
   * 检查是否为管理员角色
   *
   * @param role - 用户角色
   * @returns 是否为管理员角色
   * @example
   * ```typescript
   * const isAdmin = UserRoleUtils.isAdmin(UserRole.TENANT_ADMIN);
   * console.log(isAdmin); // true
   * ```
   */
  static isAdmin(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.SYSTEM_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.ORGANIZATION_ADMIN,
      UserRole.DEPARTMENT_ADMIN,
    ].includes(role);
  }

  /**
   * 检查是否为超级管理员
   *
   * @param role - 用户角色
   * @returns 是否为超级管理员
   */
  static isSuperAdmin(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN;
  }

  /**
   * 检查是否为系统管理员
   *
   * @param role - 用户角色
   * @returns 是否为系统管理员
   */
  static isSystemAdmin(role: UserRole): boolean {
    return role === UserRole.SYSTEM_ADMIN;
  }

  /**
   * 检查是否为租户管理员
   *
   * @param role - 用户角色
   * @returns 是否为租户管理员
   */
  static isTenantAdmin(role: UserRole): boolean {
    return role === UserRole.TENANT_ADMIN;
  }

  /**
   * 检查角色是否高于指定角色
   *
   * @param role1 - 角色1
   * @param role2 - 角色2
   * @returns 角色1是否高于角色2
   */
  static hasHigherRole(role1: UserRole, role2: UserRole): boolean {
    return this.ROLE_HIERARCHY[role1] > this.ROLE_HIERARCHY[role2];
  }

  /**
   * 检查角色是否等于或高于指定角色
   *
   * @param role1 - 角色1
   * @param role2 - 角色2
   * @returns 角色1是否等于或高于角色2
   */
  static hasRoleOrHigher(role1: UserRole, role2: UserRole): boolean {
    return this.ROLE_HIERARCHY[role1] >= this.ROLE_HIERARCHY[role2];
  }

  /**
   * 获取角色描述
   *
   * @param role - 用户角色
   * @returns 角色描述
   */
  static getDescription(role: UserRole): string {
    return this.ROLE_DESCRIPTIONS[role] || "未知角色";
  }

  /**
   * 获取所有角色
   *
   * @returns 所有角色数组
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * 获取管理员角色
   *
   * @returns 管理员角色数组
   */
  static getAdminRoles(): UserRole[] {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.SYSTEM_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.ORGANIZATION_ADMIN,
      UserRole.DEPARTMENT_ADMIN,
    ];
  }
}
