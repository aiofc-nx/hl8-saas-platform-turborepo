import { BaseValueObject } from "../base-value-object.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { InvalidDepartmentLevelException } from "../../exceptions/validation-exceptions.js";

/**
 * 部门层级值对象
 *
 * @description 定义部门层级的枚举和业务规则，支持最多8层的部门嵌套结构。
 * 部门层级决定了部门的权限范围、管理层次和业务规则。
 *
 * ## 业务规则
 *
 * ### 部门层级定义
 * - 支持1-8层的部门嵌套结构
 * - 每个层级都有明确的权限范围
 * - 层级越高，权限范围越大
 * - 层级越低，管理粒度越细
 *
 * ### 层级关系规则
 * - 部门必须属于某个父级部门（除根部门外）
 * - 部门层级不能超过8层
 * - 部门层级不能为负数或零
 * - 部门层级必须连续（不能跳跃）
 *
 * ### 权限规则
 * - 高层级部门可以管理低层级部门
 * - 低层级部门不能管理高层级部门
 * - 同级部门之间相互独立
 * - 跨层级操作需要特殊权限
 *
 * @example
 * ```typescript
 * // 创建一级部门
 * const level1 = DepartmentLevel.create(1);
 * console.log(level1.value); // 1
 *
 * // 验证部门层级
 * const isValid = DepartmentLevel.isValid(1);
 * console.log(isValid); // true
 *
 * // 获取所有层级
 * const allLevels = DepartmentLevel.getAllLevels();
 * console.log(allLevels); // [1, 2, 3, 4, 5, 6, 7, 8]
 * ```
 *
 * @since 1.0.0
 */
export class DepartmentLevel extends BaseValueObject<number> {
  private _exceptionFactory: ExceptionFactory;
  /** 一级部门 - 最高层级 */
  static readonly LEVEL_1 = 1;

  /** 二级部门 */
  static readonly LEVEL_2 = 2;

  /** 三级部门 */
  static readonly LEVEL_3 = 3;

  /** 四级部门 */
  static readonly LEVEL_4 = 4;

  /** 五级部门 */
  static readonly LEVEL_5 = 5;

  /** 六级部门 */
  static readonly LEVEL_6 = 6;

  /** 七级部门 */
  static readonly LEVEL_7 = 7;

  /** 八级部门 - 最低层级 */
  static readonly LEVEL_8 = 8;

  /**
   * 验证部门层级
   *
   * @protected
   * @override
   */
  protected override validate(value: number): void {
    if (!this._exceptionFactory) {
      this._exceptionFactory = ExceptionFactory.getInstance();
    }
    
    if (!Number.isInteger(value)) {
      throw this._exceptionFactory.createInvalidDepartmentLevel(value, "部门层级必须是整数");
    }
    if (value < 1 || value > 8) {
      throw this._exceptionFactory.createInvalidDepartmentLevel(value, "部门层级必须在1-8之间");
    }
  }

  /**
   * 获取部门层级描述
   *
   * @description 根据部门层级返回对应的中文描述
   *
   * @returns 部门层级描述
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(1);
   * console.log(level.getDescription()); // "一级部门"
   * ```
   */
  getDescription(): string {
    const descriptions: Record<number, string> = {
      1: "一级部门",
      2: "二级部门",
      3: "三级部门",
      4: "四级部门",
      5: "五级部门",
      6: "六级部门",
      7: "七级部门",
      8: "八级部门",
    };

    return descriptions[this.value] || "未知层级";
  }

  /**
   * 获取部门层级权限范围
   *
   * @description 根据部门层级返回对应的权限范围
   *
   * @returns 权限范围描述
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(1);
   * console.log(level.getPermissionScope()); // "全局管理权限"
   * ```
   */
  getPermissionScope(): string {
    const scopes: Record<number, string> = {
      1: "全局管理权限",
      2: "大范围管理权限",
      3: "中范围管理权限",
      4: "小范围管理权限",
      5: "局部管理权限",
      6: "小组管理权限",
      7: "个人管理权限",
      8: "基础操作权限",
    };

    return scopes[this.value] || "未知权限范围";
  }

  /**
   * 获取所有部门层级
   *
   * @description 返回所有支持的部门层级列表
   *
   * @returns 所有部门层级数组
   *
   * @example
   * ```typescript
   * const allLevels = DepartmentLevel.getAllLevels();
   * console.log(allLevels); // [1, 2, 3, 4, 5, 6, 7, 8]
   * ```
   */
  static getAllLevels(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }

  /**
   * 比较部门层级高低
   *
   * @description 比较两个部门层级的权限高低
   *
   * @param other - 另一个部门层级
   * @returns 比较结果（-1: 当前权限更低, 0: 权限相等, 1: 当前权限更高）
   *
   * @example
   * ```typescript
   * const level1 = DepartmentLevel.create(1);
   * const level2 = DepartmentLevel.create(2);
   * const result = level1.compareLevels(level2);
   * console.log(result); // 1 (一级部门权限更高)
   * ```
   */
  compareLevels(other: DepartmentLevel): number {
    if (this.value < other.value) return 1; // 数字越小，权限越高
    if (this.value > other.value) return -1;
    return 0;
  }

  /**
   * 检查部门层级是否为高层级
   *
   * @description 判断部门层级是否为高层级（1-3级）
   *
   * @returns 是否为高层级
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(1);
   * console.log(level.isHighLevel()); // true
   * ```
   */
  isHighLevel(): boolean {
    return this.value >= 1 && this.value <= 3;
  }

  /**
   * 检查部门层级是否为中层级
   *
   * @description 判断部门层级是否为中层级（4-6级）
   *
   * @returns 是否为中层级
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(4);
   * console.log(level.isMediumLevel()); // true
   * ```
   */
  isMediumLevel(): boolean {
    return this.value >= 4 && this.value <= 6;
  }

  /**
   * 检查部门层级是否为低层级
   *
   * @description 判断部门层级是否为低层级（7-8级）
   *
   * @returns 是否为低层级
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(8);
   * console.log(level.isLowLevel()); // true
   * ```
   */
  isLowLevel(): boolean {
    return this.value >= 7 && this.value <= 8;
  }

  /**
   * 获取部门层级的父级层级
   *
   * @description 根据当前层级获取父级层级
   *
   * @returns 父级层级，如果没有父级则返回null
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(2);
   * console.log(level.getParentLevel()); // 1
   * ```
   */
  getParentLevel(): number | null {
    if (this.value === 1) {
      return null; // 一级部门没有父级
    }
    return this.value - 1;
  }

  /**
   * 获取部门层级的子级层级
   *
   * @description 根据当前层级获取子级层级
   *
   * @returns 子级层级，如果没有子级则返回null
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(7);
   * console.log(level.getChildLevel()); // 8
   * ```
   */
  getChildLevel(): number | null {
    if (this.value === 8) {
      return null; // 八级部门没有子级
    }
    return this.value + 1;
  }

  /**
   * 检查部门层级是否可以管理另一个层级
   *
   * @description 判断一个部门层级是否可以管理另一个部门层级
   *
   * @param targetLevel - 目标层级
   * @returns 是否可以管理
   *
   * @example
   * ```typescript
   * const managerLevel = DepartmentLevel.create(1);
   * const targetLevel = DepartmentLevel.create(3);
   * const canManage = managerLevel.canManage(targetLevel);
   * console.log(canManage); // true
   * ```
   */
  canManage(targetLevel: DepartmentLevel): boolean {
    return this.value < targetLevel.value; // 层级数字越小，权限越高
  }

  /**
   * 获取部门层级的最大子级数量
   *
   * @description 根据部门层级返回可以创建的最大子级数量
   *
   * @returns 最大子级数量
   *
   * @example
   * ```typescript
   * const level = DepartmentLevel.create(1);
   * console.log(level.getMaxChildren()); // 7 (可以创建2-8级部门)
   * ```
   */
  getMaxChildren(): number {
    return 8 - this.value;
  }

  /**
   * 验证部门层级是否有效
   *
   * @description 检查给定的数字是否为有效的部门层级
   *
   * @param level - 要验证的层级数字
   * @returns 是否为有效层级
   *
   * @example
   * ```typescript
   * const isValid = DepartmentLevel.isValid(1);
   * console.log(isValid); // true
   *
   * const isInvalid = DepartmentLevel.isValid(9);
   * console.log(isInvalid); // false
   * ```
   */
  static isValid(level: number): boolean {
    return Number.isInteger(level) && level >= 1 && level <= 8;
  }
}
