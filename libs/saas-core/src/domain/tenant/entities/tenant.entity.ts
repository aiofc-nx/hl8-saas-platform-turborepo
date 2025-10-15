/**
 * 租户实体
 *
 * @description 租户的核心业务实体
 *
 * ## 业务规则
 *
 * ### 租户状态管理
 * - 支持 TRIAL, ACTIVE, SUSPENDED, DISABLED 等状态
 * - 状态转换需要符合业务规则
 * - 状态变更需要记录操作者和时间
 *
 * ### 租户信息管理
 * - 租户名称可以修改
 * - 租户域名可以修改（需要验证唯一性）
 * - 租户类型可以升级
 *
 * @example
 * ```typescript
 * const tenant = Tenant.create(
 *   tenantId,
 *   code,
 *   'Acme Corporation',
 *   TenantType.PROFESSIONAL,
 *   'admin'
 * );
 * ```
 *
 * @class Tenant
 * @since 1.0.0
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi/index.js";
import { TenantId } from "@hl8/isolation-model/index.js";
// import type { IPureLogger } from "@hl8/pure-logger/index.js";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantDomain } from "../value-objects/tenant-domain.vo.js";
import { TenantType } from "../value-objects/tenant-type.enum.js";

/**
 * 租户状态枚举
 */
export enum TenantStatus {
  /** 试用中 */
  TRIAL = "TRIAL",
  /** 活跃 */
  ACTIVE = "ACTIVE",
  /** 暂停 */
  SUSPENDED = "SUSPENDED",
  /** 禁用 */
  DISABLED = "DISABLED",
  /** 已删除 */
  DELETED = "DELETED",
}

export class Tenant extends BaseEntity {
  constructor(
    id: TenantId,
    private _code: TenantCode,
    private _name: string,
    private _type: TenantType,
    private _status: TenantStatus,
    private _domain: TenantDomain | null,
    private _description: string | null,
    auditInfo: IPartialAuditInfo,
    logger?: any,
  ) {
    super(id, auditInfo, logger);
  }

  /**
   * 创建租户实体
   *
   * @description 创建新的租户实体
   * @param id - 租户ID
   * @param code - 租户代码
   * @param name - 租户名称
   * @param type - 租户类型
   * @param createdBy - 创建者
   * @param domain - 租户域名（可选）
   * @param description - 租户描述（可选）
   * @param auditInfo - 审计信息
   * @param logger - 日志器
   * @returns 租户实体实例
   */
  public static create(
    id: TenantId,
    code: string,
    name: string,
    type: TenantType,
    createdBy: string,
    domain?: string,
    description?: string,
    auditInfo?: IPartialAuditInfo,
    logger?: any,
  ): Tenant {
    const tenantCode = (TenantCode as any).create(code);
    const tenantDomain = domain ? (TenantDomain as any).create(domain) : null;

    return new Tenant(
      id,
      tenantCode,
      name,
      type,
      TenantStatus.TRIAL,
      tenantDomain,
      description || null,
      auditInfo || { createdBy },
      logger,
    );
  }

  /**
   * 获取租户代码
   */
  public getCode(): TenantCode {
    return this._code;
  }

  /**
   * 获取租户名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取租户类型
   */
  public getType(): TenantType {
    return this._type;
  }

  /**
   * 获取租户状态
   */
  public getStatus(): TenantStatus {
    return this._status;
  }

  /**
   * 获取租户域名
   */
  public getDomain(): TenantDomain | null {
    return this._domain;
  }

  /**
   * 获取租户描述
   */
  public getDescription(): string | null {
    return this._description;
  }

  /**
   * 激活租户
   *
   * @description 将租户状态设置为活跃
   * @param activatedBy - 激活操作者
   */
  public activate(activatedBy: string): void {
    if (this._status === TenantStatus.ACTIVE) {
      throw new Error("租户已经是活跃状态");
    }

    if (this._status === TenantStatus.DELETED) {
      throw new Error("已删除的租户无法激活");
    }

    this._status = TenantStatus.ACTIVE;
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户已激活 - tenantId: ${(this as any).id.toString()}, activatedBy: ${activatedBy}`,
    );
  }

  /**
   * 暂停租户
   *
   * @description 暂停租户服务
   * @param suspendedBy - 暂停操作者
   * @param reason - 暂停原因
   */
  public suspend(suspendedBy: string, reason: string): void {
    if (this._status !== TenantStatus.ACTIVE) {
      throw new Error("只有活跃状态的租户可以被暂停");
    }

    this._status = TenantStatus.SUSPENDED;
    (this as any).updateTimestamp();

    (this as any).logger?.warn(
      `租户已暂停 - tenantId: ${(this as any).id.toString()}, reason: ${reason}`,
    );
  }

  /**
   * 恢复租户
   *
   * @description 从暂停状态恢复租户
   * @param resumedBy - 恢复操作者
   */
  public resume(resumedBy: string): void {
    if (this._status !== TenantStatus.SUSPENDED) {
      throw new Error("只有暂停状态的租户可以被恢复");
    }

    this._status = TenantStatus.ACTIVE;
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户已恢复 - tenantId: ${(this as any).id.toString()}, resumedBy: ${resumedBy}`,
    );
  }

  /**
   * 禁用租户
   *
   * @description 禁用租户，停止所有服务
   * @param disabledBy - 禁用操作者
   * @param reason - 禁用原因
   */
  public disable(disabledBy: string, reason: string): void {
    if (this._status === TenantStatus.DISABLED) {
      throw new Error("租户已经是禁用状态");
    }

    if (this._status === TenantStatus.DELETED) {
      throw new Error("已删除的租户无法禁用");
    }

    this._status = TenantStatus.DISABLED;
    (this as any).updateTimestamp();

    (this as any).logger?.warn(
      `租户已禁用 - tenantId: ${(this as any).id.toString()}, reason: ${reason}`,
    );
  }

  /**
   * 升级租户类型
   *
   * @description 升级租户到更高的类型
   * @param newType - 新的租户类型
   * @param upgradedBy - 升级操作者
   * @param reason - 升级原因（可选）
   */
  public upgrade(
    newType: TenantType,
    upgradedBy: string,
    reason?: string,
  ): void {
    if (this._status === TenantStatus.DELETED) {
      throw new Error("已删除的租户无法升级");
    }

    this._type = newType;
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户类型已升级 - tenantId: ${(this as any).id.toString()}, newType: ${newType}, reason: ${reason || "N/A"}`,
    );
  }

  /**
   * 更新租户名称
   *
   * @description 更新租户名称
   * @param newName - 新的租户名称
   * @param updatedBy - 更新操作者
   */
  public updateName(newName: string, updatedBy: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error("租户名称不能为空");
    }

    this._name = newName.trim();
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户名称已更新 - tenantId: ${(this as any).id.toString()}, newName: ${newName}`,
    );
  }

  /**
   * 更新租户域名
   *
   * @description 更新租户域名
   * @param newDomain - 新的租户域名
   * @param updatedBy - 更新操作者
   */
  public updateDomain(newDomain: TenantDomain, updatedBy: string): void {
    this._domain = newDomain;
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户域名已更新 - tenantId: ${(this as any).id.toString()}, newDomain: ${(newDomain as any).value}`,
    );
  }

  /**
   * 更新租户描述
   *
   * @description 更新租户描述
   * @param newDescription - 新的租户描述
   * @param updatedBy - 更新操作者
   */
  public updateDescription(
    newDescription: string | null,
    updatedBy: string,
  ): void {
    this._description = newDescription;
    (this as any).updateTimestamp();

    (this as any).logger?.info(
      `租户描述已更新 - tenantId: ${(this as any).id.toString()}`,
    );
  }

  /**
   * 检查租户是否活跃
   *
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this._status === TenantStatus.ACTIVE;
  }

  /**
   * 检查租户是否可用
   *
   * @returns 是否可用（活跃或试用状态）
   */
  public isAvailable(): boolean {
    return (
      this._status === TenantStatus.ACTIVE ||
      this._status === TenantStatus.TRIAL
    );
  }
}
