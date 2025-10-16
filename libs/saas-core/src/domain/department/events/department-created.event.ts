import { BaseDomainEvent, EntityId } from "@hl8/business-core";

export class DepartmentCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: EntityId,
    version: number,
    tenantId: EntityId,
    public readonly code: string,
    public readonly name: string,
  ) {
    super(aggregateId, version, tenantId);
  }

  get eventType(): string {
    return "DepartmentCreated";
  }
}
