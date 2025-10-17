/**
 * 状态异常类
 *
 * @description 状态相关的异常类定义
 * @since 1.0.0
 */

import {
  BaseDomainException,
  DomainExceptionType,
  DomainExceptionSeverity,
} from "./base/base-domain-exception.js";

/**
 * 租户状态异常
 */
export class TenantStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "TENANT_STATE_INVALID",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `租户状态错误：${this.message}`;
  }
}

/**
 * 租户已激活异常
 */
export class TenantAlreadyActiveException extends TenantStateException {
  constructor(tenantId: string) {
    super("租户已经激活", "active", "activate", { tenantId });
  }
}

/**
 * 租户未激活异常
 */
export class TenantNotActiveException extends TenantStateException {
  constructor(tenantId: string) {
    super("租户未激活", "inactive", "deactivate", { tenantId });
  }
}

/**
 * 租户已删除异常
 */
export class TenantAlreadyDeletedException extends TenantStateException {
  constructor(tenantId: string) {
    super("租户已被删除", "deleted", "delete", { tenantId });
  }
}

/**
 * 租户未删除异常
 */
export class TenantNotDeletedException extends TenantStateException {
  constructor(tenantId: string) {
    super("租户未被删除", "active", "restore", { tenantId });
  }
}

/**
 * 组织状态异常
 */
export class OrganizationStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "ORGANIZATION_STATE_INVALID",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `组织状态错误：${this.message}`;
  }
}

/**
 * 组织已激活异常
 */
export class OrganizationAlreadyActiveException extends OrganizationStateException {
  constructor(organizationId: string) {
    super("组织已经激活", "active", "activate", { organizationId });
  }
}

/**
 * 组织未激活异常
 */
export class OrganizationNotActiveException extends OrganizationStateException {
  constructor(organizationId: string) {
    super("组织未激活", "inactive", "deactivate", { organizationId });
  }
}

/**
 * 部门状态异常
 */
export class DepartmentStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "DEPARTMENT_STATE_INVALID",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `部门状态错误：${this.message}`;
  }
}

/**
 * 部门已激活异常
 */
export class DepartmentAlreadyActiveException extends DepartmentStateException {
  constructor(departmentId: string) {
    super("部门已经激活", "active", "activate", { departmentId });
  }
}

/**
 * 部门未激活异常
 */
export class DepartmentNotActiveException extends DepartmentStateException {
  constructor(departmentId: string) {
    super("部门未激活", "inactive", "deactivate", { departmentId });
  }
}

/**
 * 用户状态异常
 */
export class UserStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "USER_STATE_INVALID",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `用户状态错误：${this.message}`;
  }
}

/**
 * 用户已激活异常
 */
export class UserAlreadyActiveException extends UserStateException {
  constructor(userId: string) {
    super("用户已经激活", "active", "activate", { userId });
  }
}

/**
 * 用户未激活异常
 */
export class UserNotActiveException extends UserStateException {
  constructor(userId: string) {
    super("用户未激活", "inactive", "deactivate", { userId });
  }
}

/**
 * 用户已锁定异常
 */
export class UserAlreadyLockedException extends UserStateException {
  constructor(userId: string) {
    super("用户已被锁定", "locked", "lock", { userId });
  }
}

/**
 * 用户未锁定异常
 */
export class UserNotLockedException extends UserStateException {
  constructor(userId: string) {
    super("用户未被锁定", "active", "unlock", { userId });
  }
}

/**
 * 角色状态异常
 */
export class RoleStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "ROLE_STATE_INVALID",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `角色状态错误：${this.message}`;
  }
}

/**
 * 角色已激活异常
 */
export class RoleAlreadyActiveException extends RoleStateException {
  constructor(roleId: string) {
    super("角色已经激活", "active", "activate", { roleId });
  }
}

/**
 * 角色未激活异常
 */
export class RoleNotActiveException extends RoleStateException {
  constructor(roleId: string) {
    super("角色未激活", "inactive", "deactivate", { roleId });
  }
}
