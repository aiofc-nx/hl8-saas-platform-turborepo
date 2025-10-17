/**
 * 权限类型值对象
 *
 * @description 定义权限的类型枚举和验证逻辑
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../base-value-object.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { InvalidPermissionTypeException } from "../../exceptions/validation-exceptions.js";

/**
 * 权限类型枚举
 */
export enum PermissionTypeValue {
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
 * 权限类型值对象
 *
 * @description 表示权限的类型，决定权限的作用域和范围
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
 * // 创建权限类型
 * const permissionType = PermissionType.create('TENANT');
 * 
 * // 检查权限类型
 * console.log(permissionType.isSystemPermission()); // false
 * console.log(permissionType.isTenantPermission()); // true
 * 
 * // 权限类型比较
 * const systemPermission = PermissionType.SYSTEM;
 * console.log(permissionType.hasHigherScopeThan(systemPermission)); // false
 * ```
 *
 * @since 1.0.0
 */
export class PermissionType extends BaseValueObject<PermissionTypeValue> {
  private _exceptionFactory: ExceptionFactory;
  /**
   * 系统权限类型
   */
  static get SYSTEM(): PermissionType {
    return new PermissionType(PermissionTypeValue.SYSTEM);
  }

  /**
   * 租户权限类型
   */
  static get TENANT(): PermissionType {
    return new PermissionType(PermissionTypeValue.TENANT);
  }

  /**
   * 组织权限类型
   */
  static get ORGANIZATION(): PermissionType {
    return new PermissionType(PermissionTypeValue.ORGANIZATION);
  }

  /**
   * 部门权限类型
   */
  static get DEPARTMENT(): PermissionType {
    return new PermissionType(PermissionTypeValue.DEPARTMENT);
  }

  /**
   * 资源权限类型
   */
  static get RESOURCE(): PermissionType {
    return new PermissionType(PermissionTypeValue.RESOURCE);
  }

  /**
   * 功能权限类型
   */
  static get FEATURE(): PermissionType {
    return new PermissionType(PermissionTypeValue.FEATURE);
  }

  /**
   * 数据权限类型
   */
  static get DATA(): PermissionType {
    return new PermissionType(PermissionTypeValue.DATA);
  }

  /**
   * 验证权限类型值
   *
   * @param value - 权限类型值
   * @protected
   */
  protected validate(value: PermissionTypeValue): void {
    this.validateNotEmpty(value, "权限类型");
    const validTypes = Object.values(PermissionTypeValue);
    if (!validTypes.includes(value)) {
      if (!this._exceptionFactory) {
        this._exceptionFactory = ExceptionFactory.getInstance();
      }
      throw this._exceptionFactory.createInvalidPermissionType(value.toString());
    }
  }

  /**
   * 转换权限类型值
   *
   * @param value - 权限类型值
   * @returns 转换后的权限类型值
   * @protected
   */
  protected transform(value: PermissionTypeValue): PermissionTypeValue {
    return value;
  }

  /**
   * 检查是否为系统权限
   *
   * @returns 是否为系统权限
   */
  isSystemPermission(): boolean {
    return this.value === PermissionTypeValue.SYSTEM;
  }

  /**
   * 检查是否为租户权限
   *
   * @returns 是否为租户权限
   */
  isTenantPermission(): boolean {
    return this.value === PermissionTypeValue.TENANT;
  }

  /**
   * 检查是否为组织权限
   *
   * @returns 是否为组织权限
   */
  isOrganizationPermission(): boolean {
    return this.value === PermissionTypeValue.ORGANIZATION;
  }

  /**
   * 检查是否为部门权限
   *
   * @returns 是否为部门权限
   */
  isDepartmentPermission(): boolean {
    return this.value === PermissionTypeValue.DEPARTMENT;
  }

  /**
   * 检查是否为资源权限
   *
   * @returns 是否为资源权限
   */
  isResourcePermission(): boolean {
    return this.value === PermissionTypeValue.RESOURCE;
  }

  /**
   * 检查是否为功能权限
   *
   * @returns 是否为功能权限
   */
  isFeaturePermission(): boolean {
    return this.value === PermissionTypeValue.FEATURE;
  }

  /**
   * 检查是否为数据权限
   *
   * @returns 是否为数据权限
   */
  isDataPermission(): boolean {
    return this.value === PermissionTypeValue.DATA;
  }

  /**
   * 检查权限类型是否高于指定类型
   *
   * @param otherType - 其他权限类型
   * @returns 是否高于指定类型
   */
  hasHigherScopeThan(otherType: PermissionType): boolean {
    const scopeHierarchy = {
      [PermissionTypeValue.SYSTEM]: 7,
      [PermissionTypeValue.TENANT]: 6,
      [PermissionTypeValue.ORGANIZATION]: 5,
      [PermissionTypeValue.DEPARTMENT]: 4,
      [PermissionTypeValue.RESOURCE]: 3,
      [PermissionTypeValue.FEATURE]: 2,
      [PermissionTypeValue.DATA]: 1,
    };

    return scopeHierarchy[this.value] > scopeHierarchy[otherType.value];
  }

  /**
   * 检查权限类型是否等于或高于指定类型
   *
   * @param otherType - 其他权限类型
   * @returns 是否等于或高于指定类型
   */
  hasScopeOrHigher(otherType: PermissionType): boolean {
    const scopeHierarchy = {
      [PermissionTypeValue.SYSTEM]: 7,
      [PermissionTypeValue.TENANT]: 6,
      [PermissionTypeValue.ORGANIZATION]: 5,
      [PermissionTypeValue.DEPARTMENT]: 4,
      [PermissionTypeValue.RESOURCE]: 3,
      [PermissionTypeValue.FEATURE]: 2,
      [PermissionTypeValue.DATA]: 1,
    };

    return scopeHierarchy[this.value] >= scopeHierarchy[otherType.value];
  }

  /**
   * 获取权限类型描述
   *
   * @returns 权限类型描述
   */
  getDescription(): string {
    const descriptions = {
      [PermissionTypeValue.SYSTEM]: "系统权限",
      [PermissionTypeValue.TENANT]: "租户权限",
      [PermissionTypeValue.ORGANIZATION]: "组织权限",
      [PermissionTypeValue.DEPARTMENT]: "部门权限",
      [PermissionTypeValue.RESOURCE]: "资源权限",
      [PermissionTypeValue.FEATURE]: "功能权限",
      [PermissionTypeValue.DATA]: "数据权限",
    };
    return descriptions[this.value] || "未知权限类型";
  }
}
