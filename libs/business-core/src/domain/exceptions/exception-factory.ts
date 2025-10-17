/**
 * 异常工厂
 *
 * @description 统一创建和管理领域异常
 * @since 1.0.0
 */

import {
  BaseDomainException,
  DomainExceptionType,
  DomainExceptionSeverity,
} from "./base/base-domain-exception.js";
import {
  BusinessRuleViolationException,
  DomainValidationException,
  DomainStateException,
  DomainPermissionException,
} from "./base/base-domain-exception.js";

// 业务异常
import {
  TenantException,
  TenantNameAlreadyExistsException,
  InvalidTenantTypeException,
  TenantStateException,
  OrganizationException,
  OrganizationNameAlreadyExistsException,
  InvalidOrganizationTypeException,
  DepartmentException,
  DepartmentNameAlreadyExistsException,
  InvalidDepartmentLevelException,
  UserException,
  UserEmailAlreadyExistsException,
  UserUsernameAlreadyExistsException,
  RoleException,
  RoleNameAlreadyExistsException,
  PermissionException,
  PermissionNameAlreadyExistsException,
} from "./business-exceptions.js";

// 验证异常
import {
  EmailValidationException,
  InvalidEmailException,
  EmailAlreadyExistsException,
  PasswordValidationException,
  InvalidPasswordException,
  WeakPasswordException,
  UsernameValidationException,
  InvalidUsernameException,
  UsernameAlreadyExistsException,
  PhoneNumberValidationException,
  InvalidPhoneNumberException,
  TenantNameValidationException,
  InvalidTenantNameException,
  OrganizationNameValidationException,
  InvalidOrganizationNameException,
  DepartmentNameValidationException,
  InvalidDepartmentNameException,
} from "./validation-exceptions.js";

// 状态异常
import {
  TenantAlreadyActiveException,
  TenantNotActiveException,
  TenantAlreadyDeletedException,
  TenantNotDeletedException,
  OrganizationAlreadyActiveException,
  OrganizationNotActiveException,
  DepartmentAlreadyActiveException,
  DepartmentNotActiveException,
  UserAlreadyActiveException,
  UserNotActiveException,
  UserAlreadyLockedException,
  UserNotLockedException,
  RoleAlreadyActiveException,
  RoleNotActiveException,
} from "./state-exceptions.js";

/**
 * 异常工厂
 *
 * @description 统一创建和管理领域异常
 */
export class ExceptionFactory {
  private static instance: ExceptionFactory;

  private constructor() {}

  /**
   * 获取单例实例
   *
   * @returns 异常工厂实例
   */
  static getInstance(): ExceptionFactory {
    if (!ExceptionFactory.instance) {
      ExceptionFactory.instance = new ExceptionFactory();
    }
    return ExceptionFactory.instance;
  }

  /**
   * 创建业务规则违反异常
   *
   * @param message - 异常消息
   * @param ruleName - 规则名称
   * @param context - 上下文信息
   * @returns 业务规则违反异常
   */
  createBusinessRuleViolation(
    message: string,
    ruleName: string,
    context: Record<string, unknown> = {},
  ): BusinessRuleViolationException {
    return new BusinessRuleViolationException(message, ruleName, context);
  }

  /**
   * 创建领域验证异常
   *
   * @param message - 异常消息
   * @param fieldName - 字段名称
   * @param fieldValue - 字段值
   * @param context - 上下文信息
   * @returns 领域验证异常
   */
  createDomainValidation(
    message: string,
    fieldName: string,
    fieldValue: unknown,
    context: Record<string, unknown> = {},
  ): DomainValidationException {
    return new DomainValidationException(
      message,
      fieldName,
      fieldValue,
      context,
    );
  }

  /**
   * 创建领域状态异常
   *
   * @param message - 异常消息
   * @param currentState - 当前状态
   * @param requestedOperation - 请求的操作
   * @param context - 上下文信息
   * @returns 领域状态异常
   */
  createDomainState(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ): DomainStateException {
    return new DomainStateException(
      message,
      currentState,
      requestedOperation,
      context,
    );
  }

  /**
   * 创建领域权限异常
   *
   * @param message - 异常消息
   * @param requiredPermission - 所需权限
   * @param resource - 资源
   * @param context - 上下文信息
   * @returns 领域权限异常
   */
  createDomainPermission(
    message: string,
    requiredPermission: string,
    resource: string,
    context: Record<string, unknown> = {},
  ): DomainPermissionException {
    return new DomainPermissionException(
      message,
      requiredPermission,
      resource,
      context,
    );
  }

  // 租户相关异常创建方法

  /**
   * 创建租户名称已存在异常
   *
   * @param tenantName - 租户名称
   * @param existingTenantId - 已存在的租户ID
   * @returns 租户名称已存在异常
   */
  createTenantNameAlreadyExists(
    tenantName: string,
    existingTenantId: string,
  ): TenantNameAlreadyExistsException {
    return new TenantNameAlreadyExistsException(tenantName, existingTenantId);
  }

  /**
   * 创建无效租户类型异常
   *
   * @param tenantType - 租户类型
   * @returns 无效租户类型异常
   */
  createInvalidTenantType(tenantType: string): InvalidTenantTypeException {
    return new InvalidTenantTypeException(tenantType);
  }

  /**
   * 创建租户已激活异常
   *
   * @param tenantId - 租户ID
   * @returns 租户已激活异常
   */
  createTenantAlreadyActive(tenantId: string): TenantAlreadyActiveException {
    return new TenantAlreadyActiveException(tenantId);
  }

  /**
   * 创建租户未激活异常
   *
   * @param tenantId - 租户ID
   * @returns 租户未激活异常
   */
  createTenantNotActive(tenantId: string): TenantNotActiveException {
    return new TenantNotActiveException(tenantId);
  }

  // 组织相关异常创建方法

  /**
   * 创建组织名称已存在异常
   *
   * @param organizationName - 组织名称
   * @param existingOrganizationId - 已存在的组织ID
   * @returns 组织名称已存在异常
   */
  createOrganizationNameAlreadyExists(
    organizationName: string,
    existingOrganizationId: string,
  ): OrganizationNameAlreadyExistsException {
    return new OrganizationNameAlreadyExistsException(
      organizationName,
      existingOrganizationId,
    );
  }

  /**
   * 创建无效组织类型异常
   *
   * @param organizationType - 组织类型
   * @returns 无效组织类型异常
   */
  createInvalidOrganizationType(
    organizationType: string,
  ): InvalidOrganizationTypeException {
    return new InvalidOrganizationTypeException(organizationType);
  }

  // 部门相关异常创建方法

  /**
   * 创建部门名称已存在异常
   *
   * @param departmentName - 部门名称
   * @param existingDepartmentId - 已存在的部门ID
   * @returns 部门名称已存在异常
   */
  createDepartmentNameAlreadyExists(
    departmentName: string,
    existingDepartmentId: string,
  ): DepartmentNameAlreadyExistsException {
    return new DepartmentNameAlreadyExistsException(
      departmentName,
      existingDepartmentId,
    );
  }

  /**
   * 创建无效部门层级异常
   *
   * @param level - 层级
   * @param maxLevel - 最大层级
   * @returns 无效部门层级异常
   */
  createInvalidDepartmentLevel(
    level: number,
    maxLevel: number,
  ): InvalidDepartmentLevelException {
    return new InvalidDepartmentLevelException(level, maxLevel);
  }

  // 用户相关异常创建方法

  /**
   * 创建用户邮箱已存在异常
   *
   * @param email - 邮箱
   * @param existingUserId - 已存在的用户ID
   * @returns 用户邮箱已存在异常
   */
  createUserEmailAlreadyExists(
    email: string,
    existingUserId: string,
  ): UserEmailAlreadyExistsException {
    return new UserEmailAlreadyExistsException(email, existingUserId);
  }

  /**
   * 创建用户用户名已存在异常
   *
   * @param username - 用户名
   * @param existingUserId - 已存在的用户ID
   * @returns 用户用户名已存在异常
   */
  createUserUsernameAlreadyExists(
    username: string,
    existingUserId: string,
  ): UserUsernameAlreadyExistsException {
    return new UserUsernameAlreadyExistsException(username, existingUserId);
  }

  // 验证异常创建方法

  /**
   * 创建无效邮箱异常
   *
   * @param email - 邮箱
   * @returns 无效邮箱异常
   */
  createInvalidEmail(email: string): InvalidEmailException {
    return new InvalidEmailException(email);
  }

  /**
   * 创建邮箱已存在异常
   *
   * @param email - 邮箱
   * @param existingUserId - 已存在的用户ID
   * @returns 邮箱已存在异常
   */
  createEmailAlreadyExists(
    email: string,
    existingUserId: string,
  ): EmailAlreadyExistsException {
    return new EmailAlreadyExistsException(email, existingUserId);
  }

  /**
   * 创建无效密码异常
   *
   * @param reason - 原因
   * @returns 无效密码异常
   */
  createInvalidPassword(reason: string): InvalidPasswordException {
    return new InvalidPasswordException(reason);
  }

  /**
   * 创建弱密码异常
   *
   * @returns 弱密码异常
   */
  createWeakPassword(): WeakPasswordException {
    return new WeakPasswordException();
  }

  /**
   * 创建无效用户名异常
   *
   * @param username - 用户名
   * @param reason - 原因
   * @returns 无效用户名异常
   */
  createInvalidUsername(
    username: string,
    reason: string,
  ): InvalidUsernameException {
    return new InvalidUsernameException(username, reason);
  }

  /**
   * 创建用户名已存在异常
   *
   * @param username - 用户名
   * @param existingUserId - 已存在的用户ID
   * @returns 用户名已存在异常
   */
  createUsernameAlreadyExists(
    username: string,
    existingUserId: string,
  ): UsernameAlreadyExistsException {
    return new UsernameAlreadyExistsException(username, existingUserId);
  }

  /**
   * 创建无效电话号码异常
   *
   * @param phoneNumber - 电话号码
   * @param reason - 原因
   * @returns 无效电话号码异常
   */
  createInvalidPhoneNumber(
    phoneNumber: string,
    reason: string,
  ): InvalidPhoneNumberException {
    return new InvalidPhoneNumberException(phoneNumber, reason);
  }

  /**
   * 创建无效租户名称异常
   *
   * @param tenantName - 租户名称
   * @param reason - 原因
   * @returns 无效租户名称异常
   */
  createInvalidTenantName(
    tenantName: string,
    reason: string,
  ): InvalidTenantNameException {
    return new InvalidTenantNameException(tenantName, reason);
  }

  /**
   * 创建无效组织名称异常
   *
   * @param organizationName - 组织名称
   * @param reason - 原因
   * @returns 无效组织名称异常
   */
  createInvalidOrganizationName(
    organizationName: string,
    reason: string,
  ): InvalidOrganizationNameException {
    return new InvalidOrganizationNameException(organizationName, reason);
  }

  /**
   * 创建无效部门名称异常
   *
   * @param departmentName - 部门名称
   * @param reason - 原因
   * @returns 无效部门名称异常
   */
  createInvalidDepartmentName(
    departmentName: string,
    reason: string,
  ): InvalidDepartmentNameException {
    return new InvalidDepartmentNameException(departmentName, reason);
  }

  /**
   * 创建通用异常
   *
   * @param message - 异常消息
   * @param errorCode - 错误代码
   * @param errorType - 错误类型
   * @param context - 上下文信息
   * @param severity - 严重级别
   * @returns 通用异常
   */
  createGenericException(
    message: string,
    errorCode: string,
    errorType: DomainExceptionType,
    context: Record<string, unknown> = {},
    severity: DomainExceptionSeverity = DomainExceptionSeverity.MEDIUM,
  ): BaseDomainException {
    return new BaseDomainException(
      message,
      errorCode,
      errorType,
      context,
      severity,
    );
  }
}
