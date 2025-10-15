/**
 * 租户类型枚举
 *
 * @description 定义租户的不同类型和对应的配额配置
 *
 * ## 业务规则
 *
 * ### 租户类型
 * - TRIAL: 试用版 - 30天试用期，基础功能
 * - BASIC: 基础版 - 适合小型团队，基础功能
 * - PROFESSIONAL: 专业版 - 适合中型企业，高级功能
 * - ENTERPRISE: 企业版 - 适合大型企业，全部功能
 *
 * ### 配额规则
 * - 每个类型都有对应的用户数、存储空间、API调用限制
 * - 升级时配额自动调整
 * - 超出配额时会有相应的限制或警告
 *
 * @example
 * ```typescript
 * const tenantType = TenantType.PROFESSIONAL;
 * const quota = TenantTypeUtils.getQuota(tenantType);
 * console.log(quota.users); // 100
 * ```
 *
 * @enum {string}
 * @since 1.0.0
 */

export enum TenantType {
  /**
   * 试用版
   *
   * @description 30天试用期，体验基础功能
   * - 用户数：最多 5 个
   * - 存储空间：100 MB
   * - API调用：1000 次/月
   * - 功能：基础功能
   */
  TRIAL = "TRIAL",

  /**
   * 基础版
   *
   * @description 适合小型团队的基础版本
   * - 用户数：最多 10 个
   * - 存储空间：1 GB
   * - API调用：10000 次/月
   * - 功能：基础功能 + 基础集成
   */
  BASIC = "BASIC",

  /**
   * 专业版
   *
   * @description 适合中型企业的专业版本
   * - 用户数：最多 100 个
   * - 存储空间：10 GB
   * - API调用：100000 次/月
   * - 功能：全部功能 + 高级集成
   */
  PROFESSIONAL = "PROFESSIONAL",

  /**
   * 企业版
   *
   * @description 适合大型企业的企业版本
   * - 用户数：无限制
   * - 存储空间：无限制
   * - API调用：无限制
   * - 功能：全部功能 + 定制化支持
   */
  ENTERPRISE = "ENTERPRISE",
}

/**
 * 租户类型工具类
 *
 * @description 提供租户类型相关的工具方法
 */
export class TenantTypeUtils {
  /**
   * 获取租户类型的配额配置
   *
   * @description 根据租户类型返回对应的配额配置
   * @param type - 租户类型
   * @returns 配额配置
   */
  public static getQuota(type: TenantType): {
    users: number;
    storage: number; // MB
    apiCalls: number; // 每月
    features: string[];
  } {
    const quotas: Record<TenantType, any> = {
      [TenantType.TRIAL]: {
        users: 5,
        storage: 100,
        apiCalls: 1000,
        features: ["basic"],
      },
      [TenantType.BASIC]: {
        users: 10,
        storage: 1024,
        apiCalls: 10000,
        features: ["basic", "basic_integration"],
      },
      [TenantType.PROFESSIONAL]: {
        users: 100,
        storage: 10240,
        apiCalls: 100000,
        features: ["basic", "basic_integration", "advanced", "advanced_integration"],
      },
      [TenantType.ENTERPRISE]: {
        users: -1, // 无限制
        storage: -1, // 无限制
        apiCalls: -1, // 无限制
        features: ["all"],
      },
    };

    return quotas[type];
  }

  /**
   * 获取租户类型的显示名称
   *
   * @description 返回租户类型的中文显示名称
   * @param type - 租户类型
   * @returns 显示名称
   */
  public static getDisplayName(type: TenantType): string {
    const displayNames: Record<TenantType, string> = {
      [TenantType.TRIAL]: "试用版",
      [TenantType.BASIC]: "基础版",
      [TenantType.PROFESSIONAL]: "专业版",
      [TenantType.ENTERPRISE]: "企业版",
    };

    return displayNames[type];
  }

  /**
   * 获取租户类型的描述
   *
   * @description 返回租户类型的详细描述
   * @param type - 租户类型
   * @returns 描述
   */
  public static getDescription(type: TenantType): string {
    const descriptions: Record<TenantType, string> = {
      [TenantType.TRIAL]: "30天试用期，体验基础功能，适合个人用户",
      [TenantType.BASIC]: "适合小型团队的基础版本，包含基础功能",
      [TenantType.PROFESSIONAL]: "适合中型企业的专业版本，包含高级功能",
      [TenantType.ENTERPRISE]: "适合大型企业的企业版本，包含全部功能",
    };

    return descriptions[type];
  }

  /**
   * 获取租户类型的价格（每月）
   *
   * @description 返回租户类型的月租价格
   * @param type - 租户类型
   * @returns 价格（元）
   */
  public static getPrice(type: TenantType): number {
    const prices: Record<TenantType, number> = {
      [TenantType.TRIAL]: 0,
      [TenantType.BASIC]: 99,
      [TenantType.PROFESSIONAL]: 299,
      [TenantType.ENTERPRISE]: 999,
    };

    return prices[type];
  }

  /**
   * 检查是否可以升级到指定类型
   *
   * @description 检查从当前类型是否可以升级到目标类型
   * @param fromType - 当前类型
   * @param toType - 目标类型
   * @returns 是否可以升级
   */
  public static canUpgrade(fromType: TenantType, toType: TenantType): boolean {
    const typeOrder = [TenantType.TRIAL, TenantType.BASIC, TenantType.PROFESSIONAL, TenantType.ENTERPRISE];
    const fromIndex = typeOrder.indexOf(fromType);
    const toIndex = typeOrder.indexOf(toType);

    return toIndex > fromIndex;
  }

  /**
   * 检查是否可以降级到指定类型
   *
   * @description 检查从当前类型是否可以降级到目标类型
   * @param fromType - 当前类型
   * @param toType - 目标类型
   * @returns 是否可以降级
   */
  public static canDowngrade(fromType: TenantType, toType: TenantType): boolean {
    const typeOrder = [TenantType.TRIAL, TenantType.BASIC, TenantType.PROFESSIONAL, TenantType.ENTERPRISE];
    const fromIndex = typeOrder.indexOf(fromType);
    const toIndex = typeOrder.indexOf(toType);

    return toIndex < fromIndex;
  }

  /**
   * 获取租户类型的优先级
   *
   * @description 返回租户类型的优先级，用于排序
   * @param type - 租户类型
   * @returns 优先级（数值越大优先级越高）
   */
  public static getPriority(type: TenantType): number {
    const priorities: Record<TenantType, number> = {
      [TenantType.TRIAL]: 1,
      [TenantType.BASIC]: 2,
      [TenantType.PROFESSIONAL]: 3,
      [TenantType.ENTERPRISE]: 4,
    };

    return priorities[type];
  }

  /**
   * 检查租户类型是否有效
   *
   * @description 检查租户类型是否为有效值
   * @param type - 租户类型
   * @returns 是否有效
   */
  public static isValid(type: string): boolean {
    return Object.values(TenantType).includes(type as TenantType);
  }

  /**
   * 获取所有可用的租户类型
   *
   * @description 返回所有可用的租户类型列表
   * @returns 租户类型列表
   */
  public static getAllTypes(): TenantType[] {
    return Object.values(TenantType);
  }
}