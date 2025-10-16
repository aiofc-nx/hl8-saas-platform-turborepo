/**
 * 密码值对象
 *
 * @description 通用的密码值对象，提供密码强度验证
 *
 * ## 业务规则
 *
 * - 长度：至少8个字符
 * - 必须包含大小写字母
 * - 必须包含数字
 * - 必须包含特殊字符
 * - 不能是常见弱密码
 *
 * @example
 * ```typescript
 * const password = Password.create('SecurePass123!');
 * console.log(password.value); // 密码哈希（实际场景）
 * ```
 *
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "../base-value-object.js";
import {
  InvalidPasswordException,
  WeakPasswordException,
} from "../exceptions/value-object.exceptions.js";

export class Password extends BaseValueObject<string> {
  /**
   * 常见弱密码列表
   */
  private static readonly WEAK_PASSWORDS = [
    "password",
    "12345678",
    "qwerty123",
    "abc123456",
  ];

  /**
   * 验证密码强度
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    try {
      this.validateNotEmpty(value, "密码");
      this.validateLength(value, 8, 128, "密码");

      // 强度验证
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      if (!hasUpper) {
        throw new WeakPasswordException("密码必须包含大写字母", value);
      }
      if (!hasLower) {
        throw new WeakPasswordException("密码必须包含小写字母", value);
      }
      if (!hasNumber) {
        throw new WeakPasswordException("密码必须包含数字", value);
      }
      if (!hasSpecial) {
        throw new WeakPasswordException("密码必须包含特殊字符", value);
      }

      // 弱密码检查
      if (Password.WEAK_PASSWORDS.includes(value.toLowerCase())) {
        throw new WeakPasswordException("不能使用常见弱密码", value);
      }
    } catch (error) {
      if (
        error instanceof InvalidPasswordException ||
        error instanceof WeakPasswordException
      ) {
        throw error;
      }
      throw new InvalidPasswordException(
        error instanceof Error ? error.message : String(error),
        value,
      );
    }
  }

  /**
   * 验证密码是否符合最低要求
   *
   * @param password 密码字符串
   * @returns {boolean} 是否符合要求
   */
  public static isValid(password: string): boolean {
    try {
      Password.create(password);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出异常类
export { InvalidPasswordException, WeakPasswordException };
