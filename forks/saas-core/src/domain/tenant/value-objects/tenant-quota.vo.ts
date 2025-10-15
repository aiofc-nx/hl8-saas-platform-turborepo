/**
 * 租户配额值对象
 *
 * @description 封装租户资源配额的不可变对象
 *
 * ## 业务规则
 *
 * ### 配额类型
 * - maxUsers: 最大用户数
 * - maxStorageMB: 最大存储空间（MB）
 * - maxOrganizations: 最大组织数
 * - maxDepartmentLevels: 最大部门层级
 * - maxApiCallsPerDay: 每日API调用限制
 *
 * ### 不可变性
 * - 配额对象创建后不可修改
 * - 任何变更都创建新对象
 *
 * ## 使用场景
 *
 * 租户配额用于：
 * - 资源使用限制
 * - 租户类型配置
 * - 配额检查和警告
 *
 * @example
 * ```typescript
 * // 根据租户类型创建配额
 * const quota = TenantQuota.fromTenantType('FREE');
 *
 * // 创建自定义配额（使用继承的 create 方法）
 * const customQuota = TenantQuota.create({
 *   maxUsers: 100,
 *   maxStorageMB: 5120,
 *   maxOrganizations: 5,
 *   maxDepartmentLevels: 6,
 *   maxApiCallsPerDay: 50000,
 * });
 *
 * // 访问配额属性（通过 value 属性）
 * console.log(quota.value.maxUsers);
 * console.log(quota.getMaxUsers());
 *
 * // 检查是否达到配额
 * if (quota.isUserQuotaReached(currentUserCount)) {
 *   // 已达到用户配额
 * }
 * ```
 *
 * @class TenantQuota
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/hybrid-archi";
import { TENANT_TYPE_QUOTAS } from "../../../constants/tenant.constants";
import { TenantType } from "./tenant-type.enum";

/**
 * 租户配额属性
 *
 * @interface ITenantQuotaProps
 */
export interface ITenantQuotaProps {
  /** 最大用户数 */
  maxUsers: number;
  /** 最大存储空间（MB） */
  maxStorageMB: number;
  /** 最大组织数 */
  maxOrganizations: number;
  /** 最大部门层级 */
  maxDepartmentLevels: number;
  /** 每日API调用限制 */
  maxApiCallsPerDay: number;
}

export class TenantQuota extends BaseValueObject<ITenantQuotaProps> {
  /**
   * 验证租户配额
   *
   * @protected
   * @override
   */
  protected override validate(props: ITenantQuotaProps): void {
    // 验证所有配额值都是正数
    this.validatePositive(props.maxUsers, "最大用户数");
    this.validatePositive(props.maxStorageMB, "最大存储空间");
    this.validatePositive(props.maxOrganizations, "最大组织数");
    this.validatePositive(props.maxDepartmentLevels, "最大部门层级");
    this.validatePositive(props.maxApiCallsPerDay, "每日API调用限制");

    // 验证所有配额值都是整数
    this.validateInteger(props.maxUsers, "最大用户数");
    this.validateInteger(props.maxStorageMB, "最大存储空间");
    this.validateInteger(props.maxOrganizations, "最大组织数");
    this.validateInteger(props.maxDepartmentLevels, "最大部门层级");
    this.validateInteger(props.maxApiCallsPerDay, "每日API调用限制");
  }

  /**
   * 根据租户类型创建配额
   *
   * @static
   * @param {TenantType} tenantType - 租户类型
   * @returns {TenantQuota} 租户配额
   */
  public static fromTenantType(tenantType: TenantType): TenantQuota {
    const quotaConfig = TENANT_TYPE_QUOTAS[tenantType];
    if (!quotaConfig) {
      throw new Error(`未找到租户类型 ${tenantType} 的配额配置`);
    }
    return TenantQuota.create(quotaConfig);
  }

  // ============ 便捷访问属性（向后兼容） ============

  /**
   * 获取最大用户数（属性访问）
   */
  public get maxUsers(): number {
    return this._value.maxUsers;
  }

  /**
   * 获取最大存储空间（属性访问）
   */
  public get maxStorageMB(): number {
    return this._value.maxStorageMB;
  }

  /**
   * 获取最大组织数（属性访问）
   */
  public get maxOrganizations(): number {
    return this._value.maxOrganizations;
  }

  /**
   * 获取最大部门层级（属性访问）
   */
  public get maxDepartmentLevels(): number {
    return this._value.maxDepartmentLevels;
  }

  /**
   * 获取每日API调用限制（属性访问）
   */
  public get maxApiCallsPerDay(): number {
    return this._value.maxApiCallsPerDay;
  }

  // ============ 便捷访问方法 ============

  /**
   * 获取最大用户数
   */
  public getMaxUsers(): number {
    return this._value.maxUsers;
  }

  /**
   * 获取最大存储空间（MB）
   */
  public getMaxStorageMB(): number {
    return this._value.maxStorageMB;
  }

  /**
   * 获取最大组织数
   */
  public getMaxOrganizations(): number {
    return this._value.maxOrganizations;
  }

  /**
   * 获取最大部门层级
   */
  public getMaxDepartmentLevels(): number {
    return this._value.maxDepartmentLevels;
  }

  /**
   * 获取每日API调用限制
   */
  public getMaxApiCallsPerDay(): number {
    return this._value.maxApiCallsPerDay;
  }

  // ============ 配额检查方法 ============

  /**
   * 检查是否达到用户配额
   *
   * @param {number} currentUserCount - 当前用户数
   * @returns {boolean} 是否达到配额
   */
  public isUserQuotaReached(currentUserCount: number): boolean {
    return currentUserCount >= this._value.maxUsers;
  }

  /**
   * 检查是否达到存储配额
   *
   * @param {number} currentStorageMB - 当前存储空间（MB）
   * @returns {boolean} 是否达到配额
   */
  public isStorageQuotaReached(currentStorageMB: number): boolean {
    return currentStorageMB >= this._value.maxStorageMB;
  }

  /**
   * 检查是否达到组织配额
   *
   * @param {number} currentOrgCount - 当前组织数
   * @returns {boolean} 是否达到配额
   */
  public isOrganizationQuotaReached(currentOrgCount: number): boolean {
    return currentOrgCount >= this._value.maxOrganizations;
  }

  /**
   * 检查是否达到API调用配额
   *
   * @param {number} currentApiCalls - 当前API调用数
   * @returns {boolean} 是否达到配额
   */
  public isApiQuotaReached(currentApiCalls: number): boolean {
    return currentApiCalls >= this._value.maxApiCallsPerDay;
  }

  // ============ 配额使用率方法 ============

  /**
   * 计算用户配额使用率
   *
   * @param {number} currentUserCount - 当前用户数
   * @returns {number} 使用率（0-100）
   */
  public getUserQuotaUsage(currentUserCount: number): number {
    return Math.min((currentUserCount / this._value.maxUsers) * 100, 100);
  }

  /**
   * 计算存储配额使用率
   *
   * @param {number} currentStorageMB - 当前存储空间（MB）
   * @returns {number} 使用率（0-100）
   */
  public getStorageQuotaUsage(currentStorageMB: number): number {
    return Math.min((currentStorageMB / this._value.maxStorageMB) * 100, 100);
  }

  /**
   * 计算组织配额使用率
   *
   * @param {number} currentOrgCount - 当前组织数
   * @returns {number} 使用率（0-100）
   */
  public getOrganizationQuotaUsage(currentOrgCount: number): number {
    return Math.min(
      (currentOrgCount / this._value.maxOrganizations) * 100,
      100,
    );
  }

  /**
   * 计算API调用配额使用率
   *
   * @param {number} currentApiCalls - 当前API调用数
   * @returns {number} 使用率（0-100）
   */
  public getApiQuotaUsage(currentApiCalls: number): number {
    return Math.min(
      (currentApiCalls / this._value.maxApiCallsPerDay) * 100,
      100,
    );
  }

  // ============ 配额剩余量方法 ============

  /**
   * 获取剩余用户配额
   *
   * @param {number} currentUserCount - 当前用户数
   * @returns {number} 剩余配额
   */
  public getRemainingUsers(currentUserCount: number): number {
    return Math.max(this._value.maxUsers - currentUserCount, 0);
  }

  /**
   * 获取剩余存储配额（MB）
   *
   * @param {number} currentStorageMB - 当前存储空间（MB）
   * @returns {number} 剩余配额
   */
  public getRemainingStorageMB(currentStorageMB: number): number {
    return Math.max(this._value.maxStorageMB - currentStorageMB, 0);
  }

  /**
   * 获取剩余组织配额
   *
   * @param {number} currentOrgCount - 当前组织数
   * @returns {number} 剩余配额
   */
  public getRemainingOrganizations(currentOrgCount: number): number {
    return Math.max(this._value.maxOrganizations - currentOrgCount, 0);
  }

  /**
   * 获取剩余API调用配额
   *
   * @param {number} currentApiCalls - 当前API调用数
   * @returns {number} 剩余配额
   */
  public getRemainingApiCalls(currentApiCalls: number): number {
    return Math.max(this._value.maxApiCallsPerDay - currentApiCalls, 0);
  }

  // ============ 配额修改方法 ============

  /**
   * 增加用户配额
   *
   * @param {number} increment - 增加量
   * @returns {TenantQuota} 新的配额对象
   */
  public increaseUserQuota(increment: number): TenantQuota {
    return TenantQuota.create({
      ...this._value,
      maxUsers: this._value.maxUsers + increment,
    });
  }

  /**
   * 增加存储配额
   *
   * @param {number} incrementMB - 增加量（MB）
   * @returns {TenantQuota} 新的配额对象
   */
  public increaseStorageQuota(incrementMB: number): TenantQuota {
    return TenantQuota.create({
      ...this._value,
      maxStorageMB: this._value.maxStorageMB + incrementMB,
    });
  }

  /**
   * 增加组织配额
   *
   * @param {number} increment - 增加量
   * @returns {TenantQuota} 新的配额对象
   */
  public increaseOrganizationQuota(increment: number): TenantQuota {
    return TenantQuota.create({
      ...this._value,
      maxOrganizations: this._value.maxOrganizations + increment,
    });
  }

  /**
   * 增加API调用配额
   *
   * @param {number} increment - 增加量
   * @returns {TenantQuota} 新的配额对象
   */
  public increaseApiQuota(increment: number): TenantQuota {
    return TenantQuota.create({
      ...this._value,
      maxApiCallsPerDay: this._value.maxApiCallsPerDay + increment,
    });
  }
}
