/**
 * 通用代码值对象
 *
 * @description 用于各种代码字段（租户代码、产品代码、订单代码等）的抽象基类
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 只能包含小写字母、数字和连字符
 * - 自动转换为小写
 * - 不能为空
 *
 * ### 验证规则
 * - 不能为空
 * - 必须符合代码格式
 *
 * ## 使用场景
 *
 * 任何需要代码标识的场景：
 * - 租户代码
 * - 产品代码
 * - 订单号
 * - 优惠码
 *
 * @example
 * ```typescript
 * // 子类继承并添加特定验证
 * export class TenantCode extends Code {
 *   protected override validate(value: string): void {
 *     super.validate(value);  // 通用验证
 *     
 *     // 租户特定验证
 *     this.validateLength(value, 3, 20, '租户代码');
 *     
 *     const reserved = ['admin', 'api', 'www', 'system'];
 *     if (reserved.includes(value)) {
 *       throw new Error('租户代码不能使用保留词');
 *     }
 *   }
 * }
 *
 * // 使用
 * const code = TenantCode.create('my-tenant');
 * console.log(code.value); // 'my-tenant'
 * ```
 *
 * @abstract
 * @class Code
 * @extends {BaseValueObject<string>}
 * @since 1.1.0
 */

import { BaseValueObject } from '../base-value-object';

export abstract class Code extends BaseValueObject<string> {
  /**
   * 验证代码格式
   *
   * @description 验证代码只包含小写字母、数字和连字符
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, '代码');
    this.validatePattern(
      value,
      /^[a-z0-9-]+$/,
      '代码只能包含小写字母、数字和连字符'
    );
  }

  /**
   * 转换代码为小写
   *
   * @description 自动将输入转换为小写并去除首尾空格
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }
}

