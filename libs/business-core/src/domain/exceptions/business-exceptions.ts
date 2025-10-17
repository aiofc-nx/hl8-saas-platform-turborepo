/**
 * 业务异常类
 *
 * @description 业务相关的异常类定义
 * @since 1.0.0
 */

import {
  BaseDomainException,
  DomainExceptionType,
  DomainExceptionSeverity,
} from "./base/base-domain-exception.js";

/**
 * 租户相关异常
 */
export class TenantException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `TENANT_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `租户操作失败：${this.message}`;
  }
}

/**
 * 租户名称已存在异常
 */
export class TenantNameAlreadyExistsException extends TenantException {
  constructor(tenantName: string, existingTenantId: string) {
    super(`租户名称 "${tenantName}" 已存在`, "NAME_ALREADY_EXISTS", {
      tenantName,
      existingTenantId,
    });
  }
}

/**
 * 租户类型无效异常
 */
export class InvalidTenantTypeException extends TenantException {
  constructor(tenantType: string) {
    super(`无效的租户类型：${tenantType}`, "INVALID_TYPE", { tenantType });
  }
}

/**
 * 租户状态异常
 */
export class TenantStateException extends TenantException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
  ) {
    super(message, "INVALID_STATE", { currentState, requestedOperation });
  }
}

/**
 * 组织相关异常
 */
export class OrganizationException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `ORGANIZATION_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `组织操作失败：${this.message}`;
  }
}

/**
 * 组织名称已存在异常
 */
export class OrganizationNameAlreadyExistsException extends OrganizationException {
  constructor(organizationName: string, existingOrganizationId: string) {
    super(`组织名称 "${organizationName}" 已存在`, "NAME_ALREADY_EXISTS", {
      organizationName,
      existingOrganizationId,
    });
  }
}

/**
 * 组织类型无效异常
 */
export class InvalidOrganizationTypeException extends OrganizationException {
  constructor(organizationType: string) {
    super(`无效的组织类型：${organizationType}`, "INVALID_TYPE", {
      organizationType,
    });
  }
}

/**
 * 部门相关异常
 */
export class DepartmentException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `DEPARTMENT_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `部门操作失败：${this.message}`;
  }
}

/**
 * 部门名称已存在异常
 */
export class DepartmentNameAlreadyExistsException extends DepartmentException {
  constructor(departmentName: string, existingDepartmentId: string) {
    super(`部门名称 "${departmentName}" 已存在`, "NAME_ALREADY_EXISTS", {
      departmentName,
      existingDepartmentId,
    });
  }
}

/**
 * 部门层级无效异常
 */
export class InvalidDepartmentLevelException extends DepartmentException {
  constructor(level: number, maxLevel: number) {
    super(`部门层级 ${level} 超过最大层级 ${maxLevel}`, "INVALID_LEVEL", {
      level,
      maxLevel,
    });
  }
}

/**
 * 用户相关异常
 */
export class UserException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `USER_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `用户操作失败：${this.message}`;
  }
}

/**
 * 用户邮箱已存在异常
 */
export class UserEmailAlreadyExistsException extends UserException {
  constructor(email: string, existingUserId: string) {
    super(`邮箱 "${email}" 已被其他用户使用`, "EMAIL_ALREADY_EXISTS", {
      email,
      existingUserId,
    });
  }
}

/**
 * 用户用户名已存在异常
 */
export class UserUsernameAlreadyExistsException extends UserException {
  constructor(username: string, existingUserId: string) {
    super(`用户名 "${username}" 已被其他用户使用`, "USERNAME_ALREADY_EXISTS", {
      username,
      existingUserId,
    });
  }
}

/**
 * 角色相关异常
 */
export class RoleException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `ROLE_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `角色操作失败：${this.message}`;
  }
}

/**
 * 角色名称已存在异常
 */
export class RoleNameAlreadyExistsException extends RoleException {
  constructor(roleName: string, existingRoleId: string) {
    super(`角色名称 "${roleName}" 已存在`, "NAME_ALREADY_EXISTS", {
      roleName,
      existingRoleId,
    });
  }
}

/**
 * 权限相关异常
 */
export class PermissionException extends BaseDomainException {
  constructor(
    message: string,
    errorCode: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `PERMISSION_${errorCode}`,
      DomainExceptionType.BUSINESS_RULE,
      context,
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `权限操作失败：${this.message}`;
  }
}

/**
 * 权限名称已存在异常
 */
export class PermissionNameAlreadyExistsException extends PermissionException {
  constructor(permissionName: string, existingPermissionId: string) {
    super(`权限名称 "${permissionName}" 已存在`, "NAME_ALREADY_EXISTS", {
      permissionName,
      existingPermissionId,
    });
  }
}
