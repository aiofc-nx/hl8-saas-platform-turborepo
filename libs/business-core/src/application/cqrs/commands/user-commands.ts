/**
 * 用户CQRS命令
 *
 * @description 定义用户相关的命令，包括创建、更新、删除等操作
 *
 * @since 1.0.0
 */

import {
  EntityId,
  UserId,
  OrganizationId,
  DepartmentId,
} from "@hl8/isolation-model";
import { BaseCommand } from "./base/base-command.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import { UserRole } from "../../../domain/value-objects/types/user-role.vo.js";

/**
 * 创建用户命令
 *
 * @description 创建新用户的命令
 */
export class CreateUserCommand extends BaseCommand {
  /** 用户名 */
  username: string;

  /** 邮箱地址 */
  email: string;

  /** 手机号码 */
  phone?: string;

  /** 用户状态 */
  status: UserStatus;

  /** 用户角色 */
  role: UserRole;

  /** 用户姓名 */
  displayName: string;

  /** 头像URL */
  avatarUrl?: string;

  /** 用户描述 */
  description?: string;

  /** 组织ID */
  organizationId?: OrganizationId;

  /** 部门ID */
  departmentId?: DepartmentId;

  constructor(
    username: string,
    email: string,
    status: UserStatus,
    role: UserRole,
    displayName: string,
    tenantId: string,
    createdBy: string,
    phone?: string,
    avatarUrl?: string,
    description?: string,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
  ) {
    super(tenantId, createdBy);
    this.username = username;
    this.email = email;
    this.status = status;
    this.role = role;
    this.displayName = displayName;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.description = description;
    this.organizationId = organizationId;
    this.departmentId = departmentId;
  }

  get commandType(): string {
    return "CreateUser";
  }
}

/**
 * 更新用户命令
 *
 * @description 更新用户信息的命令
 */
export class UpdateUserCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 用户名 */
  username?: string;

  /** 邮箱地址 */
  email?: string;

  /** 手机号码 */
  phone?: string;

  /** 用户状态 */
  status?: UserStatus;

  /** 用户角色 */
  role?: UserRole;

  /** 用户姓名 */
  displayName?: string;

  /** 头像URL */
  avatarUrl?: string;

  /** 用户描述 */
  description?: string;

  constructor(
    userId: UserId,
    tenantId: string,
    updatedBy: string,
    username?: string,
    email?: string,
    phone?: string,
    status?: UserStatus,
    role?: UserRole,
    displayName?: string,
    avatarUrl?: string,
    description?: string,
  ) {
    super(tenantId, updatedBy);
    this.targetUserId = userId;
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.status = status;
    this.role = role;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.description = description;
  }

  get commandType(): string {
    return "UpdateUser";
  }
}

/**
 * 删除用户命令
 *
 * @description 删除用户的命令
 */
export class DeleteUserCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 删除原因 */
  deleteReason?: string;

  constructor(
    userId: UserId,
    tenantId: string,
    deletedBy: string,
    deleteReason?: string,
  ) {
    super(tenantId, deletedBy);
    this.targetUserId = userId;
    this.deleteReason = deleteReason;
  }

  get commandType(): string {
    return "DeleteUser";
  }
}

/**
 * 激活用户命令
 *
 * @description 激活用户的命令
 */
export class ActivateUserCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  constructor(userId: UserId, tenantId: string, activatedBy: string) {
    super(tenantId, activatedBy);
    this.targetUserId = userId;
  }

  get commandType(): string {
    return "ActivateUser";
  }
}

/**
 * 停用用户命令
 *
 * @description 停用用户的命令
 */
export class DeactivateUserCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 停用原因 */
  deactivateReason?: string;

  constructor(
    userId: UserId,
    tenantId: string,
    deactivatedBy: string,
    deactivateReason?: string,
  ) {
    super(tenantId, deactivatedBy);
    this.targetUserId = userId;
    this.deactivateReason = deactivateReason;
  }

  get commandType(): string {
    return "DeactivateUser";
  }
}

/**
 * 分配用户角色命令
 *
 * @description 分配用户角色的命令
 */
export class AssignUserRoleCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 角色ID */
  roleId: EntityId;

  /** 分配原因 */
  reason?: string;

  /** 过期时间 */
  expiresAt?: Date;

  constructor(
    userId: UserId,
    roleId: EntityId,
    tenantId: string,
    assignedBy: string,
    reason?: string,
    expiresAt?: Date,
  ) {
    super(tenantId, assignedBy);
    this.targetUserId = userId;
    this.roleId = roleId;
    this.reason = reason;
    this.expiresAt = expiresAt;
  }

  get commandType(): string {
    return "AssignUserRole";
  }
}

/**
 * 移除用户角色命令
 *
 * @description 移除用户角色的命令
 */
export class RemoveUserRoleCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 角色ID */
  roleId: EntityId;

  /** 移除原因 */
  reason?: string;

  constructor(
    userId: UserId,
    roleId: EntityId,
    tenantId: string,
    removedBy: string,
    reason?: string,
  ) {
    super(tenantId, removedBy);
    this.targetUserId = userId;
    this.roleId = roleId;
    this.reason = reason;
  }

  get commandType(): string {
    return "RemoveUserRole";
  }
}

/**
 * 移动用户命令
 *
 * @description 移动用户到新部门/组织的命令
 */
export class MoveUserCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 新组织ID */
  newOrganizationId?: OrganizationId;

  /** 新部门ID */
  newDepartmentId?: DepartmentId;

  constructor(
    userId: UserId,
    tenantId: string,
    movedBy: string,
    newOrganizationId?: OrganizationId,
    newDepartmentId?: DepartmentId,
  ) {
    super(tenantId, movedBy);
    this.targetUserId = userId;
    this.newOrganizationId = newOrganizationId;
    this.newDepartmentId = newDepartmentId;
  }

  get commandType(): string {
    return "MoveUser";
  }
}

/**
 * 重置用户密码命令
 *
 * @description 重置用户密码的命令
 */
export class ResetUserPasswordCommand extends BaseCommand {
  /** 目标用户ID */
  targetUserId: UserId;

  /** 新密码 */
  newPassword: string;

  constructor(
    userId: UserId,
    newPassword: string,
    tenantId: string,
    resetBy: string,
  ) {
    super(tenantId, resetBy);
    this.targetUserId = userId;
    this.newPassword = newPassword;
  }

  get commandType(): string {
    return "ResetUserPassword";
  }
}
