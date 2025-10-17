/**
 * 验证异常类
 *
 * @description 数据验证相关的异常类定义
 * @since 1.0.0
 */

import { BaseDomainException, DomainExceptionType, DomainExceptionSeverity } from './base/base-domain-exception.js';

/**
 * 邮箱验证异常
 */
export class EmailValidationException extends BaseDomainException {
  constructor(
    message: string,
    email: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'EMAIL_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { email, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `邮箱格式错误：${this.message}`;
  }
}

/**
 * 无效邮箱异常
 */
export class InvalidEmailException extends EmailValidationException {
  constructor(email: string) {
    super(
      `邮箱格式无效：${email}`,
      email,
    );
  }
}

/**
 * 邮箱已存在异常
 */
export class EmailAlreadyExistsException extends EmailValidationException {
  constructor(email: string, existingUserId: string) {
    super(
      `邮箱已被使用：${email}`,
      email,
      { existingUserId },
    );
  }
}

/**
 * 密码验证异常
 */
export class PasswordValidationException extends BaseDomainException {
  constructor(
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'PASSWORD_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      context,
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `密码验证失败：${this.message}`;
  }
}

/**
 * 无效密码异常
 */
export class InvalidPasswordException extends PasswordValidationException {
  constructor(reason: string) {
    super(
      `密码不符合要求：${reason}`,
      { reason },
    );
  }
}

/**
 * 弱密码异常
 */
export class WeakPasswordException extends InvalidPasswordException {
  constructor() {
    super('密码强度不足，请使用更复杂的密码');
  }
}

/**
 * 用户名验证异常
 */
export class UsernameValidationException extends BaseDomainException {
  constructor(
    message: string,
    username: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'USERNAME_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { username, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `用户名格式错误：${this.message}`;
  }
}

/**
 * 无效用户名异常
 */
export class InvalidUsernameException extends UsernameValidationException {
  constructor(username: string, reason: string) {
    super(
      `用户名格式无效：${reason}`,
      username,
      { reason },
    );
  }
}

/**
 * 用户名已存在异常
 */
export class UsernameAlreadyExistsException extends UsernameValidationException {
  constructor(username: string, existingUserId: string) {
    super(
      `用户名已被使用：${username}`,
      username,
      { existingUserId },
    );
  }
}

/**
 * 电话号码验证异常
 */
export class PhoneNumberValidationException extends BaseDomainException {
  constructor(
    message: string,
    phoneNumber: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'PHONE_NUMBER_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { phoneNumber, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `电话号码格式错误：${this.message}`;
  }
}

/**
 * 无效电话号码异常
 */
export class InvalidPhoneNumberException extends PhoneNumberValidationException {
  constructor(phoneNumber: string, reason: string) {
    super(
      `电话号码格式无效：${reason}`,
      phoneNumber,
      { reason },
    );
  }
}

/**
 * 租户名称验证异常
 */
export class TenantNameValidationException extends BaseDomainException {
  constructor(
    message: string,
    tenantName: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'TENANT_NAME_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { tenantName, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `租户名称格式错误：${this.message}`;
  }
}

/**
 * 无效租户名称异常
 */
export class InvalidTenantNameException extends TenantNameValidationException {
  constructor(tenantName: string, reason: string) {
    super(
      `租户名称格式无效：${reason}`,
      tenantName,
      { reason },
    );
  }
}

/**
 * 组织名称验证异常
 */
export class OrganizationNameValidationException extends BaseDomainException {
  constructor(
    message: string,
    organizationName: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'ORGANIZATION_NAME_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { organizationName, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `组织名称格式错误：${this.message}`;
  }
}

/**
 * 无效组织名称异常
 */
export class InvalidOrganizationNameException extends OrganizationNameValidationException {
  constructor(organizationName: string, reason: string) {
    super(
      `组织名称格式无效：${reason}`,
      organizationName,
      { reason },
    );
  }
}

/**
 * 部门名称验证异常
 */
export class DepartmentNameValidationException extends BaseDomainException {
  constructor(
    message: string,
    departmentName: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      'DEPARTMENT_NAME_VALIDATION_FAILED',
      DomainExceptionType.VALIDATION,
      { departmentName, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `部门名称格式错误：${this.message}`;
  }
}

/**
 * 无效部门名称异常
 */
export class InvalidDepartmentNameException extends DepartmentNameValidationException {
  constructor(departmentName: string, reason: string) {
    super(
      `部门名称格式无效：${reason}`,
      departmentName,
      { reason },
    );
  }
}
