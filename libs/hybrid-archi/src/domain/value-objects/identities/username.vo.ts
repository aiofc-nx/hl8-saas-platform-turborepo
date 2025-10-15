/**
 * 用户名值对象
 *
 * @description 通用的用户名值对象，包含验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * - 长度：3-20 字符
 * - 格式：字母、数字、下划线、连字符
 * - 不能以数字开头
 * - 不能使用系统保留词
 * - 自动转换为小写
 *
 * @example
 * ```typescript
 * const username = Username.create('JohnDoe123');
 * console.log(username.value); // 'johndoe123'
 * ```
 *
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "../base-value-object";

export class Username extends BaseValueObject<string> {
  /**
   * 系统保留用户名
   */
  private static readonly RESERVED_NAMES = [
    "admin",
    "administrator",
    "root",
    "system",
    "api",
    "www",
    "support",
    "help",
  ];

  /**
   * 验证用户名格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "用户名");
    this.validateLength(value, 3, 20, "用户名");

    this.validatePattern(
      value,
      /^[a-zA-Z0-9_-]+$/,
      "用户名只能包含字母、数字、下划线和连字符",
    );

    if (/^[0-9]/.test(value)) {
      throw new Error("用户名不能以数字开头");
    }

    if (Username.RESERVED_NAMES.includes(value.toLowerCase())) {
      throw new Error(`用户名不能使用系统保留词: ${value}`);
    }
  }

  /**
   * 转换用户名（标准化为小写）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }
}
