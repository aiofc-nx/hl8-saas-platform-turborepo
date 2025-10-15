/**
 * 通用描述值对象
 *
 * @description 用于各种描述字段的抽象基类
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 长度：0-500字符（可选字段）
 * - 允许为空字符串
 * - 自动去除首尾空格
 *
 * ### 验证规则
 * - 长度必须在规定范围内
 * - 允许为空字符串（与 Name 不同）
 *
 * ## 使用场景
 *
 * 任何需要描述信息的场景：
 * - 组织描述
 * - 部门说明
 * - 角色描述
 * - 产品描述
 * - 备注信息
 *
 * @example
 * ```typescript
 * // 子类继承并自定义长度
 * export class RoleDescription extends Description {
 *   constructor(value: string) {
 *     super(value, 0, 200);  // 角色描述最多200字符
 *   }
 * }
 *
 * export class ProductDescription extends Description {
 *   constructor(value: string) {
 *     super(value, 0, 1000);  // 产品描述最多1000字符
 *   }
 * }
 *
 * // 使用
 * const desc = RoleDescription.create('负责系统的日常管理和维护工作');
 * console.log(desc.value); // '负责系统的日常管理和维护工作'
 *
 * // 允许空描述
 * const emptyDesc = RoleDescription.create('');
 * console.log(emptyDesc.isEmpty()); // true
 * ```
 *
 * @abstract
 * @class Description
 * @extends {BaseValueObject<string>}
 * @since 1.1.0
 */

import { BaseValueObject } from "../base-value-object";

export abstract class Description extends BaseValueObject<string> {
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
   * @param value 描述值
   * @param minLength 最小长度，默认为 0（允许为空）
   * @param maxLength 最大长度，默认为 500
   */
  constructor(value: string, minLength = 0, maxLength = 500) {
    super(value);
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  /**
   * 验证描述
   *
   * @description 验证描述长度合法（允许为空）
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    // 允许为空字符串
    if (value.length > 0) {
      this.validateLength(value, this.minLength, this.maxLength, "描述");
    }
  }

  /**
   * 转换描述
   *
   * @description 去除首尾空格
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.trim();
  }
}
