/**
 * 组织CQRS命令
 *
 * @description 定义组织相关的命令，包括创建、更新、删除等操作
 *
 * @since 1.0.0
 */

import { OrganizationId } from "@hl8/isolation-model";
import { BaseCommand } from "./base/base-command.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";

/**
 * 创建组织命令
 *
 * @description 创建新组织的命令
 */
export class CreateOrganizationCommand extends BaseCommand {
  /** 组织名称 */
  name: string;

  /** 组织类型 */
  type: OrganizationType;

  /** 组织描述 */
  description?: string;

  /** 父组织ID */
  parentOrganizationId?: OrganizationId;

  constructor(
    name: string,
    type: OrganizationType,
    tenantId: string,
    createdBy: string,
    description?: string,
    parentOrganizationId?: OrganizationId,
  ) {
    super(tenantId, createdBy);
    this.name = name;
    this.type = type;
    this.description = description;
    this.parentOrganizationId = parentOrganizationId;
  }

  get commandType(): string {
    return "CreateOrganization";
  }
}

/**
 * 更新组织命令
 *
 * @description 更新组织信息的命令
 */
export class UpdateOrganizationCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  /** 组织名称 */
  name?: string;

  /** 组织类型 */
  type?: OrganizationType;

  /** 组织描述 */
  description?: string;

  constructor(
    organizationId: OrganizationId,
    tenantId: string,
    updatedBy: string,
    name?: string,
    type?: OrganizationType,
    description?: string,
  ) {
    super(tenantId, updatedBy);
    this.organizationId = organizationId;
    this.name = name;
    this.type = type;
    this.description = description;
  }

  get commandType(): string {
    return "UpdateOrganization";
  }
}

/**
 * 删除组织命令
 *
 * @description 删除组织的命令
 */
export class DeleteOrganizationCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  /** 删除原因 */
  deleteReason?: string;

  constructor(
    organizationId: OrganizationId,
    tenantId: string,
    deletedBy: string,
    deleteReason?: string,
  ) {
    super(tenantId, deletedBy);
    this.organizationId = organizationId;
    this.deleteReason = deleteReason;
  }

  get commandType(): string {
    return "DeleteOrganization";
  }
}

/**
 * 激活组织命令
 *
 * @description 激活组织的命令
 */
export class ActivateOrganizationCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  constructor(
    organizationId: OrganizationId,
    tenantId: string,
    activatedBy: string,
  ) {
    super(tenantId, activatedBy);
    this.organizationId = organizationId;
  }

  get commandType(): string {
    return "ActivateOrganization";
  }
}

/**
 * 停用组织命令
 *
 * @description 停用组织的命令
 */
export class DeactivateOrganizationCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  /** 停用原因 */
  deactivateReason?: string;

  constructor(
    organizationId: OrganizationId,
    tenantId: string,
    deactivatedBy: string,
    deactivateReason?: string,
  ) {
    super(tenantId, deactivatedBy);
    this.organizationId = organizationId;
    this.deactivateReason = deactivateReason;
  }

  get commandType(): string {
    return "DeactivateOrganization";
  }
}

/**
 * 设置组织父级命令
 *
 * @description 设置组织父级的命令
 */
export class SetOrganizationParentCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  /** 父组织ID */
  parentOrganizationId: OrganizationId;

  constructor(
    organizationId: OrganizationId,
    parentOrganizationId: OrganizationId,
    tenantId: string,
    updatedBy: string,
  ) {
    super(tenantId, updatedBy);
    this.organizationId = organizationId;
    this.parentOrganizationId = parentOrganizationId;
  }

  get commandType(): string {
    return "SetOrganizationParent";
  }
}

/**
 * 移除组织父级命令
 *
 * @description 移除组织父级的命令
 */
export class RemoveOrganizationParentCommand extends BaseCommand {
  /** 组织ID */
  organizationId: OrganizationId;

  constructor(
    organizationId: OrganizationId,
    tenantId: string,
    updatedBy: string,
  ) {
    super(tenantId, updatedBy);
    this.organizationId = organizationId;
  }

  get commandType(): string {
    return "RemoveOrganizationParent";
  }
}
