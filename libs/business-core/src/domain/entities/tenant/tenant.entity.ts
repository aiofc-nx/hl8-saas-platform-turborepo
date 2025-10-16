import { BaseEntity } from '../base/base-entity.js';
import { EntityId, TenantId } from '@hl8/isolation-model';
import type { IPureLogger } from '@hl8/pure-logger';
import { TenantType } from '../../value-objects/types/tenant-type.vo.js';
import type { IPartialAuditInfo } from '../base/audit-info.js';

/**
 * 租户实体（Tenant）
 *
 * @description 表达 SAAS 平台中的租户（企业/社群/团队/个人），承载租户生命周期与配置变更规则。
 *
 * 业务规则：
 * - 必须隶属于平台（由上层聚合或上下文保证）
 * - 必须具备租户类型（TenantType）
 * - 名称非空且长度受限
 * - 支持软删除恢复
 */
export class Tenant extends BaseEntity {
  private _name: string;
  private _type: TenantType;

  constructor(
    id: EntityId,
    props: { name: string; type: TenantType },
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._name = props.name;
    this._type = props.type;
    this.validate();
  }

  get name(): string {
    return this._name;
  }

  get type(): TenantType {
    return this._type;
  }

  rename(newName: string): void {
    this.validateName(newName);
    this._name = newName.trim();
    this.updateTimestamp();
    this.logOperation('rename', { name: this._name });
  }

  changeType(newType: TenantType): void {
    if (!newType) throw new Error('租户类型不能为空');
    this._type = newType;
    this.updateTimestamp();
    this.logOperation('changeType', { type: newType.value });
  }

  protected override validate(): void {
    super.validate();
    this.validateName(this._name);
    if (!(this.type instanceof TenantType)) {
      throw new Error('租户类型无效');
    }
  }

  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new Error('租户名称不能为空');
    }
    if (name.trim().length > 100) {
      throw new Error('租户名称长度不能超过100');
    }
  }
}


