/**
 * 邮箱值对象
 *
 * @description 表示邮箱地址的值对象，包含格式验证和业务规则
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { BusinessRuleViolationException } from "../exceptions/base/base-domain-exception.js";

/**
 * 邮箱值对象
 *
 * @description 封装邮箱地址，提供格式验证和业务规则检查
 */
export class Email extends BaseValueObject<string> {
  /**
   * 构造函数
   *
   * @param value - 邮箱地址
   */
  constructor(value: string) {
    super(value);
  }

  /**
   * 验证邮箱格式
   *
   * @param value - 邮箱地址
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "邮箱");
    this.validateLength(value, 1, 254, "邮箱");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.validatePattern(value, emailRegex, `邮箱格式无效: ${value}`);

    const [localPart] = value.split("@");
    if (localPart.length > 64) {
      throw new BusinessRuleViolationException(
        "邮箱本地部分长度不能超过64个字符",
        "VALIDATION_FAILED",
      );
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
   * 验证邮箱格式（静态方法）
   *
   * @param email - 邮箱地址
   * @returns 验证结果
   */
  static validateFormat(email: string): {
    isValid: boolean;
    errorMessage?: string;
  } {
    try {
      new Email(email);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 获取邮箱的域名部分
   *
   * @returns 域名
   */
  getDomain(): string {
    const parts = this.value.split("@");
    return parts.length > 1 ? parts[1] : "";
  }

  /**
   * 获取邮箱的用户名部分
   *
   * @returns 用户名
   */
  getUsername(): string {
    const parts = this.value.split("@");
    return parts.length > 0 ? parts[0] : "";
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
    return this.value;
  }
}
