/**
 * 权限动作值对象
 *
 * @description 封装权限动作的验证逻辑和业务规则
 *
 * ## 业务规则
 * - 标准动作：CREATE, READ, UPDATE, DELETE, EXECUTE
 * - 必须是预定义的动作之一
 * - 不可为空
 *
 * @example
 * ```typescript
 * const action = PermissionAction.create('READ');
 * const createAction = PermissionAction.create();
 * ```
 *
 * @class PermissionAction
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/business-core/index.js";

/**
 * 权限动作类型
 */
export type PermissionActionValue =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXECUTE";

/**
 * 所有允许的权限动作
 */
const ALLOWED_ACTIONS: readonly PermissionActionValue[] = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXECUTE",
] as const;

export class PermissionAction extends BaseValueObject<PermissionActionValue> {
  /**
   * 验证权限动作
   *
   * @protected
   */
  protected validate(value: PermissionActionValue): void {
    (this as any).validateNotEmpty(value, "权限动作");
    (this as any).validateEnum(
      value,
      ALLOWED_ACTIONS as unknown as string[],
      "权限动作",
    );
  }

  // ============ 静态工厂方法 ============

  /**
   * 创建创建权限
   */
  public static createAction(): PermissionAction {
    return (PermissionAction as any).create("CREATE");
  }

  /**
   * 创建读取权限
   */
  public static readAction(): PermissionAction {
    return (PermissionAction as any).create("READ");
  }

  /**
   * 创建更新权限
   */
  public static updateAction(): PermissionAction {
    return (PermissionAction as any).create("UPDATE");
  }

  /**
   * 创建删除权限
   */
  public static deleteAction(): PermissionAction {
    return (PermissionAction as any).create("DELETE");
  }

  /**
   * 创建执行权限
   */
  public static executeAction(): PermissionAction {
    return (PermissionAction as any).create("EXECUTE");
  }

  // ============ 类型检查方法 ============

  /**
   * 是否为创建权限
   */
  public isCreate(): boolean {
    return (this as any)._value === "CREATE";
  }

  /**
   * 是否为读取权限
   */
  public isRead(): boolean {
    return (this as any)._value === "READ";
  }

  /**
   * 是否为更新权限
   */
  public isUpdate(): boolean {
    return (this as any)._value === "UPDATE";
  }

  /**
   * 是否为删除权限
   */
  public isDelete(): boolean {
    return (this as any)._value === "DELETE";
  }

  /**
   * 是否为执行权限
   */
  public isExecute(): boolean {
    return (this as any)._value === "EXECUTE";
  }

  /**
   * 是否为写权限（CREATE, UPDATE, DELETE）
   */
  public isWriteAction(): boolean {
    return this.isCreate() || this.isUpdate() || this.isDelete();
  }

  /**
   * 验证权限动作是否有效
   */
  public static isValid(action: string): boolean {
    try {
      (PermissionAction as any).create(action as PermissionActionValue);
      return true;
    } catch {
      return false;
    }
  }
}
