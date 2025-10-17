/**
 * 租户类型值对象
 *
 * 定义SAAS平台支持的租户类型，包括企业租户、社群租户、团队租户、个人租户
 *
 * @description 租户类型是SAAS平台的核心概念，决定了租户的功能权限、资源配额和计费模式
 *
 * ## 业务规则
 *
 * ### 租户类型规则
 * - 企业租户：大型企业客户，拥有完整功能权限
 * - 社群租户：社群组织，支持协作和分享功能
 * - 团队租户：小型团队，基础协作功能
 * - 个人租户：个人用户，基础功能权限
 *
 * ### 权限规则
 * - 企业租户拥有最高权限级别
 * - 社群租户支持多用户协作
 * - 团队租户支持小团队协作
 * - 个人租户仅支持个人使用
 *
 * ### 资源配额规则
 * - 不同租户类型有不同的资源配额限制
 * - 企业租户拥有最大资源配额
 * - 个人租户拥有最小资源配额
 *
 * @example
 * ```typescript
 * // 创建企业租户类型
 * const enterpriseType = TenantType.create('ENTERPRISE');
 *
 * // 检查租户类型
 * if (tenantType.isEnterprise()) {
 *   // 企业租户逻辑
 * }
 *
 * // 获取租户类型显示名称
 * const displayName = tenantType.getDisplayName();
 * ```
 *
 * @since 1.0.0
 */
import { BaseValueObject } from "../base-value-object.js";
import { BusinessRuleViolationException } from "../../exceptions/base/base-domain-exception.js";
import { ErrorCodes } from "../../constants/index.js";
import {
  TenantType as TenantTypeEnum,
  TenantTypeUtils,
} from "../../enums/index.js";

export class TenantType extends BaseValueObject<string> {
  /**
   * 企业租户
   */
  public static readonly ENTERPRISE = new TenantType(TenantTypeEnum.ENTERPRISE);

  /**
   * 社群租户
   */
  public static readonly COMMUNITY = new TenantType(TenantTypeEnum.COMMUNITY);

  /**
   * 团队租户
   */
  public static readonly TEAM = new TenantType(TenantTypeEnum.TEAM);

  /**
   * 个人租户
   */
  public static readonly PERSONAL = new TenantType(TenantTypeEnum.PERSONAL);

  /**
   * 所有租户类型
   */
  public static readonly ALL_TYPES = [
    TenantType.ENTERPRISE,
    TenantType.COMMUNITY,
    TenantType.TEAM,
    TenantType.PERSONAL,
  ];

  /**
   * 构造函数
   *
   * @param value 租户类型值
   */
  constructor(value: string) {
    super(value);
  }

  /**
   * 验证租户类型值
   *
   * @param value 租户类型值
   * @throws {Error} 当租户类型无效时抛出错误
   * @protected
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "租户类型");

    const validTypes = TenantTypeUtils.getAllTypes().map((type) =>
      type.toString(),
    );
    if (!validTypes.includes(value.toUpperCase())) {
      throw new BusinessRuleViolationException(
        `无效的租户类型: ${value}。有效类型: ${validTypes.join(", ")}`,
        ErrorCodes.VALIDATION_FAILED,
      );
    }
  }

  /**
   * 转换租户类型值
   *
   * @param value 租户类型值
   * @returns 转换后的值
   * @protected
   */
  protected transform(value: string): string {
    return value.toUpperCase();
  }

  /**
   * 从字符串创建租户类型
   *
   * @param value 租户类型字符串
   * @returns TenantType实例
   * @throws {Error} 当租户类型无效时抛出错误
   */
  static fromString(value: string): TenantType {
    const normalizedValue = value.toUpperCase();

    switch (normalizedValue) {
      case TenantTypeEnum.ENTERPRISE:
        return TenantType.ENTERPRISE;
      case TenantTypeEnum.COMMUNITY:
        return TenantType.COMMUNITY;
      case TenantTypeEnum.TEAM:
        return TenantType.TEAM;
      case TenantTypeEnum.PERSONAL:
        return TenantType.PERSONAL;
      default:
        throw new BusinessRuleViolationException(
          `无效的租户类型: ${value}`,
          ErrorCodes.VALIDATION_FAILED,
        );
    }
  }

  /**
   * 检查是否为企业租户
   *
   * @returns 是否为企业租户
   */
  isEnterprise(): boolean {
    return this.value === TenantTypeEnum.ENTERPRISE;
  }

  /**
   * 检查是否为社群租户
   *
   * @returns 是否为社群租户
   */
  isCommunity(): boolean {
    return this.value === TenantTypeEnum.COMMUNITY;
  }

  /**
   * 检查是否为团队租户
   *
   * @returns 是否为团队租户
   */
  isTeam(): boolean {
    return this.value === TenantTypeEnum.TEAM;
  }

  /**
   * 检查是否为个人租户
   *
   * @returns 是否为个人租户
   */
  isPersonal(): boolean {
    return this.value === TenantTypeEnum.PERSONAL;
  }

  /**
   * 获取租户类型显示名称
   *
   * @returns 显示名称
   */
  getDisplayName(): string {
    return TenantTypeUtils.getDisplayName(this.value as TenantTypeEnum);
  }

  /**
   * 获取租户类型描述
   *
   * @returns 类型描述
   */
  getDescription(): string {
    return TenantTypeUtils.getDescription(this.value as TenantTypeEnum);
  }

  /**
   * 获取权限级别
   *
   * @returns 权限级别（数字越大权限越高）
   */
  getPermissionLevel(): number {
    return TenantTypeUtils.getPermissionLevel(this.value as TenantTypeEnum);
  }

  /**
   * 获取资源配额限制
   *
   * @returns 资源配额配置
   */
  getResourceQuota(): {
    maxUsers: number;
    maxStorage: number; // GB
    maxProjects: number;
    maxOrganizations: number;
  } {
    return TenantTypeUtils.getQuota(this.value as TenantTypeEnum);
  }

  /**
   * 检查是否支持多用户
   *
   * @returns 是否支持多用户
   */
  supportsMultiUser(): boolean {
    return TenantTypeUtils.supportsMultiUser(this.value as TenantTypeEnum);
  }

  /**
   * 检查是否支持组织管理
   *
   * @returns 是否支持组织管理
   */
  supportsOrganizationManagement(): boolean {
    return TenantTypeUtils.supportsOrganizationManagement(
      this.value as TenantTypeEnum,
    );
  }

  /**
   * 检查是否支持高级功能
   *
   * @returns 是否支持高级功能
   */
  supportsAdvancedFeatures(): boolean {
    return TenantTypeUtils.supportsAdvancedFeatures(
      this.value as TenantTypeEnum,
    );
  }

  /**
   * 值对象相等性比较
   *
   * @param other 另一个TenantType实例
   * @returns 是否相等
   */
  equals(other: TenantType | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * 转换为字符串
   *
   * @returns 租户类型字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 转换为JSON
   *
   * @returns JSON对象
   */
  toJSON(): Record<string, any> {
    return {
      value: this.value,
      displayName: this.getDisplayName(),
      description: this.getDescription(),
      permissionLevel: this.getPermissionLevel(),
      resourceQuota: this.getResourceQuota(),
      supportsMultiUser: this.supportsMultiUser(),
      supportsOrganizationManagement: this.supportsOrganizationManagement(),
      supportsAdvancedFeatures: this.supportsAdvancedFeatures(),
    };
  }
}
