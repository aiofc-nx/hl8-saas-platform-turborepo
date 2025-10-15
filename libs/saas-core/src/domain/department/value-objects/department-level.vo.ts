/**
 * 部门层级值对象
 *
 * @description 封装部门层级的验证逻辑和业务规则
 *
 * ## 业务规则
 * - 层级范围：1-6
 * - 1表示顶级部门
 * - 最深支持6级部门
 *
 * @example
 * ```typescript
 * const level = DepartmentLevel.create(1); // 顶级部门
 * const childLevel = level.nextLevel(); // 2级部门
 * ```
 *
 * @class DepartmentLevel
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/hybrid-archi/index.js";

export class DepartmentLevel extends BaseValueObject<number> {
  private static readonly MIN_LEVEL = 1;
  private static readonly MAX_LEVEL = 6;

  /**
   * 验证部门层级
   *
   * @protected
   */
  protected validate(value: number): void {
    (this as any).validateInteger(value, "部门层级");
    (this as any).validateRange(
      value,
      DepartmentLevel.MIN_LEVEL,
      DepartmentLevel.MAX_LEVEL,
      "部门层级",
    );
  }

  /**
   * 创建根级别（顶级部门）
   */
  public static root(): DepartmentLevel {
    return (DepartmentLevel as any).create(DepartmentLevel.MIN_LEVEL);
  }

  /**
   * 检查是否为顶级部门
   */
  public isTopLevel(): boolean {
    return (this as any)._value === DepartmentLevel.MIN_LEVEL;
  }

  /**
   * 检查是否已达最深层级
   */
  public isMaxLevel(): boolean {
    return (this as any)._value === DepartmentLevel.MAX_LEVEL;
  }

  /**
   * 获取下一层级
   */
  public nextLevel(): DepartmentLevel {
    if (this.isMaxLevel()) {
      throw new Error("已达到最大部门层级，无法创建子部门");
    }
    return (DepartmentLevel as any).create((this as any)._value + 1);
  }

  /**
   * 获取上一层级
   */
  public previousLevel(): DepartmentLevel {
    if (this.isTopLevel()) {
      throw new Error("已是顶级部门，没有上级层级");
    }
    return (DepartmentLevel as any).create((this as any)._value - 1);
  }

  /**
   * 检查是否可以创建子部门
   */
  public canCreateChild(): boolean {
    return !this.isMaxLevel();
  }

  /**
   * 获取数值级别（兼容旧API）
   */
  public get level(): number {
    return (this as any)._value;
  }

  /**
   * 验证部门层级是否有效
   */
  public static isValid(level: number): boolean {
    try {
      (DepartmentLevel as any).create(level);
      return true;
    } catch {
      return false;
    }
  }
}
