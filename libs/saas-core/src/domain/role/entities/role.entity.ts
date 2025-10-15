/**
 * 角色实体（简化版本）
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";
import { RoleLevel } from "../value-objects/role-level.vo.js";
import { RoleName } from "../value-objects/role-name.vo.js";
import { RoleStatus } from "../value-objects/role-status.enum.js";

export class Role extends BaseEntity {
  constructor(
    id: EntityId,
    private _code: string,
    private _name: RoleName,
    private _level: RoleLevel,
    private _status: RoleStatus,
    private _isSystem: boolean,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
  }

  public static create(
    id: EntityId,
    code: string,
    name: RoleName,
    level: RoleLevel,
    auditInfo: IPartialAuditInfo,
  ): Role {
    return new Role(id, code, name, level, RoleStatus.ACTIVE, false, auditInfo);
  }

  public getCode(): string {
    return this._code;
  }

  public getName(): RoleName {
    return this._name;
  }

  public getLevel(): RoleLevel {
    return this._level;
  }

  public toObject(): object {
    return {
      id: (this as any).id.toString(),
      code: this._code,
      name: (this._name as any).value,
      level: (this._level as any).value,
      status: this._status,
    };
  }
}
