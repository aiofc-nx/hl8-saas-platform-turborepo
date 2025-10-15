/**
 * 租户代码值对象
 *
 * @description 封装租户代码的验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 租户代码规则
 * - 长度：3-20 字符
 * - 格式：字母、数字、连字符
 * - 不能以数字开头
 * - 不能使用系统保留词
 * - 自动转换为小写
 * - 全局唯一性
 *
 * @example
 * ```typescript
 * const tenantCode = TenantCode.create('acme-2024');
 * console.log(tenantCode.value); // 'acme-2024'
 * ```
 *
 * @class TenantCode
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/hybrid-archi/index.js";

export class TenantCode extends BaseValueObject<string> {
  /**
   * 系统保留租户代码
   */
  private static readonly RESERVED_CODES = [
    "admin",
    "system",
    "root",
    "api",
    "www",
    "app",
    "web",
    "mobile",
    "test",
    "demo",
    "dev",
    "staging",
    "prod",
    "production",
    "main",
    "master",
    "default",
    "public",
    "internal",
    "external",
  ];

  /**
   * 验证租户代码格式
   *
   * @protected
   */
  protected validate(value: string): void {
    (this as any).validateNotEmpty(value, "租户代码");
    (this as any).validateLength(value, 3, 20, "租户代码");

    (this as any).validatePattern(
      value,
      /^[a-zA-Z0-9-]+$/,
      "租户代码只能包含字母、数字和连字符",
    );

    if (/^[0-9]/.test(value)) {
      throw new Error("租户代码不能以数字开头");
    }

    if (value.startsWith("-") || value.endsWith("-")) {
      throw new Error("租户代码不能以连字符开头或结尾");
    }

    if (TenantCode.RESERVED_CODES.includes(value.toLowerCase())) {
      throw new Error(`租户代码不能使用系统保留词: ${value}`);
    }

    // 检查连续连字符
    if (value.includes("--")) {
      throw new Error("租户代码不能包含连续的连字符");
    }
  }

  /**
   * 转换租户代码（标准化为小写）
   *
   * @protected
   * @override
   */
  protected transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 生成建议的租户代码
   *
   * @description 基于组织名称生成建议的租户代码
   * @param organizationName - 组织名称
   * @returns 建议的租户代码
   */
  public static generateFromName(organizationName: string): string {
    // 移除特殊字符，保留字母和数字
    const cleaned = organizationName.replace(/[^a-zA-Z0-9\s]/g, "");

    // 转换为小写并用连字符连接
    const words = cleaned
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length === 0) {
      throw new Error("组织名称不能为空或只包含特殊字符");
    }

    // 取前3个单词，每个单词最多10个字符
    const limitedWords = words.slice(0, 3).map((word) => word.substring(0, 10));
    let suggested = limitedWords.join("-");

    // 确保长度在限制范围内
    if (suggested.length > 20) {
      suggested = suggested.substring(0, 20);
      // 如果截断后以连字符结尾，移除最后的连字符
      if (suggested.endsWith("-")) {
        suggested = suggested.slice(0, -1);
      }
    }

    // 确保不以数字开头
    if (/^[0-9]/.test(suggested)) {
      suggested = "tenant-" + suggested;
    }

    return suggested;
  }

  /**
   * 验证租户代码是否可用
   *
   * @description 检查租户代码是否未被使用且符合规则
   * @param code - 租户代码
   * @returns 是否可用
   */
  public static isValid(code: string): boolean {
    try {
      (TenantCode as any).create(code);
      return true;
    } catch {
      return false;
    }
  }
}
