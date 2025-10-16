/**
 * 手机号值对象
 *
 * @description 业务特定的手机号值对象，包含验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * - 支持中国大陆手机号格式
 * - 支持国际手机号格式
 * - 自动格式化显示
 * - 验证手机号真实性（可选）
 *
 * @example
 * ```typescript
 * const phoneNumber = PhoneNumber.create('13812345678');
 * console.log(phoneNumber.value); // '13812345678'
 * ```
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/business-core";

export class PhoneNumber extends BaseValueObject<string> {
  /**
   * 中国大陆手机号正则表达式
   */
  private static readonly CHINA_MOBILE_REGEX = /^1[3-9]\d{9}$/;

  /**
   * 国际手机号正则表达式
   */
  private static readonly INTERNATIONAL_MOBILE_REGEX = /^\+[1-9]\d{1,14}$/;

  /**
   * 验证手机号格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "手机号");

    // 清理输入，移除空格和特殊字符
    const cleaned = value.replace(/[\s\-\(\)]/g, "");

    if (
      !PhoneNumber.CHINA_MOBILE_REGEX.test(cleaned) &&
      !PhoneNumber.INTERNATIONAL_MOBILE_REGEX.test(cleaned)
    ) {
      throw new Error("手机号格式不正确，支持中国大陆手机号或国际手机号格式");
    }
  }

  /**
   * 转换手机号（清理格式）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    // 移除所有空格和特殊字符
    return value.replace(/[\s\-\(\)]/g, "");
  }

  /**
   * 检查是否为中国大陆手机号
   *
   * @returns 是否为中国大陆手机号
   */
  public isChinaMobile(): boolean {
    return PhoneNumber.CHINA_MOBILE_REGEX.test(this.value);
  }

  /**
   * 检查是否为国际手机号
   *
   * @returns 是否为国际手机号
   */
  public isInternationalMobile(): boolean {
    return PhoneNumber.INTERNATIONAL_MOBILE_REGEX.test(this.value);
  }

  /**
   * 获取格式化的手机号
   *
   * @returns 格式化的手机号
   */
  public getFormatted(): string {
    if (this.isChinaMobile()) {
      // 中国大陆手机号格式化：138 1234 5678
      return this.value.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
    } else if (this.isInternationalMobile()) {
      // 国际手机号格式化：+86 138 1234 5678
      const countryCode = this.value.substring(0, 3);
      const number = this.value.substring(3);
      return `${countryCode} ${number}`;
    }

    return this.value;
  }

  /**
   * 获取手机号的国家代码
   *
   * @returns 国家代码
   */
  public getCountryCode(): string | null {
    if (this.isChinaMobile()) {
      return "+86";
    } else if (this.isInternationalMobile()) {
      const match = this.value.match(/^\+(\d{1,3})/);
      return match ? `+${match[1]}` : null;
    }

    return null;
  }

  /**
   * 获取手机号的运营商信息（仅中国大陆）
   *
   * @returns 运营商信息
   */
  public getCarrier(): string | null {
    if (!this.isChinaMobile()) {
      return null;
    }

    const prefix = this.value.substring(0, 3);
    const carriers: Record<string, string> = {
      "130": "中国联通",
      "131": "中国联通",
      "132": "中国联通",
      "133": "中国电信",
      "134": "中国移动",
      "135": "中国移动",
      "136": "中国移动",
      "137": "中国移动",
      "138": "中国移动",
      "139": "中国移动",
      "150": "中国联通",
      "151": "中国联通",
      "152": "中国联通",
      "153": "中国电信",
      "155": "中国联通",
      "156": "中国联通",
      "157": "中国移动",
      "158": "中国移动",
      "159": "中国移动",
      "180": "中国电信",
      "181": "中国电信",
      "182": "中国移动",
      "183": "中国移动",
      "184": "中国移动",
      "185": "中国联通",
      "186": "中国联通",
      "187": "中国移动",
      "188": "中国移动",
      "189": "中国电信",
    };

    return carriers[prefix] || "未知运营商";
  }
}
