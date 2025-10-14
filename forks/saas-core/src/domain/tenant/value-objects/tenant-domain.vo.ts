/**
 * 租户域名值对象
 *
 * @description 封装租户域名的验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 符合域名规范
 * - 小写字母、数字、连字符、点
 * - 唯一性：全局唯一（由应用层验证）
 *
 * ### 验证规则
 * - 不能为空
 * - 必须符合域名格式
 * - 长度合理（3-253字符）
 *
 * ## 使用场景
 *
 * 租户域名用于：
 * - 租户的独立访问域名
 * - 租户的子域名标识
 * - 租户的品牌展示
 *
 * @example
 * ```typescript
 * // 创建租户域名（使用继承的 create 方法）
 * const domain = TenantDomain.create('acme.example.com');
 *
 * // 获取原始值（使用继承的 value 属性）
 * console.log(domain.value); // 'acme.example.com'
 *
 * // 验证租户域名
 * if (TenantDomain.isValid('invalid domain')) {
 *   // 不会执行，因为包含空格
 * }
 * ```
 *
 * @class TenantDomain
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from '@hl8/hybrid-archi';
import { TENANT_DOMAIN_VALIDATION } from '../../../constants/tenant.constants';

export class TenantDomain extends BaseValueObject<string> {
  /**
   * 验证租户域名
   *
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    // 使用继承的验证辅助方法
    this.validateNotEmpty(value, '租户域名');
    this.validateLength(
      value,
      TENANT_DOMAIN_VALIDATION.MIN_LENGTH,
      TENANT_DOMAIN_VALIDATION.MAX_LENGTH,
      '租户域名'
    );
    this.validatePattern(
      value,
      TENANT_DOMAIN_VALIDATION.PATTERN,
      '租户域名格式不正确，只能包含小写字母、数字、连字符和点'
    );

    // 租户特定的验证规则
    if (value.startsWith('.') || value.endsWith('.')) {
      throw new Error('租户域名不能以点开头或结尾');
    }

    if (value.startsWith('-') || value.endsWith('-')) {
      throw new Error('租户域名不能以连字符开头或结尾');
    }

    if (value.includes('..')) {
      throw new Error('租户域名不能包含连续的点');
    }

    // 验证每个标签（由点分隔的部分）
    const labels = value.split('.');
    for (const label of labels) {
      if (label.length === 0) {
        throw new Error('租户域名不能包含空标签');
      }
      if (label.length > 63) {
        throw new Error('租户域名的每个标签长度不能超过63个字符');
      }
    }
  }

  /**
   * 转换租户域名（标准化为小写）
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * 验证租户域名是否有效
   *
   * @static
   * @param domain 租户域名
   * @returns {boolean} 是否有效
   */
  public static isValid(domain: string): boolean {
    try {
      TenantDomain.create(domain);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取顶级域名
   *
   * @returns {string} 顶级域名（TLD）
   *
   * @example
   * ```typescript
   * const domain = TenantDomain.create('app.example.com');
   * console.log(domain.getTLD()); // 'com'
   * ```
   */
  public getTLD(): string {
    const parts = this._value.split('.');
    return parts[parts.length - 1];
  }

  /**
   * 获取二级域名
   *
   * @returns {string} 二级域名（SLD）
   *
   * @example
   * ```typescript
   * const domain = TenantDomain.create('app.example.com');
   * console.log(domain.getSLD()); // 'example'
   * ```
   */
  public getSLD(): string {
    const parts = this._value.split('.');
    if (parts.length < 2) {
      throw new Error('无效的域名格式，无法获取二级域名');
    }
    return parts[parts.length - 2];
  }

  /**
   * 获取子域名
   *
   * @returns {string | null} 子域名，如果没有则返回 null
   *
   * @example
   * ```typescript
   * const domain = TenantDomain.create('app.example.com');
   * console.log(domain.getSubdomain()); // 'app'
   * ```
   */
  public getSubdomain(): string | null {
    const parts = this._value.split('.');
    if (parts.length <= 2) {
      return null;
    }
    return parts.slice(0, -2).join('.');
  }

  /**
   * 检查是否为子域名
   *
   * @returns {boolean} 是否为子域名
   *
   * @example
   * ```typescript
   * const domain1 = TenantDomain.create('app.example.com');
   * const domain2 = TenantDomain.create('example.com');
   * console.log(domain1.isSubdomain()); // true
   * console.log(domain2.isSubdomain()); // false
   * ```
   */
  public isSubdomain(): boolean {
    return this._value.split('.').length > 2;
  }

  /**
   * 获取根域名（不包含子域名）
   *
   * @returns {string} 根域名
   *
   * @example
   * ```typescript
   * const domain = TenantDomain.create('app.tenant.example.com');
   * console.log(domain.getRootDomain()); // 'example.com'
   * ```
   */
  public getRootDomain(): string {
    const parts = this._value.split('.');
    if (parts.length <= 2) {
      return this._value;
    }
    return parts.slice(-2).join('.');
  }
}
