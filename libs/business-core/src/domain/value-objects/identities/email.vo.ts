/**
 * 邮箱值对象
 *
 * @description 通用的邮箱值对象，包含 RFC 5322 标准验证
 *
 * ## 业务规则
 *
 * - 长度：1-254 字符
 * - 本地部分：最多64字符
 * - 必须包含 @ 符号
 * - 必须有有效的域名
 * - 自动转换为小写
 *
 * @example
 * ```typescript
 * const email = Email.create('Test@Example.com');
 * console.log(email.value); // 'test@example.com'
 * console.log(email.getDomain()); // 'example.com'
 * ```
 *
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "../base-value-object.js";
import { InvalidEmailException } from "../exceptions/value-object.exceptions.js";

export class Email extends BaseValueObject<string> {
  /**
   * 验证邮箱格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    try {
      this.validateNotEmpty(value, "邮箱");
      this.validateLength(value, 1, 254, "邮箱");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.validatePattern(value, emailRegex, `邮箱格式无效: ${value}`);

      const [localPart] = value.split("@");
      if (localPart.length > 64) {
        throw new InvalidEmailException("邮箱本地部分长度不能超过64个字符", value);
      }
    } catch (error) {
      if (error instanceof InvalidEmailException) {
        throw error;
      }
      throw new InvalidEmailException(error.message, value);
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
   * 获取邮箱域名
   *
   * @returns {string} 域名
   */
  public getDomain(): string {
    return this.value.split("@")[1];
  }

  /**
   * 获取邮箱本地部分
   *
   * @returns {string} 本地部分
   */
  public getLocalPart(): string {
    return this.value.split("@")[0];
  }
}

// 导出异常类
export { InvalidEmailException };
