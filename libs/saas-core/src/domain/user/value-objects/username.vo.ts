/**
 * 用户名值对象
 *
 * @description 业务特定的用户名值对象，包含验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * - 长度：3-50 字符
 * - 格式：字母、数字、下划线、连字符、点号
 * - 不能以数字或点号开头
 * - 不能使用系统保留词
 * - 自动转换为小写
 * - 支持中文用户名
 *
 * @example
 * ```typescript
 * const username = Username.create('JohnDoe123');
 * console.log(username.value); // 'johndoe123'
 * ```
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/hybrid-archi";

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
    "test",
    "demo",
    "guest",
    "user",
    "account",
    "profile",
    "settings",
  ];

  /**
   * 验证用户名格式
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    this.validateNotEmpty(value, "用户名");
    this.validateLength(value, 3, 50, "用户名");

    // 支持中文、英文、数字、下划线、连字符、点号
    this.validatePattern(
      value,
      /^[\u4e00-\u9fa5a-zA-Z0-9_.-]+$/,
      "用户名只能包含中文、字母、数字、下划线、连字符和点号",
    );

    if (/^[0-9.]/.test(value)) {
      throw new Error("用户名不能以数字或点号开头");
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
