/**
 * 验证服务
 *
 * @description 结合验证器和业务规则，提供统一的验证服务
 * @since 1.0.0
 */

import { ValidatorManager } from "./validator-manager.js";
import { ValidatorFactory } from "./validator-factory.js";
import { BusinessRuleManager } from "../rules/business-rule-manager.js";
import { BusinessRuleFactory } from "../rules/business-rule-factory.js";
import { IValidationResult } from "./base-validator.interface.js";
import { IBusinessRuleValidationResult } from "../rules/base-business-rule.interface.js";

/**
 * 验证服务
 *
 * @description 结合验证器和业务规则，提供统一的验证服务
 */
export class ValidationService {
  private validatorManager: ValidatorManager;
  private businessRuleManager: BusinessRuleManager;

  constructor() {
    this.validatorManager =
      ValidatorFactory.getInstance().getValidatorManager();
    this.businessRuleManager = BusinessRuleFactory.createDefaultManager();
  }

  /**
   * 验证邮箱
   *
   * @param email - 邮箱地址
   * @param options - 验证选项
   * @returns 验证结果
   */
  validateEmail(
    email: string,
    options: EmailValidationOptions = {},
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // 使用验证器进行格式验证
    const validatorResult = this.validatorManager.validate("email", email);
    results.push({
      type: "validator",
      name: "email",
      result: validatorResult,
      passed: validatorResult.isValid,
    });

    // 使用业务规则进行业务逻辑验证
    const ruleResult = this.businessRuleManager.validateRule(
      "EMAIL_FORMAT_RULE",
      email,
    );
    results.push({
      type: "business_rule",
      name: "EMAIL_FORMAT_RULE",
      result: {
        isValid: ruleResult.isValid,
        errors: ruleResult.errorMessage ? [ruleResult.errorMessage] : [],
        context: { value: email },
      },
      passed: ruleResult.isValid,
    });

    // 域名白名单验证
    if (options.allowedDomains && options.allowedDomains.length > 0) {
      const { EmailValidator } = require("./common/email.validator.js");
      const domainResult = EmailValidator.validateDomainWhitelist(
        email,
        options.allowedDomains,
      );
      results.push({
        type: "validator",
        name: "email_domain_whitelist",
        result: {
          isValid: domainResult.isValid,
          errors: domainResult.error ? [domainResult.error] : [],
          context: { value: email, allowedDomains: options.allowedDomains },
        },
        passed: domainResult.isValid,
      });
    }

    // 域名黑名单验证
    if (options.blockedDomains && options.blockedDomains.length > 0) {
      const { EmailValidator } = require("./common/email.validator.js");
      const domainResult = EmailValidator.validateDomainBlacklist(
        email,
        options.blockedDomains,
      );
      results.push({
        type: "validator",
        name: "email_domain_blacklist",
        result: {
          isValid: domainResult.isValid,
          errors: domainResult.error ? [domainResult.error] : [],
          context: { value: email, blockedDomains: options.blockedDomains },
        },
        passed: domainResult.isValid,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const allErrors = results.flatMap((r) => r.result.errors);

    return {
      isValid: allPassed,
      errors: allErrors,
      context: { value: email, results },
      passed: allPassed,
      failed: !allPassed,
      results,
    };
  }

  /**
   * 验证密码
   *
   * @param password - 密码
   * @param options - 验证选项
   * @returns 验证结果
   */
  validatePassword(
    password: string,
    options: PasswordValidationOptions = {},
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // 使用验证器进行格式验证
    const validatorResult = this.validatorManager.validate(
      "password",
      password,
    );
    results.push({
      type: "validator",
      name: "password",
      result: validatorResult,
      passed: validatorResult.isValid,
    });

    // 使用业务规则进行业务逻辑验证
    const ruleResult = this.businessRuleManager.validateRule(
      "PASSWORD_STRENGTH_RULE",
      password,
    );
    results.push({
      type: "business_rule",
      name: "PASSWORD_STRENGTH_RULE",
      result: {
        isValid: ruleResult.isValid,
        errors: ruleResult.errorMessage ? [ruleResult.errorMessage] : [],
        context: { value: password },
      },
      passed: ruleResult.isValid,
    });

    // 密码历史验证
    if (options.passwordHistory && options.passwordHistory.length > 0) {
      const { PasswordValidator } = require("./common/password.validator.js");
      const historyResult = PasswordValidator.validatePasswordHistory(
        password,
        options.passwordHistory,
        options.maxHistoryCount || 5,
      );
      results.push({
        type: "validator",
        name: "password_history",
        result: {
          isValid: historyResult.isValid,
          errors: historyResult.error ? [historyResult.error] : [],
          context: {
            value: password,
            historyCount: options.passwordHistory.length,
          },
        },
        passed: historyResult.isValid,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const allErrors = results.flatMap((r) => r.result.errors);

    return {
      isValid: allPassed,
      errors: allErrors,
      context: { value: password, results },
      passed: allPassed,
      failed: !allPassed,
      results,
    };
  }

  /**
   * 验证用户名
   *
   * @param username - 用户名
   * @param options - 验证选项
   * @returns 验证结果
   */
  validateUsername(
    username: string,
    options: UsernameValidationOptions = {},
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // 使用验证器进行格式验证
    const validatorResult = this.validatorManager.validate(
      "username",
      username,
    );
    results.push({
      type: "validator",
      name: "username",
      result: validatorResult,
      passed: validatorResult.isValid,
    });

    // 使用业务规则进行业务逻辑验证
    const ruleResult = this.businessRuleManager.validateRule(
      "USERNAME_FORMAT_RULE",
      username,
    );
    results.push({
      type: "business_rule",
      name: "USERNAME_FORMAT_RULE",
      result: {
        isValid: ruleResult.isValid,
        errors: ruleResult.errorMessage ? [ruleResult.errorMessage] : [],
        context: { value: username },
      },
      passed: ruleResult.isValid,
    });

    // 唯一性验证
    if (options.existingUsernames && options.existingUsernames.length > 0) {
      const { UsernameValidator } = require("./common/username.validator.js");
      const uniquenessResult = UsernameValidator.validateUniqueness(
        username,
        options.existingUsernames,
        options.caseSensitive || false,
      );
      results.push({
        type: "validator",
        name: "username_uniqueness",
        result: {
          isValid: uniquenessResult.isValid,
          errors: uniquenessResult.error ? [uniquenessResult.error] : [],
          context: {
            value: username,
            existingCount: options.existingUsernames.length,
          },
        },
        passed: uniquenessResult.isValid,
      });
    }

    const allPassed = results.every((r) => r.passed);
    const allErrors = results.flatMap((r) => r.result.errors);

    return {
      isValid: allPassed,
      errors: allErrors,
      context: { value: username, results },
      passed: allPassed,
      failed: !allPassed,
      results,
    };
  }

  /**
   * 验证租户名称
   *
   * @param name - 租户名称
   * @param options - 验证选项
   * @returns 验证结果
   */
  validateTenantName(
    name: string,
    options: TenantNameValidationOptions = {},
  ): ValidationResult {
    const results: ValidationResult[] = [];

    // 使用验证器进行格式验证
    const validatorResult = this.validatorManager.validate("username", name);
    results.push({
      type: "validator",
      name: "tenant_name",
      result: validatorResult,
      passed: validatorResult.isValid,
    });

    // 使用业务规则进行业务逻辑验证
    const ruleResult = this.businessRuleManager.validateRule(
      "TENANT_NAME_RULE",
      name,
    );
    results.push({
      type: "business_rule",
      name: "TENANT_NAME_RULE",
      result: {
        isValid: ruleResult.isValid,
        errors: ruleResult.errorMessage ? [ruleResult.errorMessage] : [],
        context: { value: name },
      },
      passed: ruleResult.isValid,
    });

    const allPassed = results.every((r) => r.passed);
    const allErrors = results.flatMap((r) => r.result.errors);

    return {
      isValid: allPassed,
      errors: allErrors,
      context: { value: name, results },
      passed: allPassed,
      failed: !allPassed,
      results,
    };
  }

  /**
   * 获取验证器管理器
   *
   * @returns 验证器管理器
   */
  getValidatorManager(): ValidatorManager {
    return this.validatorManager;
  }

  /**
   * 获取业务规则管理器
   *
   * @returns 业务规则管理器
   */
  getBusinessRuleManager(): BusinessRuleManager {
    return this.businessRuleManager;
  }
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  context?: Record<string, unknown>;
  passed: boolean;
  failed: boolean;
  results: ValidationResultDetail[];
}

/**
 * 验证结果详情
 */
export interface ValidationResultDetail {
  type: "validator" | "business_rule";
  name: string;
  result: IValidationResult | IBusinessRuleValidationResult;
  passed: boolean;
}

/**
 * 邮箱验证选项
 */
export interface EmailValidationOptions {
  allowedDomains?: string[];
  blockedDomains?: string[];
}

/**
 * 密码验证选项
 */
export interface PasswordValidationOptions {
  passwordHistory?: string[];
  maxHistoryCount?: number;
}

/**
 * 用户名验证选项
 */
export interface UsernameValidationOptions {
  existingUsernames?: string[];
  caseSensitive?: boolean;
}

/**
 * 租户名称验证选项
 */
export interface TenantNameValidationOptions {
  // 租户名称验证选项
}
