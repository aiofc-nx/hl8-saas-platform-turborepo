/**
 * 通用名称值对象
 *
 * @description 用于各种名称字段的抽象基类
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 长度：2-100字符
 * - 不能为空
 * - 自动去除首尾空格
 *
 * ### 验证规则
 * - 不能为空
 * - 长度必须在规定范围内
 *
 * ## 使用场景
 *
 * 任何需要名称的场景：
 * - 用户名称
 * - 组织名称
 * - 部门名称
 * - 角色名称
 * - 产品名称
 *
 * @example
 * ```typescript
 * // 子类继承并添加特定验证
 * export class RoleName extends Name {
 *   protected override validate(value: string): void {
 *     super.validate(value);  // 通用验证
 *     
 *     // 角色特定验证
 *     this.validatePattern(
 *       value,
 *       /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
 *       '角色名称只能包含中英文、数字和下划线'
 *     );
 *   }
 * }
 *
 * // 使用
 * const name = RoleName.create('系统管理员');
 * console.log(name.value); // '系统管理员'
 * ```
 *
 * @abstract
 * @class Name
 * @extends {BaseValueObject<string>}
 * @since 1.1.0
 */

import { BaseValueObject } from '../base-value-object.js';

export abstract class Name extends BaseValueObject<string> {
  /**
   * 最小长度（子类可覆盖）
   */
  protected readonly minLength: number;

  /**
   * 最大长度（子类可覆盖）
   */
  protected readonly maxLength: number;

  /**
   * 构造函数
   *
   * @param value 名称值
   * @param minLength 最小长度，默认为 2
   * @param maxLength 最大长度，默认为 100
   */
  constructor(value: string, minLength = 2, maxLength = 100) {
    super(value);
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  /**
   * 验证名称
   *
   * @description 验证名称不为空且长度合法
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, '名称');
    this.validateLength(value, this.minLength, this.maxLength, '名称');
  }

  /**
   * 转换名称
   *
   * @description 去除首尾空格
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.trim();
  }
}

