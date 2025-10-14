/**
 * 角色层级值对象
 *
 * @description 封装角色层级的验证逻辑和业务规则
 *
 * ## 业务规则
 * - 层级范围：1-10
 * - 数字越小权限越高
 * - 1表示最高层级（如超级管理员）
 * - 10表示最低层级（如普通用户）
 *
 * @example
 * ```typescript
 * const level = RoleLevel.create(1); // 最高层级
 * console.log(level.isHigherThan(RoleLevel.create(2))); // true
 * ```
 *
 * @class RoleLevel
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from '@hl8/hybrid-archi';

export class RoleLevel extends BaseValueObject<number> {
  private static readonly MIN_LEVEL = 1;
  private static readonly MAX_LEVEL = 10;

  /**
   * 验证角色层级
   *
   * @protected
   * @override
   */
  protected override validate(value: number): void {
    this.validateInteger(value, '角色层级');
    this.validateRange(
      value,
      RoleLevel.MIN_LEVEL,
      RoleLevel.MAX_LEVEL,
      '角色层级'
    );
  }

  /**
   * 检查是否比其他层级更高
   */
  public isHigherThan(other: RoleLevel): boolean {
    return this._value < other._value; // 数字越小权限越高
  }

  /**
   * 检查是否比其他层级更低
   */
  public isLowerThan(other: RoleLevel): boolean {
    return this._value > other._value;
  }

  /**
   * 检查是否为最高层级
   */
  public isTopLevel(): boolean {
    return this._value === RoleLevel.MIN_LEVEL;
  }

  /**
   * 检查是否为最低层级
   */
  public isBottomLevel(): boolean {
    return this._value === RoleLevel.MAX_LEVEL;
  }

  /**
   * 验证角色层级是否有效
   */
  public static isValid(level: number): boolean {
    try {
      RoleLevel.create(level);
      return true;
    } catch {
      return false;
    }
  }
}
