/**
 * 租户类型枚举
 *
 * @description 定义租户的不同类型，用于区分不同的业务模式和服务级别
 * @since 1.0.0
 */

/**
 * 租户类型枚举
 *
 * 定义了平台支持的租户类型，每种类型对应不同的功能特性和服务级别：
 *
 * ## 业务规则
 *
 * ### 租户类型定义
 * - **TRIAL**: 试用租户 - 具有有限的功能和资源限制，用于产品试用
 * - **BASIC**: 基础租户 - 提供核心功能，适合小型团队使用
 * - **PROFESSIONAL**: 专业租户 - 提供完整功能，适合中型企业
 * - **ENTERPRISE**: 企业租户 - 提供所有功能和企业级支持，适合大型企业
 * - **CUSTOM**: 自定义租户 - 根据客户需求定制的特殊配置
 *
 * ### 类型转换规则
 * - 试用租户可以升级到任何付费类型
 * - 付费类型之间可以互相转换
 * - 降级操作需要满足特定的业务条件
 * - 自定义类型需要特殊的管理权限
 *
 * ### 功能权限规则
 * - 不同类型对应不同的功能权限集合
 * - 类型变更会触发权限重新计算
 * - 某些高级功能仅限特定类型使用
 *
 * @example
 * ```typescript
 * // 创建租户时指定类型
 * const tenant = new Tenant(
 *   tenantId,
 *   tenantCode,
 *   tenantName,
 *   TenantType.PROFESSIONAL
 * );
 *
 * // 检查租户类型权限
 * if (tenant.type === TenantType.ENTERPRISE) {
 *   // 启用企业级功能
 * }
 *
 * // 升级租户类型
 * tenant.upgrade(TenantType.ENTERPRISE);
 * ```
 */
export enum TenantType {
  /**
   * 试用租户
   *
   * 用于产品试用和评估，具有以下特点：
   * - 功能限制：核心功能可用，高级功能受限
   * - 资源限制：用户数量、存储空间、API调用次数有限制
   * - 时间限制：通常有试用期限制
   * - 支持级别：社区支持
   */
  TRIAL = "trial",

  /**
   * 基础租户
   *
   * 适合小型团队和初创企业，提供：
   * - 核心业务功能
   * - 基础用户管理
   * - 标准存储配额
   * - 邮件支持
   */
  BASIC = "basic",

  /**
   * 专业租户
   *
   * 适合中型企业和成长型团队，提供：
   * - 完整业务功能
   * - 高级用户管理
   * - 扩展存储配额
   * - 优先支持
   * - 自定义配置选项
   */
  PROFESSIONAL = "professional",

  /**
   * 企业租户
   *
   * 适合大型企业和企业级应用，提供：
   * - 所有功能特性
   * - 企业级用户管理
   * - 无限制存储配额
   * - 24/7 专属支持
   * - 完全自定义配置
   * - SLA 保障
   */
  ENTERPRISE = "enterprise",

  /**
   * 自定义租户
   *
   * 根据客户特殊需求定制的租户类型：
   * - 定制化功能配置
   * - 特殊定价模式
   * - 专属服务协议
   * - 定制化集成方案
   */
  CUSTOM = "custom",
}

/**
 * 租户类型工具类
 *
 * @description 提供租户类型的验证、转换和比较功能
 * @since 1.0.0
 */
export class TenantTypeUtils {
  /**
   * 获取所有租户类型
   *
   * @returns 所有租户类型的数组
   */
  static getAllTypes(): TenantType[] {
    return Object.values(TenantType);
  }

  /**
   * 获取付费租户类型
   *
   * @returns 付费租户类型的数组
   */
  static getPaidTypes(): TenantType[] {
    return [
      TenantType.BASIC,
      TenantType.PROFESSIONAL,
      TenantType.ENTERPRISE,
      TenantType.CUSTOM,
    ];
  }

  /**
   * 检查是否为试用租户
   *
   * @param type 租户类型
   * @returns 是否为试用租户
   */
  static isTrial(type: TenantType): boolean {
    return type === TenantType.TRIAL;
  }

  /**
   * 检查是否为付费租户
   *
   * @param type 租户类型
   * @returns 是否为付费租户
   */
  static isPaid(type: TenantType): boolean {
    return this.getPaidTypes().includes(type);
  }

  /**
   * 检查是否为自定义租户
   *
   * @param type 租户类型
   * @returns 是否为自定义租户
   */
  static isCustom(type: TenantType): boolean {
    return type === TenantType.CUSTOM;
  }

  /**
   * 获取租户类型显示名称
   *
   * @param type 租户类型
   * @returns 显示名称
   */
  static getDisplayName(type: TenantType): string {
    const displayNames: Record<TenantType, string> = {
      [TenantType.TRIAL]: "试用版",
      [TenantType.BASIC]: "基础版",
      [TenantType.PROFESSIONAL]: "专业版",
      [TenantType.ENTERPRISE]: "企业版",
      [TenantType.CUSTOM]: "定制版",
    };
    return displayNames[type] || "未知类型";
  }

  /**
   * 获取租户类型描述
   *
   * @param type 租户类型
   * @returns 类型描述
   */
  static getDescription(type: TenantType): string {
    const descriptions: Record<TenantType, string> = {
      [TenantType.TRIAL]: "产品试用和评估版本，功能有限",
      [TenantType.BASIC]: "适合小型团队的基础版本",
      [TenantType.PROFESSIONAL]: "适合中型企业的专业版本",
      [TenantType.ENTERPRISE]: "适合大型企业的企业版本",
      [TenantType.CUSTOM]: "根据客户需求定制的特殊版本",
    };
    return descriptions[type] || "未知类型描述";
  }

  /**
   * 验证租户类型
   *
   * @param type 待验证的类型
   * @returns 是否为有效的租户类型
   */
  static isValid(type: string): type is TenantType {
    return Object.values(TenantType).includes(type as TenantType);
  }

  /**
   * 比较租户类型等级
   *
   * @param type1 第一个租户类型
   * @param type2 第二个租户类型
   * @returns 比较结果：-1 (type1 < type2), 0 (相等), 1 (type1 > type2)
   */
  static compare(type1: TenantType, type2: TenantType): number {
    const levels: Record<TenantType, number> = {
      [TenantType.TRIAL]: 0,
      [TenantType.BASIC]: 1,
      [TenantType.PROFESSIONAL]: 2,
      [TenantType.ENTERPRISE]: 3,
      [TenantType.CUSTOM]: 4,
    };
    return levels[type1] - levels[type2];
  }

  /**
   * 检查是否可以升级到目标类型
   *
   * @param fromType 当前类型
   * @param toType 目标类型
   * @returns 是否可以升级
   */
  static canUpgrade(fromType: TenantType, toType: TenantType): boolean {
    // 试用版可以升级到任何付费版本
    if (fromType === TenantType.TRIAL) {
      return this.getPaidTypes().includes(toType);
    }

    // 付费版本之间可以互相转换
    if (this.isPaid(fromType) && this.isPaid(toType)) {
      return true;
    }

    // 其他情况不允许升级
    return false;
  }

  /**
   * 检查是否可以降级到目标类型
   *
   * @param fromType 当前类型
   * @param toType 目标类型
   * @returns 是否可以降级
   */
  static canDowngrade(fromType: TenantType, toType: TenantType): boolean {
    // 不允许降级到试用版
    if (toType === TenantType.TRIAL) {
      return false;
    }

    // 付费版本之间可以互相转换
    if (this.isPaid(fromType) && this.isPaid(toType)) {
      return true;
    }

    // 其他情况不允许降级
    return false;
  }
}
