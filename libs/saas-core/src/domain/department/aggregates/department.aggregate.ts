/**
 * 部门聚合根（简化版本）
 */

import {
  TenantAwareAggregateRoot,
  IPartialAuditInfo,
} from "@hl8/business-core/index.js";
import { EntityId } from "@hl8/isolation-model/index.js";
import { Department } from "../entities/department.entity.js";
import { DepartmentClosure } from "../entities/department-closure.entity.js";

export class DepartmentAggregate extends TenantAwareAggregateRoot {
  private _closurePaths: DepartmentClosure[] = [];

  constructor(
    id: EntityId,
    private _department: Department,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
  }

  public static createRoot(
    id: EntityId,
    organizationId: EntityId,
    code: string,
    name: string,
    auditInfo: IPartialAuditInfo,
  ): DepartmentAggregate {
    const department = Department.createRoot(
      id,
      organizationId,
      code,
      name,
      auditInfo,
    );
    return new DepartmentAggregate(id, department, auditInfo);
  }

  public getDepartment(): Department {
    return this._department;
  }

  public getClosurePaths(): DepartmentClosure[] {
    return [...this._closurePaths];
  }

  public toObject(): object {
    return {
      id: (this as any).id.toString(),
      department: this._department.toObject(),
    };
  }
}
