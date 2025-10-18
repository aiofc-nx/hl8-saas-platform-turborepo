/**
 * 用户命令
 *
 * @description 定义用户相关的命令，包括创建、更新、删除、激活、停用等
 *
 * ## 业务规则
 *
 * ### 命令设计规则
 * - 命令表示用户的意图，不包含业务逻辑
 * - 命令应该是不可变的，创建后不能修改
 * - 命令应该包含执行命令所需的所有信息
 * - 命令应该支持序列化和反序列化
 *
 * ### 命令验证规则
 * - 命令创建时应该验证必要参数
 * - 命令参数应该符合业务规则
 * - 命令参数应该进行类型检查
 *
 * @example
 * ```typescript
 * // 创建用户命令
 * const createUserCommand = new CreateUserCommand(
 *   'username',
 *   'email@example.com',
 *   'displayName',
 *   'ADMIN',
 *   tenantId,
 *   'admin'
 * );
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseCommand } from "./base/base-command.js";

/**
 * 创建用户命令
 *
 * @description 创建新用户的命令
 */
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly phoneNumber?: string,
    public readonly displayName?: string,
    public readonly role?: string,
    public readonly tenantId?: TenantId,
    public readonly createdBy?: string,
    public readonly description?: string,
  ) {
    super("CreateUserCommand", "创建用户命令");
  }
}

/**
 * 更新用户命令
 *
 * @description 更新用户信息的命令
 */
export class UpdateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly tenantId: TenantId,
    public readonly displayName?: string,
    public readonly email?: string,
    public readonly phoneNumber?: string,
    public readonly avatarUrl?: string,
    public readonly role?: string,
    public readonly updatedBy?: string,
    public readonly updateReason?: string,
  ) {
    super("UpdateUserCommand", "更新用户命令");
  }
}

/**
 * 删除用户命令
 *
 * @description 删除用户的命令
 */
export class DeleteUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly tenantId: TenantId,
    public readonly deletedBy?: string,
    public readonly deleteReason?: string,
    public readonly forceDelete?: boolean,
  ) {
    super("DeleteUserCommand", "删除用户命令");
  }
}

/**
 * 激活用户命令
 *
 * @description 激活用户的命令
 */
export class ActivateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly tenantId: TenantId,
    public readonly activatedBy?: string,
    public readonly activateReason?: string,
  ) {
    super("ActivateUserCommand", "激活用户命令");
  }
}

/**
 * 停用用户命令
 *
 * @description 停用用户的命令
 */
export class DeactivateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly tenantId: TenantId,
    public readonly deactivatedBy?: string,
    public readonly deactivateReason?: string,
  ) {
    super("DeactivateUserCommand", "停用用户命令");
  }
}