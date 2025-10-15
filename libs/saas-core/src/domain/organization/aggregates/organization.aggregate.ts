/**
 * 组织聚合根
 *
 * @class OrganizationAggregate
 * @since 1.0.0
 */

import { TenantAwareAggregateRoot, IPartialAuditInfo } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";
// import type { IPureLogger } from "@hl8/pure-logger/index.js";
import { Organization } from "../entities/organization.entity.js";
import { OrganizationMember } from "../entities/organization-member.entity.js";
import { OrganizationType } from "../value-objects/organization-type.vo.js";

import { TenantId } from "@hl8/isolation-model";
export class OrganizationAggregate extends TenantAwareAggregateRoot {
  private _members: OrganizationMember[] = [];

  constructor(
    id: EntityId,
    private _organization: Organization,
    auditInfo: IPartialAuditInfo,
    logger?: any,
  ) {
    super(id, auditInfo, logger);
  }

  public static create(
    id: EntityId,
    code: string,
    name: string,
    type: OrganizationType,
    auditInfo: IPartialAuditInfo,
  ): OrganizationAggregate {
    const organization = Organization.create(id, code, name, type, auditInfo);
    return new OrganizationAggregate(id, organization, auditInfo);
  }

  public getOrganization(): Organization {
    return this._organization;
  }

  public getMembers(): OrganizationMember[] {
    return [...this._members];
  }

  public addMember(userId: EntityId, updatedBy: string): void {
    (this as any).ensureTenantContext();

    const member = OrganizationMember.create(
      TenantId.generate(),
      (this as any).id,
      userId,
      { createdBy: updatedBy },
    );

    this._members.push(member);
    (this as any).logTenantOperation("组织成员已添加", { userId: userId.toString() });
  }

  public removeMember(userId: EntityId, updatedBy: string): void {
    const member = this._members.find((m) => m.getUserId().equals(userId));
    if (member) {
      member.leave(updatedBy);
    }
  }

  public toObject(): object {
    return {
      id: (this as any).id.toString(),
      organization: this._organization.toObject(),
      membersCount: this._members.length,
    };
  }
}
