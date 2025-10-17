/**
 * 租户CQRS命令
 *
 * @description 定义租户相关的命令，包括创建、更新、删除等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseCommand } from "./base/base-command.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";

/**
 * 创建租户命令
 *
 * @description 创建新租户的命令
 */
export class CreateTenantCommand extends BaseCommand {
  /** 租户名称 */
  name: string;
  
  /** 租户类型 */
  type: TenantType;
  
  /** 租户描述 */
  description?: string;
  
  /** 平台ID */
  platformId: EntityId;
  
  /** 创建者标识符 */
  createdBy: string;

  constructor(
    name: string,
    type: TenantType,
    platformId: EntityId,
    createdBy: string,
    description?: string,
  ) {
    super("CreateTenant", "创建租户命令");
    this.name = name;
    this.type = type;
    this.platformId = platformId;
    this.createdBy = createdBy;
    this.description = description;
  }
}

/**
 * 更新租户命令
 *
 * @description 更新租户信息的命令
 */
export class UpdateTenantCommand extends BaseCommand {
  /** 租户ID */
  tenantId: EntityId;
  
  /** 租户名称 */
  name?: string;
  
  /** 租户类型 */
  type?: TenantType;
  
  /** 租户描述 */
  description?: string;
  
  /** 更新者标识符 */
  updatedBy: string;

  constructor(
    tenantId: EntityId,
    updatedBy: string,
    name?: string,
    type?: TenantType,
    description?: string,
  ) {
    super("UpdateTenant", "更新租户命令");
    this.tenantId = tenantId;
    this.updatedBy = updatedBy;
    this.name = name;
    this.type = type;
    this.description = description;
  }
}

/**
 * 删除租户命令
 *
 * @description 删除租户的命令
 */
export class DeleteTenantCommand extends BaseCommand {
  /** 租户ID */
  tenantId: EntityId;
  
  /** 删除者标识符 */
  deletedBy: string;
  
  /** 删除原因 */
  deleteReason?: string;

  constructor(
    tenantId: EntityId,
    deletedBy: string,
    deleteReason?: string,
  ) {
    super("DeleteTenant", "删除租户命令");
    this.tenantId = tenantId;
    this.deletedBy = deletedBy;
    this.deleteReason = deleteReason;
  }
}

/**
 * 激活租户命令
 *
 * @description 激活租户的命令
 */
export class ActivateTenantCommand extends BaseCommand {
  /** 租户ID */
  tenantId: EntityId;
  
  /** 激活者标识符 */
  activatedBy: string;

  constructor(tenantId: EntityId, activatedBy: string) {
    super("ActivateTenant", "激活租户命令");
    this.tenantId = tenantId;
    this.activatedBy = activatedBy;
  }
}

/**
 * 停用租户命令
 *
 * @description 停用租户的命令
 */
export class DeactivateTenantCommand extends BaseCommand {
  /** 租户ID */
  tenantId: EntityId;
  
  /** 停用者标识符 */
  deactivatedBy: string;
  
  /** 停用原因 */
  deactivateReason?: string;

  constructor(
    tenantId: EntityId,
    deactivatedBy: string,
    deactivateReason?: string,
  ) {
    super("DeactivateTenant", "停用租户命令");
    this.tenantId = tenantId;
    this.deactivatedBy = deactivatedBy;
    this.deactivateReason = deactivateReason;
  }
}
