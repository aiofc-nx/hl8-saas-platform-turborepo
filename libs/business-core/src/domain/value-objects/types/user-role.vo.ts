/**
 * 用户角色值对象
 *
 * @description 定义用户的角色枚举和验证逻辑
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../base-value-object.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { InvalidUserRoleException } from "../../exceptions/validation-exceptions.js";

/**
 * 用户角色枚举
 */
export enum UserRoleValue {
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
 * 用户角色值对象
 *
 * @description 表示用户的角色，包括超级管理员、系统管理员、租户管理员等角色
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
 * // 创建用户角色
 * const role = UserRole.create('TENANT_ADMIN');
 * 
 * // 检查角色
 * console.log(role.isAdmin()); // true
 * console.log(role.canManageUsers()); // true
 * 
 * // 角色比较
 * const userRole = UserRole.USER;
 * console.log(role.hasHigherRoleThan(userRole)); // true
 * ```
 *
 * @since 1.0.0
 */
export class UserRole extends BaseValueObject<UserRoleValue> {
  private _exceptionFactory: ExceptionFactory;
  /**
   * 创建用户角色
   *
   * @param value - 角色值
   * @returns 用户角色实例
   */
  static create(value: string): UserRole {
    return new UserRole(value as UserRoleValue);
  }

  /**
   * 超级管理员角色
   */
  static get SUPER_ADMIN(): UserRole {
    return new UserRole(UserRoleValue.SUPER_ADMIN);
  }

  /**
   * 系统管理员角色
   */
  static get SYSTEM_ADMIN(): UserRole {
    return new UserRole(UserRoleValue.SYSTEM_ADMIN);
  }

  /**
   * 租户管理员角色
   */
  static get TENANT_ADMIN(): UserRole {
    return new UserRole(UserRoleValue.TENANT_ADMIN);
  }

  /**
   * 组织管理员角色
   */
  static get ORGANIZATION_ADMIN(): UserRole {
    return new UserRole(UserRoleValue.ORGANIZATION_ADMIN);
  }

  /**
   * 部门管理员角色
   */
  static get DEPARTMENT_ADMIN(): UserRole {
    return new UserRole(UserRoleValue.DEPARTMENT_ADMIN);
  }

  /**
   * 普通用户角色
   */
  static get USER(): UserRole {
    return new UserRole(UserRoleValue.USER);
  }

  /**
   * 访客角色
   */
  static get GUEST(): UserRole {
    return new UserRole(UserRoleValue.GUEST);
  }

  /**
   * 验证角色值
   *
   * @param value - 角色值
   * @protected
   */
  protected validate(value: UserRoleValue): void {
    if (!this._exceptionFactory) {
      this._exceptionFactory = ExceptionFactory.getInstance();
    }
    
    this.validateNotEmpty(value, "用户角色");
    const validRoles = Object.values(UserRoleValue);
    if (!validRoles.includes(value)) {
      throw this._exceptionFactory.createInvalidUserRole(value, `无效的用户角色: ${value}`);
    }
  }

  /**
   * 转换角色值
   *
   * @param value - 角色值
   * @returns 转换后的角色值
   * @protected
   */
  protected transform(value: UserRoleValue): UserRoleValue {
    return value;
  }

  /**
   * 检查是否为管理员角色
   *
   * @returns 是否为管理员角色
   */
  isAdmin(): boolean {
    return [
      UserRoleValue.SUPER_ADMIN,
      UserRoleValue.SYSTEM_ADMIN,
      UserRoleValue.TENANT_ADMIN,
      UserRoleValue.ORGANIZATION_ADMIN,
      UserRoleValue.DEPARTMENT_ADMIN,
    ].includes(this.value);
  }

  /**
   * 检查是否为超级管理员
   *
   * @returns 是否为超级管理员
   */
  isSuperAdmin(): boolean {
    return this.value === UserRoleValue.SUPER_ADMIN;
  }

  /**
   * 检查是否为系统管理员
   *
   * @returns 是否为系统管理员
   */
  isSystemAdmin(): boolean {
    return this.value === UserRoleValue.SYSTEM_ADMIN;
  }

  /**
   * 检查是否为租户管理员
   *
   * @returns 是否为租户管理员
   */
  isTenantAdmin(): boolean {
    return this.value === UserRoleValue.TENANT_ADMIN;
  }

  /**
   * 检查是否为组织管理员
   *
   * @returns 是否为组织管理员
   */
  isOrganizationAdmin(): boolean {
    return this.value === UserRoleValue.ORGANIZATION_ADMIN;
  }

  /**
   * 检查是否为部门管理员
   *
   * @returns 是否为部门管理员
   */
  isDepartmentAdmin(): boolean {
    return this.value === UserRoleValue.DEPARTMENT_ADMIN;
  }

  /**
   * 检查是否为普通用户
   *
   * @returns 是否为普通用户
   */
  isUser(): boolean {
    return this.value === UserRoleValue.USER;
  }

  /**
   * 检查是否为访客
   *
   * @returns 是否为访客
   */
  isGuest(): boolean {
    return this.value === UserRoleValue.GUEST;
  }

  /**
   * 检查是否可以管理用户
   *
   * @returns 是否可以管理用户
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * 检查是否可以管理系统
   *
   * @returns 是否可以管理系统
   */
  canManageSystem(): boolean {
    return this.isSuperAdmin() || this.isSystemAdmin();
  }

  /**
   * 检查是否可以管理租户
   *
   * @returns 是否可以管理租户
   */
  canManageTenant(): boolean {
    return this.isSuperAdmin() || this.isSystemAdmin() || this.isTenantAdmin();
  }

  /**
   * 检查是否可以管理组织
   *
   * @returns 是否可以管理组织
   */
  canManageOrganization(): boolean {
    return this.canManageTenant() || this.isOrganizationAdmin();
  }

  /**
   * 检查是否可以管理部门
   *
   * @returns 是否可以管理部门
   */
  canManageDepartment(): boolean {
    return this.canManageOrganization() || this.isDepartmentAdmin();
  }

  /**
   * 检查角色是否高于指定角色
   *
   * @param otherRole - 其他角色
   * @returns 是否高于指定角色
   */
  hasHigherRoleThan(otherRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRoleValue.SUPER_ADMIN]: 7,
      [UserRoleValue.SYSTEM_ADMIN]: 6,
      [UserRoleValue.TENANT_ADMIN]: 5,
      [UserRoleValue.ORGANIZATION_ADMIN]: 4,
      [UserRoleValue.DEPARTMENT_ADMIN]: 3,
      [UserRoleValue.USER]: 2,
      [UserRoleValue.GUEST]: 1,
    };

    return roleHierarchy[this.value] > roleHierarchy[otherRole.value];
  }

  /**
   * 检查角色是否等于或高于指定角色
   *
   * @param otherRole - 其他角色
   * @returns 是否等于或高于指定角色
   */
  hasRoleOrHigher(otherRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRoleValue.SUPER_ADMIN]: 7,
      [UserRoleValue.SYSTEM_ADMIN]: 6,
      [UserRoleValue.TENANT_ADMIN]: 5,
      [UserRoleValue.ORGANIZATION_ADMIN]: 4,
      [UserRoleValue.DEPARTMENT_ADMIN]: 3,
      [UserRoleValue.USER]: 2,
      [UserRoleValue.GUEST]: 1,
    };

    return roleHierarchy[this.value] >= roleHierarchy[otherRole.value];
  }

  /**
   * 获取角色描述
   *
   * @returns 角色描述
   */
  getDescription(): string {
    const descriptions = {
      [UserRoleValue.SUPER_ADMIN]: "超级管理员",
      [UserRoleValue.SYSTEM_ADMIN]: "系统管理员",
      [UserRoleValue.TENANT_ADMIN]: "租户管理员",
      [UserRoleValue.ORGANIZATION_ADMIN]: "组织管理员",
      [UserRoleValue.DEPARTMENT_ADMIN]: "部门管理员",
      [UserRoleValue.USER]: "普通用户",
      [UserRoleValue.GUEST]: "访客",
    };
    return descriptions[this.value] || "未知角色";
  }
}
