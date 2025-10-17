/**
 * 电话号码值对象
 *
 * @description 表示电话号码的值对象，包含格式验证和业务规则
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { UsernameValidator } from "../validators/common/username.validator.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { InvalidPhoneNumberException } from "../exceptions/validation-exceptions.js";

/**
 * 电话号码值对象
 *
 * @description 封装电话号码，提供格式验证和业务规则检查
 */
export class PhoneNumber extends BaseValueObject<string> {
  private _exceptionFactory: ExceptionFactory;

  /**
   * 构造函数
   *
   * @param value - 电话号码
   */
  constructor(value: string) {
    super(value);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.validate();
  }

  /**
   * 验证电话号码格式
   *
   * @param value - 电话号码
   */
  protected validate(value: string): void {
    if (!value || !value.trim()) {
      throw this._exceptionFactory.createInvalidPhoneNumber(
        value,
        "电话号码不能为空",
      );
    }

    // 移除所有非数字字符
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.length < 7) {
      throw this._exceptionFactory.createInvalidPhoneNumber(
        value,
        "电话号码长度不能少于7位",
      );
    }

    if (digitsOnly.length > 15) {
      throw this._exceptionFactory.createInvalidPhoneNumber(
        value,
        "电话号码长度不能超过15位",
      );
    }

    // 使用验证器进行格式验证（电话号码作为用户名格式验证）
    const validatorResult = UsernameValidator.validateFormat(digitsOnly, {
      minLength: 7,
      maxLength: 15,
      allowNumbers: true,
      allowSpecialChars: false,
      checkReservedWords: false,
    });

    if (!validatorResult.isValid) {
      throw this._exceptionFactory.createInvalidPhoneNumber(
        value,
        validatorResult.errors.join(", "),
      );
    }
  }

  /**
   * 转换电话号码
   *
   * @param value - 原始电话号码
   * @returns 转换后的电话号码
   */
  protected transform(value: string): string {
    // 移除所有非数字字符，保留数字
    return value.replace(/\D/g, "");
  }

  /**
   * 创建电话号码值对象
   *
   * @param value - 电话号码
   * @returns 电话号码值对象
   */
  static create(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  /**
   * 获取格式化后的电话号码
   *
   * @param format - 格式化模式
   * @returns 格式化后的电话号码
   */
  getFormatted(format: "international" | "national" | "e164" = "e164"): string {
    const digits = this._value;

    switch (format) {
      case "international":
        return `+${digits}`;
      case "national":
        return digits;
      case "e164":
        return `+${digits}`;
      default:
        return digits;
    }
  }

  /**
   * 获取国家代码
   *
   * @returns 国家代码
   */
  getCountryCode(): string {
    const digits = this._value;
    if (digits.startsWith("86")) {
      return "86";
    }
    if (digits.startsWith("1")) {
      return "1";
    }
    return "";
  }

  /**
   * 检查是否为有效格式
   *
   * @param value - 电话号码
   * @returns 是否为有效格式
   */
  static isValid(value: string): boolean {
    try {
      new PhoneNumber(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取电话号码的字符串表示
   *
   * @returns 电话号码字符串
   */
  toString(): string {
    return this._value;
  }
}
