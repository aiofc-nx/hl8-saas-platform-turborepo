/**
 * 部门闭包表实体
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";

import { TenantId } from "@hl8/isolation-model";
export class DepartmentClosure extends BaseEntity {
  constructor(
    id: EntityId,
    private _ancestor: EntityId,
    private _descendant: EntityId,
    private _depth: number,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
  }

  public static create(
    ancestor: EntityId,
    descendant: EntityId,
    depth: number,
    auditInfo: IPartialAuditInfo,
  ): DepartmentClosure {
    return new DepartmentClosure(
      TenantId.generate(),
      ancestor,
      descendant,
      depth,
      auditInfo,
    );
  }

  public getAncestor(): EntityId {
    return this._ancestor;
  }

  public getDescendant(): EntityId {
    return this._descendant;
  }

  public getDepth(): number {
    return this._depth;
  }
}
