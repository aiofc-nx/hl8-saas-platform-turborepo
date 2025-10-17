/**
 * 角色类型值对象
 *
 * @description 定义角色的类型枚举和验证逻辑
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../base-value-object.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { InvalidRoleTypeException } from "../../exceptions/validation-exceptions.js";

/**
 * 角色类型枚举
 */
export enum RoleTypeValue {
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
 * 角色类型值对象
 *
 * @description 表示角色的类型，决定角色的作用域和权限范围
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
 * // 创建角色类型
 * const roleType = RoleType.create('TENANT');
 * 
 * // 检查角色类型
 * console.log(roleType.isSystemRole()); // false
 * console.log(roleType.isTenantRole()); // true
 * 
 * // 角色类型比较
 * const systemRole = RoleType.SYSTEM;
 * console.log(roleType.hasHigherScopeThan(systemRole)); // false
 * ```
 *
 * @since 1.0.0
 */
export class RoleType extends BaseValueObject<RoleTypeValue> {
  private _exceptionFactory: ExceptionFactory;
  /**
   * 系统角色类型
   */
  static get SYSTEM(): RoleType {
    return new RoleType(RoleTypeValue.SYSTEM);
  }

  /**
   * 租户角色类型
   */
  static get TENANT(): RoleType {
    return new RoleType(RoleTypeValue.TENANT);
  }

  /**
   * 组织角色类型
   */
  static get ORGANIZATION(): RoleType {
    return new RoleType(RoleTypeValue.ORGANIZATION);
  }

  /**
   * 部门角色类型
   */
  static get DEPARTMENT(): RoleType {
    return new RoleType(RoleTypeValue.DEPARTMENT);
  }

  /**
   * 自定义角色类型
   */
  static get CUSTOM(): RoleType {
    return new RoleType(RoleTypeValue.CUSTOM);
  }

  /**
   * 验证角色类型值
   *
   * @param value - 角色类型值
   * @protected
   */
  protected validate(value: RoleTypeValue): void {
    this.validateNotEmpty(value, "角色类型");
    const validTypes = Object.values(RoleTypeValue);
    if (!validTypes.includes(value)) {
      if (!this._exceptionFactory) {
        this._exceptionFactory = ExceptionFactory.getInstance();
      }
      throw this._exceptionFactory.createInvalidRoleType(value.toString());
    }
  }

  /**
   * 转换角色类型值
   *
   * @param value - 角色类型值
   * @returns 转换后的角色类型值
   * @protected
   */
  protected transform(value: RoleTypeValue): RoleTypeValue {
    return value;
  }

  /**
   * 检查是否为系统角色
   *
   * @returns 是否为系统角色
   */
  isSystemRole(): boolean {
    return this.value === RoleTypeValue.SYSTEM;
  }

  /**
   * 检查是否为租户角色
   *
   * @returns 是否为租户角色
   */
  isTenantRole(): boolean {
    return this.value === RoleTypeValue.TENANT;
  }

  /**
   * 检查是否为组织角色
   *
   * @returns 是否为组织角色
   */
  isOrganizationRole(): boolean {
    return this.value === RoleTypeValue.ORGANIZATION;
  }

  /**
   * 检查是否为部门角色
   *
   * @returns 是否为部门角色
   */
  isDepartmentRole(): boolean {
    return this.value === RoleTypeValue.DEPARTMENT;
  }

  /**
   * 检查是否为自定义角色
   *
   * @returns 是否为自定义角色
   */
  isCustomRole(): boolean {
    return this.value === RoleTypeValue.CUSTOM;
  }

  /**
   * 检查角色类型是否高于指定类型
   *
   * @param otherType - 其他角色类型
   * @returns 是否高于指定类型
   */
  hasHigherScopeThan(otherType: RoleType): boolean {
    const scopeHierarchy = {
      [RoleTypeValue.SYSTEM]: 5,
      [RoleTypeValue.TENANT]: 4,
      [RoleTypeValue.ORGANIZATION]: 3,
      [RoleTypeValue.DEPARTMENT]: 2,
      [RoleTypeValue.CUSTOM]: 1,
    };

    return scopeHierarchy[this.value] > scopeHierarchy[otherType.value];
  }

  /**
   * 检查角色类型是否等于或高于指定类型
   *
   * @param otherType - 其他角色类型
   * @returns 是否等于或高于指定类型
   */
  hasScopeOrHigher(otherType: RoleType): boolean {
    const scopeHierarchy = {
      [RoleTypeValue.SYSTEM]: 5,
      [RoleTypeValue.TENANT]: 4,
      [RoleTypeValue.ORGANIZATION]: 3,
      [RoleTypeValue.DEPARTMENT]: 2,
      [RoleTypeValue.CUSTOM]: 1,
    };

    return scopeHierarchy[this.value] >= scopeHierarchy[otherType.value];
  }

  /**
   * 获取角色类型描述
   *
   * @returns 角色类型描述
   */
  getDescription(): string {
    const descriptions = {
      [RoleTypeValue.SYSTEM]: "系统角色",
      [RoleTypeValue.TENANT]: "租户角色",
      [RoleTypeValue.ORGANIZATION]: "组织角色",
      [RoleTypeValue.DEPARTMENT]: "部门角色",
      [RoleTypeValue.CUSTOM]: "自定义角色",
    };
    return descriptions[this.value] || "未知角色类型";
  }
}
