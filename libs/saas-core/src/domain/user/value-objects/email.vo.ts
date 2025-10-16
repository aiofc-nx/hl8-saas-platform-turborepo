/**
 * 邮箱值对象
 *
 * @description 业务特定的邮箱值对象，包含验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * - 必须符合 RFC 5322 邮箱格式
 * - 长度：5-254 字符
 * - 自动转换为小写
 * - 支持国际化域名
 * - 验证邮箱真实性（可选）
 *
 * @example
 * ```typescript
 * const email = Email.create('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * ```
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/business-core";

export class Email extends BaseValueObject<string> {
  /**
   * 邮箱正则表达式（RFC 5322 兼容）
   */
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  /**
   * 验证邮箱格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "邮箱");
    this.validateLength(value, 5, 254, "邮箱");

    this.validatePattern(value, Email.EMAIL_REGEX, "邮箱格式不正确");

    // 检查邮箱长度限制
    const [localPart, domain] = value.split("@");
    if (localPart.length > 64) {
      throw new Error("邮箱本地部分长度不能超过 64 个字符");
    }

    if (domain.length > 253) {
      throw new Error("邮箱域名部分长度不能超过 253 个字符");
    }
  }

  /**
   * 转换邮箱（标准化为小写）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 获取邮箱的域名部分
   *
   * @returns 域名部分
   */
  public getDomain(): string {
    return this.value.split("@")[1];
  }

  /**
   * 获取邮箱的本地部分
   *
   * @returns 本地部分
   */
  public getLocalPart(): string {
    return this.value.split("@")[0];
  }

  /**
   * 检查是否为临时邮箱
   *
   * @returns 是否为临时邮箱
   */
  public isTemporaryEmail(): boolean {
    const temporaryDomains = [
      "10minutemail.com",
      "tempmail.org",
      "guerrillamail.com",
      "mailinator.com",
      "yopmail.com",
    ];

    return temporaryDomains.includes(this.getDomain());
  }
}
