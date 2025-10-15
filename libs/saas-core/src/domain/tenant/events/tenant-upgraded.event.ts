/**
 * 租户升级事件
 *
 * @description 当租户从试用版升级到付费版时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发时机
 * - 租户类型变更完成后
 * - 配额更新完成后
 * - 计费信息更新完成后
 *
 * ### 事件内容
 * - 升级前后的租户类型
 * - 新的配额配置
 * - 升级操作者
 * - 升级时间和原因
 *
 * @example
 * ```typescript
 * const event = new TenantUpgradedEvent(
 *   tenantId,
 *   TenantType.TRIAL,
 *   TenantType.PROFESSIONAL,
 *   upgradedBy
 * );
 * ```
 *
 * @class TenantUpgradedEvent
 * @since 1.0.0
 */

import { BaseDomainEvent } from "@hl8/hybrid-archi/index.js";
import { EntityId } from "@hl8/isolation-model/index.js";
import { TenantType } from "../value-objects/tenant-type.enum.js";

export interface TenantUpgradedEventData {
  tenantId: string;
  fromType: TenantType;
  toType: TenantType;
  upgradedBy: string;
  reason?: string;
  newQuota: {
    users: number;
    storage: number; // MB
    apiCalls: number;
  };
  upgradeDate: string;
}

export class TenantUpgradedEvent extends BaseDomainEvent {
  private readonly _data: TenantUpgradedEventData;

  constructor(
    tenantId: EntityId,
    fromType: TenantType,
    toType: TenantType,
    upgradedBy: string,
    reason?: string,
  ) {
    super(tenantId, 1, tenantId);
    this._data = {
      tenantId: tenantId.toString(),
      fromType,
      toType,
      upgradedBy,
      reason,
      newQuota: {
        users:
          toType === TenantType.ENTERPRISE
            ? 1000
            : toType === TenantType.PROFESSIONAL
              ? 100
              : 10,
        storage:
          toType === TenantType.ENTERPRISE
            ? 10000
            : toType === TenantType.PROFESSIONAL
              ? 1000
              : 100,
        apiCalls:
          toType === TenantType.ENTERPRISE
            ? 100000
            : toType === TenantType.PROFESSIONAL
              ? 10000
              : 1000,
      },
      upgradeDate: new Date().toISOString(),
    };
  }

  get eventType(): string {
    return "TenantUpgraded";
  }

  get data(): TenantUpgradedEventData {
    return this._data;
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: (this as any).eventId.toString(),
      eventType: this.eventType,
      aggregateId: (this as any).aggregateId.toString(),
      aggregateVersion: (this as any).aggregateVersion,
      tenantId: (this as any).tenantId.toString(),
      occurredAt: (this as any).occurredAt.toISOString(),
      eventVersion: (this as any).eventVersion,
      data: this._data,
    };
  }

  getTenantId(): string {
    return this.data.tenantId;
  }

  getFromType(): TenantType {
    return this.data.fromType;
  }

  getToType(): TenantType {
    return this.data.toType;
  }

  getUpgradedBy(): string {
    return this.data.upgradedBy;
  }

  getReason(): string | undefined {
    return this.data.reason;
  }

  getNewQuota() {
    return this.data.newQuota;
  }

  getUpgradeDate(): string {
    return this.data.upgradeDate;
  }
}
