/**
 * 租户配置实体
 *
 * @description 管理租户的配置信息，包括配额、设置等
 *
 * ## 业务规则
 *
 * ### 配额管理
 * - 根据租户类型设置不同的配额限制
 * - 实时跟踪当前使用量
 * - 支持配额检查和警告
 *
 * ### 配置管理
 * - 支持租户级别的个性化配置
 * - 配置变更需要审计记录
 * - 支持配置继承和覆盖
 *
 * @example
 * ```typescript
 * const config = TenantConfiguration.create(
 *   tenantId,
 *   TenantType.PROFESSIONAL
 * );
 * ```
 *
 * @class TenantConfiguration
 * @since 1.0.0
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { TenantId } from "@hl8/isolation-model";
import type { IPureLogger } from "@hl8/pure-logger";
import { TenantType, TenantTypeUtils } from "../value-objects/tenant-type.enum.js";

/**
 * 配额配置接口
 */
export interface QuotaConfig {
  /** 用户数量限制 */
  users: number;
  /** 存储空间限制（MB） */
  storage: number;
  /** API调用限制（每月） */
  apiCalls: number;
  /** 数据库连接数限制 */
  dbConnections: number;
  /** 文件上传大小限制（MB） */
  maxFileSize: number;
  /** 并发请求限制 */
  concurrentRequests: number;
}

/**
 * 使用量统计接口
 */
export interface UsageStats {
  /** 当前用户数量 */
  users: number;
  /** 当前存储使用量（MB） */
  storage: number;
  /** 本月API调用次数 */
  apiCalls: number;
  /** 当前数据库连接数 */
  dbConnections: number;
}

/**
 * 租户配置实体
 */
export class TenantConfiguration extends BaseEntity {
  private _quota: QuotaConfig;
  private _usage: UsageStats;
  private _settings: Record<string, any>;

  constructor(
    id: TenantId,
    private _tenantType: TenantType,
    quota: QuotaConfig,
    usage: UsageStats,
    settings: Record<string, any>,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);
    this._quota = quota;
    this._usage = usage;
    this._settings = settings;
  }

  /**
   * 创建租户配置实体
   *
   * @description 根据租户类型创建默认配置
   * @param id - 租户ID
   * @param tenantType - 租户类型
   * @param auditInfo - 审计信息
   * @param logger - 日志器
   * @returns 租户配置实体实例
   */
  public static create(
    id: TenantId,
    tenantType: TenantType,
    auditInfo?: IPartialAuditInfo,
    logger?: IPureLogger,
  ): TenantConfiguration {
    const quota = TenantConfiguration.getDefaultQuota(tenantType);
    const usage: UsageStats = {
      users: 0,
      storage: 0,
      apiCalls: 0,
      dbConnections: 0,
    };
    const settings = TenantConfiguration.getDefaultSettings(tenantType);

    return new TenantConfiguration(
      id,
      tenantType,
      quota,
      usage,
      settings,
      auditInfo || { createdBy: "system", createdAt: new Date() },
      logger,
    );
  }

  /**
   * 获取租户类型
   */
  public getTenantType(): TenantType {
    return this._tenantType;
  }

  /**
   * 获取配额配置
   */
  public getQuota(): QuotaConfig {
    return { ...this._quota };
  }

  /**
   * 获取使用量统计
   */
  public getUsage(): UsageStats {
    return { ...this._usage };
  }

  /**
   * 获取配置设置
   */
  public getSettings(): Record<string, any> {
    return { ...this._settings };
  }

  /**
   * 更新配额配置
   *
   * @description 根据租户类型更新配额
   * @param tenantType - 新的租户类型
   * @param updatedBy - 更新操作者
   */
  public updateQuota(tenantType: TenantType, updatedBy: string): void {
    this._tenantType = tenantType;
    this._quota = TenantConfiguration.getDefaultQuota(tenantType);
    this.updateTimestamp();
    
    this.logger?.info(`租户配额已更新 - tenantId: ${this.id.toString()}, type: ${tenantType}`);
  }

  /**
   * 更新使用量统计
   *
   * @description 更新当前使用量
   * @param usage - 新的使用量统计
   */
  public updateUsage(usage: Partial<UsageStats>): void {
    this._usage = { ...this._usage, ...usage };
    this.updateTimestamp();
  }

  /**
   * 更新配置设置
   *
   * @description 更新租户配置设置
   * @param key - 配置键
   * @param value - 配置值
   * @param updatedBy - 更新操作者
   */
  public updateSetting(key: string, value: any, updatedBy: string): void {
    this._settings[key] = value;
    this.updateTimestamp();
    
    this.logger?.info(`租户配置已更新 - tenantId: ${this.id.toString()}, key: ${key}`);
  }

  /**
   * 批量更新配置设置
   *
   * @description 批量更新多个配置设置
   * @param settings - 配置设置对象
   * @param updatedBy - 更新操作者
   */
  public updateSettings(settings: Record<string, any>, updatedBy: string): void {
    this._settings = { ...this._settings, ...settings };
    this.updateTimestamp();
    
    this.logger?.info(`租户配置已批量更新 - tenantId: ${this.id.toString()}, keys: ${Object.keys(settings).join(', ')}`);
  }

  /**
   * 检查是否超出配额
   *
   * @description 检查当前使用量是否超出配额限制
   * @returns 是否超出配额
   */
  public isQuotaExceeded(): boolean {
    return (
      this._usage.users >= this._quota.users ||
      this._usage.storage >= this._quota.storage ||
      this._usage.apiCalls >= this._quota.apiCalls ||
      this._usage.dbConnections >= this._quota.dbConnections
    );
  }

  /**
   * 检查特定资源是否超出配额
   *
   * @description 检查特定资源的使用量是否超出配额
   * @param resource - 资源类型
   * @param amount - 使用量
   * @returns 是否超出配额
   */
  public isResourceQuotaExceeded(resource: keyof QuotaConfig, amount: number): boolean {
    const currentUsage = this._usage[resource] || 0;
    return (currentUsage + amount) > this._quota[resource];
  }

  /**
   * 获取配额使用率
   *
   * @description 获取各资源的配额使用率
   * @returns 使用率对象
   */
  public getQuotaUsage(): Record<string, { used: number; limit: number; percentage: number }> {
    const resources: (keyof QuotaConfig)[] = ['users', 'storage', 'apiCalls', 'dbConnections'];
    const usage: Record<string, { used: number; limit: number; percentage: number }> = {};

    resources.forEach(resource => {
      const used = this._usage[resource] || 0;
      const limit = this._quota[resource];
      const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
      
      usage[resource] = { used, limit, percentage };
    });

    return usage;
  }

  /**
   * 获取统计信息
   *
   * @description 获取详细的统计信息
   * @returns 统计信息
   */
  public getStatistics(): {
    users: { current: number; limit: number };
    storage: { current: number; limit: number };
    apiCalls: { current: number; limit: number };
  } {
    return {
      users: { current: this._usage.users, limit: this._quota.users },
      storage: { current: this._usage.storage, limit: this._quota.storage },
      apiCalls: { current: this._usage.apiCalls, limit: this._quota.apiCalls },
    };
  }

  /**
   * 获取默认配额配置
   *
   * @description 根据租户类型获取默认配额
   * @param tenantType - 租户类型
   * @returns 配额配置
   */
  private static getDefaultQuota(tenantType: TenantType): QuotaConfig {
    const baseQuota = TenantTypeUtils.getQuota(tenantType);
    
    return {
      users: baseQuota.users,
      storage: baseQuota.storage,
      apiCalls: baseQuota.apiCalls,
      dbConnections: tenantType === TenantType.ENTERPRISE ? 100 : tenantType === TenantType.PROFESSIONAL ? 20 : 5,
      maxFileSize: tenantType === TenantType.ENTERPRISE ? 100 : tenantType === TenantType.PROFESSIONAL ? 50 : 10,
      concurrentRequests: tenantType === TenantType.ENTERPRISE ? 1000 : tenantType === TenantType.PROFESSIONAL ? 100 : 10,
    };
  }

  /**
   * 获取默认配置设置
   *
   * @description 根据租户类型获取默认配置设置
   * @param tenantType - 租户类型
   * @returns 配置设置
   */
  private static getDefaultSettings(tenantType: TenantType): Record<string, any> {
    return {
      // 基础设置
      timezone: "Asia/Shanghai",
      language: "zh-CN",
      dateFormat: "YYYY-MM-DD",
      
      // 安全设置
      passwordPolicy: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
      },
      
      // 功能开关
      features: {
        multiFactorAuth: tenantType !== TenantType.TRIAL,
        sso: tenantType === TenantType.ENTERPRISE || tenantType === TenantType.PROFESSIONAL,
        apiAccess: true,
        customBranding: tenantType === TenantType.ENTERPRISE,
        advancedAnalytics: tenantType === TenantType.ENTERPRISE || tenantType === TenantType.PROFESSIONAL,
      },
      
      // 通知设置
      notifications: {
        email: true,
        sms: tenantType !== TenantType.TRIAL,
        push: true,
      },
    };
  }
}