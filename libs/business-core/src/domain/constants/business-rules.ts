/**
 * 业务规则常量
 *
 * 统一管理领域层中使用的业务规则常量，包括验证规则、业务约束等。
 * 提供类型安全的业务规则定义和验证。
 *
 * @description 领域层业务规则常量定义
 * @example
 * ```typescript
 * import { BusinessRules } from './business-rules.js';
 *
 * if (name.length > BusinessRules.MAX_NAME_LENGTH) {
 *   throw new BusinessRuleViolationException(
 *     `名称长度不能超过${BusinessRules.MAX_NAME_LENGTH}个字符`,
 *     ErrorCodes.VALIDATION_FAILED
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 */

/**
 * 业务规则常量
 *
 * @description 定义所有领域层业务规则常量
 */
export const BusinessRules = {
  // 名称长度限制
  MAX_NAME_LENGTH: 100,
  MIN_NAME_LENGTH: 1,

  // 描述长度限制
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_DESCRIPTION_LENGTH: 1,

  // 邮箱长度限制
  MAX_EMAIL_LENGTH: 254,
  MIN_EMAIL_LENGTH: 5,

  // 电话号码长度限制
  MAX_PHONE_LENGTH: 16,
  MIN_PHONE_LENGTH: 8,

  // 密码长度限制
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,

  // 组织层级限制
  MAX_ORGANIZATION_LEVEL: 10,
  MIN_ORGANIZATION_LEVEL: 1,

  // 部门层级限制
  MAX_DEPARTMENT_LEVEL: 5,
  MIN_DEPARTMENT_LEVEL: 1,

  // 用户配额限制
  MAX_USERS_PER_TENANT: 10000,
  MAX_ORGANIZATIONS_PER_TENANT: 100,

  // 权限级别限制
  MAX_PERMISSION_LEVEL: 10,
  MIN_PERMISSION_LEVEL: 1,

  // 角色数量限制
  MAX_ROLES_PER_USER: 10,
  MAX_PERMISSIONS_PER_ROLE: 100,

  // 事件数量限制
  MAX_EVENTS_PER_AGGREGATE: 1000,

  // 审计信息长度限制
  MAX_AUDIT_REASON_LENGTH: 200,
  MAX_AUDIT_OPERATION_LENGTH: 50,
} as const;

/**
 * 业务规则验证器
 *
 * @description 提供业务规则的验证和类型检查功能
 */
export class BusinessRuleValidator {
  /**
   * 验证名称长度
   *
   * @param name 名称
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validateNameLength("测试名称");
   * console.log(isValid); // true
   * ```
   */
  static validateNameLength(name: string): boolean {
    return (
      name.length >= BusinessRules.MIN_NAME_LENGTH &&
      name.length <= BusinessRules.MAX_NAME_LENGTH
    );
  }

  /**
   * 验证邮箱长度
   *
   * @param email 邮箱
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validateEmailLength("test@example.com");
   * console.log(isValid); // true
   * ```
   */
  static validateEmailLength(email: string): boolean {
    return (
      email.length >= BusinessRules.MIN_EMAIL_LENGTH &&
      email.length <= BusinessRules.MAX_EMAIL_LENGTH
    );
  }

  /**
   * 验证电话号码长度
   *
   * @param phone 电话号码
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validatePhoneLength("13800138000");
   * console.log(isValid); // true
   * ```
   */
  static validatePhoneLength(phone: string): boolean {
    return (
      phone.length >= BusinessRules.MIN_PHONE_LENGTH &&
      phone.length <= BusinessRules.MAX_PHONE_LENGTH
    );
  }

  /**
   * 验证密码长度
   *
   * @param password 密码
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validatePasswordLength("password123");
   * console.log(isValid); // true
   * ```
   */
  static validatePasswordLength(password: string): boolean {
    return (
      password.length >= BusinessRules.MIN_PASSWORD_LENGTH &&
      password.length <= BusinessRules.MAX_PASSWORD_LENGTH
    );
  }

  /**
   * 验证组织层级
   *
   * @param level 组织层级
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validateOrganizationLevel(5);
   * console.log(isValid); // true
   * ```
   */
  static validateOrganizationLevel(level: number): boolean {
    return (
      level >= BusinessRules.MIN_ORGANIZATION_LEVEL &&
      level <= BusinessRules.MAX_ORGANIZATION_LEVEL
    );
  }

  /**
   * 验证部门层级
   *
   * @param level 部门层级
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validateDepartmentLevel(3);
   * console.log(isValid); // true
   * ```
   */
  static validateDepartmentLevel(level: number): boolean {
    return (
      level >= BusinessRules.MIN_DEPARTMENT_LEVEL &&
      level <= BusinessRules.MAX_DEPARTMENT_LEVEL
    );
  }

  /**
   * 验证权限级别
   *
   * @param level 权限级别
   * @returns 验证结果
   * @example
   * ```typescript
   * const isValid = BusinessRuleValidator.validatePermissionLevel(5);
   * console.log(isValid); // true
   * ```
   */
  static validatePermissionLevel(level: number): boolean {
    return (
      level >= BusinessRules.MIN_PERMISSION_LEVEL &&
      level <= BusinessRules.MAX_PERMISSION_LEVEL
    );
  }
}
