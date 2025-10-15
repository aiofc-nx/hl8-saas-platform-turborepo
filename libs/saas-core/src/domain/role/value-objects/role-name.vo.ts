/**
 * 角色名称值对象
 *
 * @description 封装角色名称的验证逻辑
 *
 * ## 业务规则
 * - 长度：2-50字符
 * - 不能为空
 * - 支持中英文、数字、下划线
 *
 * @example
 * ```typescript
 * const roleName = RoleName.create('系统管理员');
 * console.log(roleName.value); // '系统管理员'
 * ```
 *
 * @class RoleName
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/hybrid-archi";

export class RoleName extends BaseValueObject<string> {
  /**
   * 验证角色名称
   *
   * @protected
   * @override
   */
  protected validate(value: string): void {
    (this as any).validateNotEmpty(value, "角色名称");
    (this as any).validateLength(value, 2, 50, "角色名称");
    (this as any).validatePattern(
      value,
      /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
      "角色名称只能包含中英文、数字和下划线",
    );
  }

  /**
   * 验证角色名称是否有效
   */
  public static isValid(name: string): boolean {
    try {
      (RoleName as any).create(name);
      return true;
    } catch {
      return false;
    }
  }
}
