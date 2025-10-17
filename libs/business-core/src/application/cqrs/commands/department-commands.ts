/**
 * 部门CQRS命令
 *
 * @description 定义部门相关的命令，包括创建、更新、删除等操作
 *
 * @since 1.0.0
 */

import { OrganizationId, DepartmentId } from "@hl8/isolation-model";
import { BaseCommand } from "./base/base-command.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";

/**
 * 创建部门命令
 *
 * @description 创建新部门的命令
 */
export class CreateDepartmentCommand extends BaseCommand {
  /** 部门名称 */
  name: string;

  /** 部门层级 */
  level: DepartmentLevel;

  /** 部门描述 */
  description?: string;

  /** 组织ID */
  organizationId: OrganizationId;

  /** 父部门ID */
  parentDepartmentId?: DepartmentId;

  constructor(
    name: string,
    level: DepartmentLevel,
    tenantId: string,
    organizationId: OrganizationId,
    createdBy: string,
    description?: string,
    parentDepartmentId?: DepartmentId,
  ) {
    super(tenantId, createdBy);
    this.name = name;
    this.level = level;
    this.organizationId = organizationId;
    this.description = description;
    this.parentDepartmentId = parentDepartmentId;
  }

  get commandType(): string {
    return "CreateDepartment";
  }
}

/**
 * 更新部门命令
 *
 * @description 更新部门信息的命令
 */
export class UpdateDepartmentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  /** 部门名称 */
  name?: string;

  /** 部门层级 */
  level?: DepartmentLevel;

  /** 部门描述 */
  description?: string;

  constructor(
    departmentId: DepartmentId,
    tenantId: string,
    updatedBy: string,
    name?: string,
    level?: DepartmentLevel,
    description?: string,
  ) {
    super(tenantId, updatedBy);
    this.departmentId = departmentId;
    this.name = name;
    this.level = level;
    this.description = description;
  }

  get commandType(): string {
    return "UpdateDepartment";
  }
}

/**
 * 删除部门命令
 *
 * @description 删除部门的命令
 */
export class DeleteDepartmentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  /** 删除原因 */
  deleteReason?: string;

  constructor(
    departmentId: DepartmentId,
    tenantId: string,
    deletedBy: string,
    deleteReason?: string,
  ) {
    super(tenantId, deletedBy);
    this.departmentId = departmentId;
    this.deleteReason = deleteReason;
  }

  get commandType(): string {
    return "DeleteDepartment";
  }
}

/**
 * 激活部门命令
 *
 * @description 激活部门的命令
 */
export class ActivateDepartmentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  constructor(
    departmentId: DepartmentId,
    tenantId: string,
    activatedBy: string,
  ) {
    super(tenantId, activatedBy);
    this.departmentId = departmentId;
  }

  get commandType(): string {
    return "ActivateDepartment";
  }
}

/**
 * 停用部门命令
 *
 * @description 停用部门的命令
 */
export class DeactivateDepartmentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  /** 停用原因 */
  deactivateReason?: string;

  constructor(
    departmentId: DepartmentId,
    tenantId: string,
    deactivatedBy: string,
    deactivateReason?: string,
  ) {
    super(tenantId, deactivatedBy);
    this.departmentId = departmentId;
    this.deactivateReason = deactivateReason;
  }

  get commandType(): string {
    return "DeactivateDepartment";
  }
}

/**
 * 设置部门父级命令
 *
 * @description 设置部门父级的命令
 */
export class SetDepartmentParentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  /** 父部门ID */
  parentDepartmentId: DepartmentId;

  constructor(
    departmentId: DepartmentId,
    parentDepartmentId: DepartmentId,
    tenantId: string,
    updatedBy: string,
  ) {
    super(tenantId, updatedBy);
    this.departmentId = departmentId;
    this.parentDepartmentId = parentDepartmentId;
  }

  get commandType(): string {
    return "SetDepartmentParent";
  }
}

/**
 * 移除部门父级命令
 *
 * @description 移除部门父级的命令
 */
export class RemoveDepartmentParentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  constructor(departmentId: DepartmentId, tenantId: string, updatedBy: string) {
    super(tenantId, updatedBy);
    this.departmentId = departmentId;
  }

  get commandType(): string {
    return "RemoveDepartmentParent";
  }
}

/**
 * 移动部门命令
 *
 * @description 移动部门到新组织的命令
 */
export class MoveDepartmentCommand extends BaseCommand {
  /** 部门ID */
  departmentId: DepartmentId;

  /** 新组织ID */
  newOrganizationId: OrganizationId;

  /** 新父部门ID */
  newParentDepartmentId?: DepartmentId;

  constructor(
    departmentId: DepartmentId,
    newOrganizationId: OrganizationId,
    tenantId: string,
    movedBy: string,
    newParentDepartmentId?: DepartmentId,
  ) {
    super(tenantId, movedBy);
    this.departmentId = departmentId;
    this.newOrganizationId = newOrganizationId;
    this.newParentDepartmentId = newParentDepartmentId;
  }

  get commandType(): string {
    return "MoveDepartment";
  }
}
