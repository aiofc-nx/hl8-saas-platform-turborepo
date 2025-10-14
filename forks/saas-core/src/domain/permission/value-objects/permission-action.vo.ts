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

import { BaseValueObject } from '@hl8/hybrid-archi';

/**
 * 权限动作类型
 */
export type PermissionActionValue = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'EXECUTE';

/**
 * 所有允许的权限动作
 */
const ALLOWED_ACTIONS: readonly PermissionActionValue[] = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'EXECUTE',
] as const;

export class PermissionAction extends BaseValueObject<PermissionActionValue> {
  /**
   * 验证权限动作
   *
   * @protected
   * @override
   */
  protected override validate(value: PermissionActionValue): void {
    this.validateNotEmpty(value, '权限动作');
    this.validateEnum(
      value,
      ALLOWED_ACTIONS as unknown as string[],
      '权限动作'
    );
  }

  // ============ 静态工厂方法 ============

  /**
   * 创建创建权限
   */
  public static createAction(): PermissionAction {
    return PermissionAction.create('CREATE');
  }

  /**
   * 创建读取权限
   */
  public static readAction(): PermissionAction {
    return PermissionAction.create('READ');
  }

  /**
   * 创建更新权限
   */
  public static updateAction(): PermissionAction {
    return PermissionAction.create('UPDATE');
  }

  /**
   * 创建删除权限
   */
  public static deleteAction(): PermissionAction {
    return PermissionAction.create('DELETE');
  }

  /**
   * 创建执行权限
   */
  public static executeAction(): PermissionAction {
    return PermissionAction.create('EXECUTE');
  }

  // ============ 类型检查方法 ============

  /**
   * 是否为创建权限
   */
  public isCreate(): boolean {
    return this._value === 'CREATE';
  }

  /**
   * 是否为读取权限
   */
  public isRead(): boolean {
    return this._value === 'READ';
  }

  /**
   * 是否为更新权限
   */
  public isUpdate(): boolean {
    return this._value === 'UPDATE';
  }

  /**
   * 是否为删除权限
   */
  public isDelete(): boolean {
    return this._value === 'DELETE';
  }

  /**
   * 是否为执行权限
   */
  public isExecute(): boolean {
    return this._value === 'EXECUTE';
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
      PermissionAction.create(action as PermissionActionValue);
      return true;
    } catch {
      return false;
    }
  }
}
