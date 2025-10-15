/**
 * 通用域名值对象
 *
 * @description 用于域名字段验证的抽象基类
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 符合域名规范（小写字母、数字、点、连字符）
 * - 必须包含至少一个点和顶级域名
 * - 自动转换为小写
 *
 * ### 验证规则
 * - 不能为空
 * - 必须符合域名格式
 * - 顶级域名至少2个字符
 *
 * ## 使用场景
 *
 * 任何需要域名验证的场景：
 * - 租户域名
 * - 邮箱域名
 * - API 域名
 * - Webhook 域名
 *
 * @example
 * ```typescript
 * // 子类继承并添加特定验证
 * export class TenantDomain extends Domain {
 *   protected override validate(value: string): void {
 *     super.validate(value);  // 通用验证
 *     
 *     // 租户特定验证
 *     this.validateLength(value, 3, 253, '租户域名');
 *     
 *     // 检查是否为子域名
 *     if (value.split('.').length > 4) {
 *       throw new Error('子域名层级不能超过4级');
 *     }
 *   }
 * }
 *
 * // 使用
 * const domain = TenantDomain.create('tenant.example.com');
 * console.log(domain.value); // 'tenant.example.com'
 * ```
 *
 * @abstract
 * @class Domain
 * @extends {BaseValueObject<string>}
 * @since 1.1.0
 */

import { BaseValueObject } from '../base-value-object.js';

export abstract class Domain extends BaseValueObject<string> {
  /**
   * 验证域名格式
   *
   * @description 验证域名符合标准格式
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, '域名');
    this.validatePattern(
      value,
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/,
      '域名格式不正确'
    );
  }

  /**
   * 转换域名为小写
   *
   * @description 自动将输入转换为小写并去除首尾空格
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }
}

