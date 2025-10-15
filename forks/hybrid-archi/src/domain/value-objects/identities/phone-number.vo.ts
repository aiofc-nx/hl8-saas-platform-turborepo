/**
 * 电话号码值对象
 *
 * @description 通用的电话号码值对象，包含格式验证
 *
 * ## 业务规则
 *
 * - 支持国际格式：+86 1234567890
 * - 长度：8-15 字符（不含 + 和空格）
 * - 格式：+ 国家代码 + 号码
 * - 自动去除空格和连字符
 *
 * @example
 * ```typescript
 * const phone = PhoneNumber.create('+86 138-1234-5678');
 * console.log(phone.value); // '+8613812345678'
 * console.log(phone.getCountryCode()); // '86'
 * ```
 *
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "../base-value-object";

export class PhoneNumber extends BaseValueObject<string> {
  /**
   * 验证电话号码格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "电话号码");

    // 移除空格和连字符后的长度验证
    const cleanValue = value.replace(/[\s-]/g, "");
    if (cleanValue.length < 8 || cleanValue.length > 16) {
      throw new Error("电话号码长度必须在8-16个字符之间");
    }

    // 格式验证（支持国际格式）
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleanValue)) {
      throw new Error(`电话号码格式无效: ${value}`);
    }
  }

  /**
   * 转换电话号码（移除空格和连字符）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.replace(/[\s-]/g, "").trim();
  }

  /**
   * 获取国家代码
   *
   * @returns {string | null} 国家代码，如果没有则返回 null
   */
  public getCountryCode(): string | null {
    if (!this.value.startsWith("+")) {
      return null;
    }
    // 提取 + 后的1-3位数字作为国家代码
    const match = this.value.match(/^\+(\d{1,3})/);
    return match ? match[1] : null;
  }

  /**
   * 获取号码部分（不含国家代码）
   *
   * @returns {string} 号码部分
   */
  public getNumber(): string {
    const countryCode = this.getCountryCode();
    if (countryCode) {
      return this.value.substring(countryCode.length + 1);
    }
    return this.value;
  }
}
