/**
 * 通用级别值对象
 *
 * @description 用于层级、等级字段的抽象基类
 *
 * ## 业务规则
 *
 * ### 格式要求
 * - 必须是整数
 * - 必须在指定的范围内
 * - 默认范围：1-10
 *
 * ### 验证规则
 * - 必须是整数
 * - 必须在最小值和最大值之间
 *
 * ## 使用场景
 *
 * 任何需要等级或层级的场景：
 * - 用户等级
 * - 部门层级
 * - 角色层级
 * - 权限级别
 *
 * @example
 * ```typescript
 * // 子类继承并设置特定范围
 * export class DepartmentLevel extends Level {
 *   constructor(value: number) {
 *     super(value, 1, 6);  // 部门最多6级
 *   }
 * }
 *
 * export class RoleLevel extends Level {
 *   constructor(value: number) {
 *     super(value, 1, 10);  // 角色最多10级
 *   }
 * }
 *
 * // 使用
 * const level = DepartmentLevel.create(3);
 * console.log(level.value); // 3
 * ```
 *
 * @abstract
 * @class Level
 * @extends {BaseValueObject<number>}
 * @since 1.1.0
 */

import { BaseValueObject } from '../base-value-object.js';

export abstract class Level extends BaseValueObject<number> {
  /**
   * 最小级别（子类可覆盖）
   */
  protected readonly minLevel: number;

  /**
   * 最大级别（子类可覆盖）
   */
  protected readonly maxLevel: number;

  /**
   * 构造函数
   *
   * @param value 级别值
   * @param minLevel 最小级别，默认为 1
   * @param maxLevel 最大级别，默认为 10
   */
  constructor(value: number, minLevel = 1, maxLevel = 10) {
    super(value);
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
  }

  /**
   * 验证级别
   *
   * @description 验证级别是整数且在范围内
   * @protected
   * @override
   */
  protected override validate(value: number): void {
    this.validateInteger(value, '级别');
    this.validateRange(value, this.minLevel, this.maxLevel, '级别');
  }

  /**
   * 检查是否为最小级别
   */
  public isMinLevel(): boolean {
    return this._value === this.minLevel;
  }

  /**
   * 检查是否为最大级别
   */
  public isMaxLevel(): boolean {
    return this._value === this.maxLevel;
  }

  /**
   * 获取下一个级别
   *
   * @throws {Error} 如果已经是最大级别
   */
  public nextLevel(): number {
    if (this.isMaxLevel()) {
      throw new Error(`已达到最大级别 ${this.maxLevel}`);
    }
    return this._value + 1;
  }

  /**
   * 获取上一个级别
   *
   * @throws {Error} 如果已经是最小级别
   */
  public previousLevel(): number {
    if (this.isMinLevel()) {
      throw new Error(`已是最小级别 ${this.minLevel}`);
    }
    return this._value - 1;
  }
}

