/**
 * 租户聚合根
 *
 * @description 租户聚合根，管理租户相关的所有业务逻辑
 *
 * ## 业务规则
 *
 * ### 租户创建
 * - 租户代码全局唯一
 * - 租户域名全局唯一
 * - 试用期默认为30天
 * - 初始状态为 TRIAL
 *
 * ### 租户升级
 * - 只能从低版本升级到高版本
 * - 升级后配额自动调整
 * - 升级操作需要记录
 *
 * ### 租户状态管理
 * - 支持激活、暂停、禁用等状态
 * - 状态转换需要符合业务规则
 *
 * @example
 * ```typescript
 * const tenant = TenantAggregate.create(
 *   tenantId,
 *   code,
 *   name,
 *   TenantType.PROFESSIONAL,
 *   createdBy
 * );
 * ```
 *
 * @class TenantAggregate
 * @since 1.0.0
 */

import { TenantAwareAggregateRoot, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { TenantId } from "@hl8/isolation-model";
import type { IPureLogger } from "@hl8/pure-logger";
import { Tenant } from "../entities/tenant.entity.js";
import { TenantConfiguration } from "../entities/tenant-configuration.entity.js";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantDomain } from "../value-objects/tenant-domain.vo.js";
import { TenantType } from "../value-objects/tenant-type.enum.js";
import { TenantCreatedEvent } from "../events/tenant-created.event.js";
import { TenantUpgradedEvent } from "../events/tenant-upgraded.event.js";

export class TenantAggregate extends TenantAwareAggregateRoot {
  constructor(
    id: TenantId,
    private _tenant: Tenant,
    private _configuration: TenantConfiguration,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);
  }

  /**
   * 创建租户聚合根
   *
   * @description 创建新的租户聚合根
   * @param id - 租户ID
   * @param code - 租户代码
   * @param name - 租户名称
   * @param type - 租户类型
   * @param createdBy - 创建者
   * @param domain - 租户域名（可选）
   * @param auditInfo - 审计信息
   * @param logger - 日志器
   * @returns 租户聚合根实例
   */
  public static create(
    id: TenantId,
    code: string,
    name: string,
    type: TenantType,
    createdBy: string,
    domain?: string,
    auditInfo?: IPartialAuditInfo,
    logger?: IPureLogger,
  ): TenantAggregate {
    const tenantCode = TenantCode.create(code);
    const tenantDomain = domain ? TenantDomain.create(domain) : undefined;

    const tenant = Tenant.create(
      id,
      tenantCode,
      name,
      type,
      createdBy,
      tenantDomain,
      auditInfo,
    );

    const configuration = TenantConfiguration.create(
      id,
      type,
      auditInfo,
    );

    const aggregate = new TenantAggregate(id, tenant, configuration, auditInfo, logger);

    // 发布租户创建事件
    const event = new TenantCreatedEvent(
      id,
      code,
      name,
      type,
      createdBy,
      30, // 默认试用期30天
      domain,
    );
    aggregate.addDomainEvent(event);

    return aggregate;
  }

  /**
   * 获取租户信息
   */
  public getTenant(): Tenant {
    return this._tenant;
  }

  /**
   * 获取租户配置
   */
  public getConfiguration(): TenantConfiguration {
    return this._configuration;
  }

  /**
   * 激活租户
   *
   * @description 激活租户，使其可以正常使用
   * @param activatedBy - 激活操作者
   */
  public activate(activatedBy: string): void {
    this._tenant.activate(activatedBy);
    this.updateTimestamp();
    
    this.logger?.info(`租户已激活 - tenantId: ${this.id.toString()}, activatedBy: ${activatedBy}`);
  }

  /**
   * 暂停租户
   *
   * @description 暂停租户，暂时停止服务
   * @param suspendedBy - 暂停操作者
   * @param reason - 暂停原因
   */
  public suspend(suspendedBy: string, reason: string): void {
    this._tenant.suspend(suspendedBy, reason);
    this.updateTimestamp();
    
    this.logger?.warn(`租户已暂停 - tenantId: ${this.id.toString()}, reason: ${reason}`);
  }

  /**
   * 恢复租户
   *
   * @description 从暂停状态恢复租户
   * @param resumedBy - 恢复操作者
   */
  public resume(resumedBy: string): void {
    this._tenant.resume(resumedBy);
    this.updateTimestamp();
    
    this.logger?.info(`租户已恢复 - tenantId: ${this.id.toString()}, resumedBy: ${resumedBy}`);
  }

  /**
   * 升级租户
   *
   * @description 升级租户类型和配额
   * @param newType - 新的租户类型
   * @param upgradedBy - 升级操作者
   * @param reason - 升级原因（可选）
   */
  public upgrade(newType: TenantType, upgradedBy: string, reason?: string): void {
    const oldType = this._tenant.getType();
    
    // 验证是否可以升级
    if (!TenantTypeUtils.canUpgrade(oldType, newType)) {
      throw new Error(`无法从 ${oldType} 升级到 ${newType}`);
    }

    this._tenant.upgrade(newType, upgradedBy, reason);
    this._configuration.updateQuota(newType, upgradedBy);
    this.updateTimestamp();

    // 发布租户升级事件
    const event = new TenantUpgradedEvent(
      this.id,
      oldType,
      newType,
      upgradedBy,
      reason,
    );
    this.addDomainEvent(event);

    this.logger?.info(`租户已升级 - tenantId: ${this.id.toString()}, from: ${oldType}, to: ${newType}`);
  }

  /**
   * 禁用租户
   *
   * @description 禁用租户，停止所有服务
   * @param disabledBy - 禁用操作者
   * @param reason - 禁用原因
   */
  public disable(disabledBy: string, reason: string): void {
    this._tenant.disable(disabledBy, reason);
    this.updateTimestamp();
    
    this.logger?.warn(`租户已禁用 - tenantId: ${this.id.toString()}, reason: ${reason}`);
  }

  /**
   * 更新租户信息
   *
   * @description 更新租户的基本信息
   * @param updates - 更新内容
   * @param updatedBy - 更新操作者
   */
  public updateInfo(updates: {
    name?: string;
    domain?: string;
  }, updatedBy: string): void {
    if (updates.name) {
      this._tenant.updateName(updates.name, updatedBy);
    }
    
    if (updates.domain) {
      const tenantDomain = TenantDomain.create(updates.domain);
      this._tenant.updateDomain(tenantDomain, updatedBy);
    }
    
    this.updateTimestamp();
    
    this.logger?.info(`租户信息已更新 - tenantId: ${this.id.toString()}, updatedBy: ${updatedBy}`);
  }

  /**
   * 检查租户配额
   *
   * @description 检查当前使用量是否超出配额
   * @returns 是否超出配额
   */
  public isQuotaExceeded(): boolean {
    return this._configuration.isQuotaExceeded();
  }

  /**
   * 获取租户统计信息
   *
   * @description 获取租户的使用统计信息
   * @returns 统计信息
   */
  public getStatistics(): {
    users: { current: number; limit: number };
    storage: { current: number; limit: number };
    apiCalls: { current: number; limit: number };
  } {
    return this._configuration.getStatistics();
  }
}