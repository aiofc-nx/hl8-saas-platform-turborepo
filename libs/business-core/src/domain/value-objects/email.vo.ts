/**
 * 邮箱值对象
 *
 * @description 表示邮箱地址的值对象，包含格式验证和业务规则
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { BusinessRuleManager } from "../rules/business-rule-manager.js";
import { BusinessRuleFactory } from "../rules/business-rule-factory.js";
import { EmailValidator } from "../validators/common/email.validator.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { InvalidEmailException } from "../exceptions/validation-exceptions.js";

/**
 * 邮箱值对象
 *
 * @description 封装邮箱地址，提供格式验证和业务规则检查
 */
export class Email extends BaseValueObject<string> {
  private _ruleManager: BusinessRuleManager;
  private _exceptionFactory: ExceptionFactory;

  /**
   * 构造函数
   *
   * @param value - 邮箱地址
   */
  constructor(value: string) {
    super(value);
    this._ruleManager = BusinessRuleFactory.createEmailManager();
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.validate();
  }

  /**
   * 验证邮箱格式
   *
   * @param value - 邮箱地址
   */
  protected validate(value: string): void {
    // 使用验证器进行格式验证
    const validatorResult = EmailValidator.validateFormat(value);
    if (!validatorResult.isValid) {
      throw this._exceptionFactory.createInvalidEmail(value);
    }
    
    // 使用业务规则进行业务逻辑验证
    const ruleResult = this._ruleManager.validateRule('EMAIL_FORMAT_RULE', value);
    if (!ruleResult.isValid) {
      throw this._exceptionFactory.createInvalidEmail(value);
    }
  }

  /**
   * 转换邮箱地址
   *
   * @param value - 原始邮箱地址
   * @returns 转换后的邮箱地址
   */
  protected transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 获取业务规则管理器
   *
   * @returns 业务规则管理器
   */
  getRuleManager(): BusinessRuleManager {
    return this._ruleManager;
  }

  /**
   * 验证邮箱格式（静态方法）
   *
   * @param email - 邮箱地址
   * @returns 验证结果
   */
  static validateFormat(email: string): { isValid: boolean; errorMessage?: string } {
    const ruleManager = BusinessRuleFactory.createEmailManager();
    const result = ruleManager.validateRule('EMAIL_FORMAT_RULE', email);
    return {
      isValid: result.isValid,
      errorMessage: result.errorMessage,
    };
  }

  /**
   * 创建邮箱值对象
   *
   * @param value - 邮箱地址
   * @returns 邮箱值对象
   */
  static create(value: string): Email {
    return new Email(value);
  }

  /**
   * 获取邮箱的域名部分
   *
   * @returns 域名
   */
  getDomain(): string {
    const parts = this._value.split('@');
    return parts.length > 1 ? parts[1] : '';
  }

  /**
   * 获取邮箱的用户名部分
   *
   * @returns 用户名
   */
  getUsername(): string {
    const parts = this._value.split('@');
    return parts.length > 0 ? parts[0] : '';
  }

  /**
   * 检查是否为特定域名的邮箱
   *
   * @param domain - 域名
   * @returns 是否为指定域名
   */
  isFromDomain(domain: string): boolean {
    return this.getDomain().toLowerCase() === domain.toLowerCase();
  }

  /**
   * 获取邮箱的字符串表示
   *
   * @returns 邮箱地址字符串
   */
  toString(): string {
    return this._value;
  }
}
