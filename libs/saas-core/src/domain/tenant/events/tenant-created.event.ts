/**
 * 租户创建事件
 *
 * @description 当新租户创建时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发时机
 * - 租户聚合根创建完成后
 * - 租户状态为 TRIAL 时
 * - 试用期配置完成后
 *
 * ### 事件内容
 * - 租户基本信息
 * - 租户类型和配额
 * - 创建者和创建时间
 * - 试用期配置
 *
 * @example
 * ```typescript
 * const event = new TenantCreatedEvent(
 *   tenantId,
 *   'acme2024',
 *   'Acme Corporation',
 *   TenantType.PROFESSIONAL,
 *   createdBy
 * );
 * ```
 *
 * @class TenantCreatedEvent
 * @since 1.0.0
 */

import { BaseDomainEvent } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";
import { TenantType } from "../value-objects/tenant-type.enum.js";

export interface TenantCreatedEventData {
  tenantId: string;
  code: string;
  name: string;
  type: TenantType;
  domain?: string;
  createdBy: string;
  trialDays: number;
  quota: {
    users: number;
    storage: number; // MB
    apiCalls: number;
  };
}

export class TenantCreatedEvent extends BaseDomainEvent {
  private readonly _data: TenantCreatedEventData;

  constructor(
    tenantId: EntityId,
    code: string,
    name: string,
    type: TenantType,
    createdBy: string,
    trialDays: number = 30,
    domain?: string,
  ) {
    super(tenantId, 1, tenantId);
    this._data = {
      tenantId: tenantId.toString(),
      code,
      name,
      type,
      domain,
      createdBy,
      trialDays,
      quota: {
        users:
          type === TenantType.ENTERPRISE
            ? 1000
            : type === TenantType.PROFESSIONAL
              ? 100
              : 10,
        storage:
          type === TenantType.ENTERPRISE
            ? 10000
            : type === TenantType.PROFESSIONAL
              ? 1000
              : 100,
        apiCalls:
          type === TenantType.ENTERPRISE
            ? 100000
            : type === TenantType.PROFESSIONAL
              ? 10000
              : 1000,
      },
    };
  }

  get eventType(): string {
    return "TenantCreated";
  }

  get data(): TenantCreatedEventData {
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

  getCode(): string {
    return this.data.code;
  }

  getName(): string {
    return this.data.name;
  }

  getType(): TenantType {
    return this.data.type;
  }

  getDomain(): string | undefined {
    return this.data.domain;
  }

  getCreatedBy(): string {
    return this.data.createdBy;
  }

  getTrialDays(): number {
    return this.data.trialDays;
  }

  getQuota() {
    return this.data.quota;
  }
}
