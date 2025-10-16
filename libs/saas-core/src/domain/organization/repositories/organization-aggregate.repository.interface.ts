import { OrganizationAggregate } from "../aggregates/organization.aggregate.js";
import { EntityId } from "@hl8/business-core";

export interface IOrganizationAggregateRepository {
  save(aggregate: OrganizationAggregate): Promise<void>;
  findById(id: EntityId): Promise<OrganizationAggregate | null>;
  findByCode(code: string): Promise<OrganizationAggregate | null>;
  findAll(offset?: number, limit?: number): Promise<OrganizationAggregate[]>;
  delete(id: EntityId, deletedBy: string, reason: string): Promise<void>;
  existsByCode(code: string): Promise<boolean>;
  count(): Promise<number>;
}
