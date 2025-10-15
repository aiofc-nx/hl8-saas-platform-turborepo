/**
 * 租户域名值对象
 *
 * @description 封装租户域名的验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 域名规则
 * - 必须符合域名格式规范
 * - 支持子域名
 * - 自动转换为小写
 * - 全局唯一性
 * - 不能使用系统保留域名
 *
 * @example
 * ```typescript
 * const tenantDomain = TenantDomain.create('acme.example.com');
 * console.log(tenantDomain.value); // 'acme.example.com'
 * ```
 *
 * @class TenantDomain
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/hybrid-archi/index.js";

export class TenantDomain extends BaseValueObject<string> {
  /**
   * 域名正则表达式
   */
  private static readonly DOMAIN_REGEX =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  /**
   * 系统保留域名
   */
  private static readonly RESERVED_DOMAINS = [
    "localhost",
    "example.com",
    "test.com",
    "demo.com",
    "admin.com",
    "api.com",
    "app.com",
    "www.com",
    "mail.com",
    "ftp.com",
    "dev.com",
    "staging.com",
    "production.com",
  ];

  /**
   * 验证域名格式
   *
   * @protected
   */
  protected validate(value: string): void {
    (this as any).validateNotEmpty(value, "租户域名");
    (this as any).validateLength(value, 4, 253, "租户域名");

    (this as any).validatePattern(
      value,
      TenantDomain.DOMAIN_REGEX,
      "域名格式不正确",
    );

    // 检查是否以点开头或结尾
    if (value.startsWith(".") || value.endsWith(".")) {
      throw new Error("域名不能以点开头或结尾");
    }

    // 检查连续的点
    if (value.includes("..")) {
      throw new Error("域名不能包含连续的点");
    }

    // 检查是否为保留域名
    if (TenantDomain.RESERVED_DOMAINS.includes(value.toLowerCase())) {
      throw new Error(`域名不能使用系统保留域名: ${value}`);
    }

    // 检查顶级域名
    const parts = value.split(".");
    if (parts.length < 2) {
      throw new Error("域名必须包含顶级域名");
    }

    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      throw new Error("顶级域名长度不能少于2个字符");
    }

    // 检查每个部分的长度
    for (const part of parts) {
      if (part.length > 63) {
        throw new Error("域名各部分长度不能超过63个字符");
      }
      if (part.length === 0) {
        throw new Error("域名各部分不能为空");
      }
    }
  }

  /**
   * 转换域名（标准化为小写）
   *
   * @protected
   * @override
   */
  protected transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 获取主域名（去掉子域名）
   *
   * @returns 主域名
   */
  public getMainDomain(): string {
    const parts = (this as any).value.split(".");
    if (parts.length >= 2) {
      return parts.slice(-2).join(".");
    }
    return (this as any).value;
  }

  /**
   * 获取子域名部分
   *
   * @returns 子域名部分，如果没有则返回 null
   */
  public getSubdomain(): string | null {
    const parts = (this as any).value.split(".");
    if (parts.length > 2) {
      return parts.slice(0, -2).join(".");
    }
    return null;
  }

  /**
   * 获取顶级域名
   *
   * @returns 顶级域名
   */
  public getTopLevelDomain(): string {
    const parts = (this as any).value.split(".");
    return parts[parts.length - 1];
  }

  /**
   * 检查是否为子域名
   *
   * @returns 是否为子域名
   */
  public isSubdomain(): boolean {
    return (this as any).value.split(".").length > 2;
  }

  /**
   * 生成子域名
   *
   * @description 为指定域名生成子域名
   * @param subdomain - 子域名前缀
   * @returns 新的租户域名实例
   */
  public createSubdomain(subdomain: string): TenantDomain {
    if (!subdomain || subdomain.trim().length === 0) {
      throw new Error("子域名不能为空");
    }

    const cleanSubdomain = subdomain
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "");
    if (cleanSubdomain.length === 0) {
      throw new Error("子域名格式不正确");
    }

    const fullDomain = `${cleanSubdomain}.${(this as any).value}`;
    return (TenantDomain as any).create(fullDomain);
  }

  /**
   * 验证域名是否可用
   *
   * @description 检查域名是否符合规范且未被保留
   * @param domain - 域名
   * @returns 是否可用
   */
  public static isValid(domain: string): boolean {
    try {
      (TenantDomain as any).create(domain);
      return true;
    } catch {
      return false;
    }
  }
}
