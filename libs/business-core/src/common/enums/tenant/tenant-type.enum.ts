/**
 * 租户类型枚举
 *
 * @description 定义系统中所有租户类型的枚举值
 *
 * ## 业务规则
 *
 * ### 租户类型规则
 * - 企业租户：大型企业客户，拥有完整功能权限和最大资源配额
 * - 社群租户：社群组织，支持多用户协作和分享功能
 * - 团队租户：小型团队，提供基础协作功能
 * - 个人租户：个人用户，提供基础功能权限
 *
 * ### 权限级别规则
 * - 企业租户：最高权限级别（4级）
 * - 社群租户：高级权限级别（3级）
 * - 团队租户：基础权限级别（2级）
 * - 个人租户：最低权限级别（1级）
 *
 * @example
 * ```typescript
 * import { TenantType } from './tenant-type.enum.js';
 *
 * // 检查租户类型
 * console.log(TenantType.ENTERPRISE); // "ENTERPRISE"
 * console.log(TenantTypeUtils.isEnterprise(TenantType.ENTERPRISE)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum TenantType {
  /** 企业租户 */
  ENTERPRISE = "ENTERPRISE",
  /** 社群租户 */
  COMMUNITY = "COMMUNITY",
  /** 团队租户 */
  TEAM = "TEAM",
  /** 个人租户 */
  PERSONAL = "PERSONAL",
}

/**
 * 租户配额接口
 */
export interface TenantQuota {
  /** 最大用户数 */
  maxUsers: number;
  /** 最大存储空间（GB） */
  maxStorage: number;
  /** 最大项目数 */
  maxProjects: number;
  /** 最大组织数 */
  maxOrganizations: number;
}

/**
 * 租户类型工具类
 *
 * @description 提供租户类型相关的工具方法
 */
export class TenantTypeUtils {
  /**
   * 租户类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<TenantType, string> = {
    [TenantType.ENTERPRISE]: "大型企业客户，拥有完整功能权限和最大资源配额",
    [TenantType.COMMUNITY]: "社群组织，支持多用户协作和分享功能",
    [TenantType.TEAM]: "小型团队，提供基础协作功能",
    [TenantType.PERSONAL]: "个人用户，提供基础功能权限",
  };

  /**
   * 租户类型显示名称映射
   */
  private static readonly TYPE_DISPLAY_NAMES: Record<TenantType, string> = {
    [TenantType.ENTERPRISE]: "企业租户",
    [TenantType.COMMUNITY]: "社群租户",
    [TenantType.TEAM]: "团队租户",
    [TenantType.PERSONAL]: "个人租户",
  };

  /**
   * 租户类型权限级别映射
   */
  private static readonly TYPE_PERMISSION_LEVELS: Record<TenantType, number> = {
    [TenantType.ENTERPRISE]: 4,
    [TenantType.COMMUNITY]: 3,
    [TenantType.TEAM]: 2,
    [TenantType.PERSONAL]: 1,
  };

  /**
   * 租户类型配额映射
   */
  private static readonly TYPE_QUOTAS: Record<TenantType, TenantQuota> = {
    [TenantType.ENTERPRISE]: {
      maxUsers: 10000,
      maxStorage: 1000,
      maxProjects: 1000,
      maxOrganizations: 100,
    },
    [TenantType.COMMUNITY]: {
      maxUsers: 1000,
      maxStorage: 100,
      maxProjects: 100,
      maxOrganizations: 10,
    },
    [TenantType.TEAM]: {
      maxUsers: 50,
      maxStorage: 10,
      maxProjects: 20,
      maxOrganizations: 5,
    },
    [TenantType.PERSONAL]: {
      maxUsers: 1,
      maxStorage: 1,
      maxProjects: 5,
      maxOrganizations: 1,
    },
  };

  /**
   * 检查是否为企业租户
   *
   * @param type - 租户类型
   * @returns 是否为企业租户
   * @example
   * ```typescript
   * const isEnterprise = TenantTypeUtils.isEnterprise(TenantType.ENTERPRISE);
   * console.log(isEnterprise); // true
   * ```
   */
  static isEnterprise(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }

  /**
   * 检查是否为社群租户
   *
   * @param type - 租户类型
   * @returns 是否为社群租户
   */
  static isCommunity(type: TenantType): boolean {
    return type === TenantType.COMMUNITY;
  }

  /**
   * 检查是否为团队租户
   *
   * @param type - 租户类型
   * @returns 是否为团队租户
   */
  static isTeam(type: TenantType): boolean {
    return type === TenantType.TEAM;
  }

  /**
   * 检查是否为个人租户
   *
   * @param type - 租户类型
   * @returns 是否为个人租户
   */
  static isPersonal(type: TenantType): boolean {
    return type === TenantType.PERSONAL;
  }

  /**
   * 获取租户类型描述
   *
   * @param type - 租户类型
   * @returns 租户类型描述
   */
  static getDescription(type: TenantType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知租户类型";
  }

  /**
   * 获取租户类型显示名称
   *
   * @param type - 租户类型
   * @returns 显示名称
   */
  static getDisplayName(type: TenantType): string {
    return this.TYPE_DISPLAY_NAMES[type] || "未知类型";
  }

  /**
   * 获取租户类型权限级别
   *
   * @param type - 租户类型
   * @returns 权限级别
   */
  static getPermissionLevel(type: TenantType): number {
    return this.TYPE_PERMISSION_LEVELS[type] || 0;
  }

  /**
   * 获取租户类型配额
   *
   * @param type - 租户类型
   * @returns 配额信息
   */
  static getQuota(type: TenantType): TenantQuota {
    return (
      this.TYPE_QUOTAS[type] || {
        maxUsers: 0,
        maxStorage: 0,
        maxProjects: 0,
        maxOrganizations: 0,
      }
    );
  }

  /**
   * 检查租户类型是否支持多用户
   *
   * @param type - 租户类型
   * @returns 是否支持多用户
   */
  static supportsMultiUser(type: TenantType): boolean {
    return type !== TenantType.PERSONAL;
  }

  /**
   * 检查租户类型是否支持组织管理
   *
   * @param type - 租户类型
   * @returns 是否支持组织管理
   */
  static supportsOrganizationManagement(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE || type === TenantType.COMMUNITY;
  }

  /**
   * 检查租户类型是否支持高级功能
   *
   * @param type - 租户类型
   * @returns 是否支持高级功能
   */
  static supportsAdvancedFeatures(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }

  /**
   * 检查租户类型权限级别是否高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否高于类型2
   */
  static hasHigherPermissionLevel(
    type1: TenantType,
    type2: TenantType,
  ): boolean {
    return (
      this.TYPE_PERMISSION_LEVELS[type1] > this.TYPE_PERMISSION_LEVELS[type2]
    );
  }

  /**
   * 比较两个租户类型的权限级别
   *
   * @param type1 - 第一个租户类型
   * @param type2 - 第二个租户类型
   * @returns 比较结果：1表示type1权限更高，-1表示type2权限更高，0表示相等
   */
  static comparePermissionLevel(type1: TenantType, type2: TenantType): number {
    const level1 = this.TYPE_PERMISSION_LEVELS[type1];
    const level2 = this.TYPE_PERMISSION_LEVELS[type2];

    if (level1 > level2) return 1;
    if (level1 < level2) return -1;
    return 0;
  }

  /**
   * 获取所有租户类型
   *
   * @returns 所有租户类型数组
   */
  static getAllTypes(): TenantType[] {
    return Object.values(TenantType);
  }

  /**
   * 获取企业级租户类型（企业、社群）
   *
   * @returns 企业级租户类型数组
   */
  static getEnterpriseLevelTypes(): TenantType[] {
    return [TenantType.ENTERPRISE, TenantType.COMMUNITY];
  }

  /**
   * 获取基础级租户类型（团队、个人）
   *
   * @returns 基础级租户类型数组
   */
  static getBasicLevelTypes(): TenantType[] {
    return [TenantType.TEAM, TenantType.PERSONAL];
  }
}
