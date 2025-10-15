/**
 * 组织成员实体
 *
 * @class OrganizationMember
 * @since 1.0.0
 */

import { BaseEntity, IPartialAuditInfo } from "@hl8/hybrid-archi/index.js";
import { EntityId } from "@hl8/isolation-model/index.js";
// import type { IPureLogger } from "@hl8/pure-logger/index.js";

export class OrganizationMember extends BaseEntity {
  constructor(
    id: EntityId,
    private _organizationId: EntityId,
    private _userId: EntityId,
    private _position: string | null,
    private _joinedAt: Date,
    private _leftAt: Date | null,
    auditInfo: IPartialAuditInfo,
    logger?: any,
  ) {
    super(id, auditInfo, logger);
  }

  public static create(
    id: EntityId,
    organizationId: EntityId,
    userId: EntityId,
    auditInfo: IPartialAuditInfo,
  ): OrganizationMember {
    return new OrganizationMember(
      id,
      organizationId,
      userId,
      null,
      new Date(),
      null,
      auditInfo,
    );
  }

  public getOrganizationId(): EntityId {
    return this._organizationId;
  }

  public getUserId(): EntityId {
    return this._userId;
  }

  public setPosition(position: string, updatedBy?: string): void {
    this._position = position;
    (this as any).updateTimestamp();
  }

  public leave(updatedBy?: string): void {
    this._leftAt = new Date();
    (this as any).updateTimestamp();
  }
}
