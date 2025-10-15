/**
 * 租户代码值对象
 *
 * @description 封装租户代码的验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 长度：3-20字符
 * - 格式：小写字母+数字+连字符
 * - 唯一性：全局唯一（由应用层验证）
 *
 * ### 验证规则
 * - 不能为空
 * - 必须符合长度要求
 * - 必须匹配正则表达式
 * - 不能使用保留词
 *
 * ## 使用场景
 *
 * 租户代码用于：
 * - 租户的唯一标识（业务层面）
 * - 租户子域名生成
 * - 租户URL路径标识
 *
 * @example
 * ```typescript
 * // 创建租户代码（使用继承的 create 方法）
 * const code = TenantCode.create('acme2024');
 *
 * // 获取原始值（使用继承的 value 属性）
 * console.log(code.value); // 'acme2024'
 *
 * // 验证租户代码
 * if (TenantCode.isValid('invalid CODE')) {
 *   // 不会执行，因为包含大写和空格
 * }
 * ```
 *
 * @class TenantCode
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/hybrid-archi";
import { TENANT_CODE_VALIDATION } from "../../../constants/tenant.constants";

export class TenantCode extends BaseValueObject<string> {
  /**
   * 系统保留的租户代码
   */
  private static readonly RESERVED_CODES = [
    "admin",
    "api",
    "www",
    "system",
    "platform",
    "support",
    "help",
  ];

  /**
   * 验证租户代码
   *
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    // 使用继承的验证辅助方法
    this.validateNotEmpty(value, "租户代码");
    this.validateLength(
      value,
      TENANT_CODE_VALIDATION.MIN_LENGTH,
      TENANT_CODE_VALIDATION.MAX_LENGTH,
      "租户代码",
    );
    this.validatePattern(
      value,
      TENANT_CODE_VALIDATION.PATTERN,
      "租户代码只能包含小写字母、数字和连字符",
    );

    // 租户特定的验证规则
    if (value.startsWith("-") || value.endsWith("-")) {
      throw new Error("租户代码不能以连字符开头或结尾");
    }

    if (value.includes("--")) {
      throw new Error("租户代码不能包含连续的连字符");
    }

    // 保留词检查
    if (TenantCode.RESERVED_CODES.includes(value.toLowerCase())) {
      throw new Error(`租户代码不能使用系统保留词: ${value}`);
    }
  }

  /**
   * 转换租户代码（标准化为小写）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 验证租户代码是否有效
   *
   * @static
   * @param code 租户代码
   * @returns {boolean} 是否有效
   */
  public static isValid(code: string): boolean {
    try {
      TenantCode.create(code);
      return true;
    } catch {
      return false;
    }
  }
}
