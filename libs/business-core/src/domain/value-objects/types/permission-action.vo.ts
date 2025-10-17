/**
 * 权限动作值对象
 *
 * @description 定义权限的动作枚举和验证逻辑
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../base-value-object.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { InvalidPermissionActionException } from "../../exceptions/validation-exceptions.js";

/**
 * 权限动作枚举
 */
export enum PermissionActionValue {
  /** 创建 */
  CREATE = "CREATE",
  /** 读取 */
  READ = "READ",
  /** 更新 */
  UPDATE = "UPDATE",
  /** 删除 */
  DELETE = "DELETE",
  /** 执行 */
  EXECUTE = "EXECUTE",
  /** 管理 */
  MANAGE = "MANAGE",
  /** 分配 */
  ASSIGN = "ASSIGN",
  /** 审批 */
  APPROVE = "APPROVE",
  /** 导出 */
  EXPORT = "EXPORT",
  /** 导入 */
  IMPORT = "IMPORT",
}

/**
 * 权限动作值对象
 *
 * @description 表示权限的动作，决定用户可以执行的具体操作
 *
 * ## 业务规则
 *
 * ### 权限动作规则
 * - 创建：创建新资源的权限
 * - 读取：查看资源的权限
 * - 更新：修改资源的权限
 * - 删除：删除资源的权限
 * - 执行：执行特定操作的权限
 * - 管理：管理资源的权限（包含所有操作）
 * - 分配：分配权限给其他用户的权限
 * - 审批：审批流程的权限
 * - 导出：导出数据的权限
 * - 导入：导入数据的权限
 *
 * ### 权限动作层级规则
 * - 管理权限包含所有其他权限
 * - 创建、更新、删除权限需要读取权限
 * - 分配权限需要管理权限
 * - 审批权限需要读取权限
 *
 * @example
 * ```typescript
 * // 创建权限动作
 * const action = PermissionAction.create('CREATE');
 * 
 * // 检查权限动作
 * console.log(action.isCreateAction()); // true
 * console.log(action.isManageAction()); // false
 * 
 * // 权限动作比较
 * const manageAction = PermissionAction.MANAGE;
 * console.log(action.hasHigherPermissionThan(manageAction)); // false
 * ```
 *
 * @since 1.0.0
 */
export class PermissionAction extends BaseValueObject<PermissionActionValue> {
  private _exceptionFactory: ExceptionFactory;
  /**
   * 创建动作
   */
  static get CREATE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.CREATE);
  }

  /**
   * 读取动作
   */
  static get READ(): PermissionAction {
    return new PermissionAction(PermissionActionValue.READ);
  }

  /**
   * 更新动作
   */
  static get UPDATE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.UPDATE);
  }

  /**
   * 删除动作
   */
  static get DELETE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.DELETE);
  }

  /**
   * 执行动作
   */
  static get EXECUTE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.EXECUTE);
  }

  /**
   * 管理动作
   */
  static get MANAGE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.MANAGE);
  }

  /**
   * 分配动作
   */
  static get ASSIGN(): PermissionAction {
    return new PermissionAction(PermissionActionValue.ASSIGN);
  }

  /**
   * 审批动作
   */
  static get APPROVE(): PermissionAction {
    return new PermissionAction(PermissionActionValue.APPROVE);
  }

  /**
   * 导出动作
   */
  static get EXPORT(): PermissionAction {
    return new PermissionAction(PermissionActionValue.EXPORT);
  }

  /**
   * 导入动作
   */
  static get IMPORT(): PermissionAction {
    return new PermissionAction(PermissionActionValue.IMPORT);
  }

  /**
   * 验证权限动作值
   *
   * @param value - 权限动作值
   * @protected
   */
  protected validate(value: PermissionActionValue): void {
    this.validateNotEmpty(value, "权限动作");
    const validActions = Object.values(PermissionActionValue);
    if (!validActions.includes(value)) {
      if (!this._exceptionFactory) {
        this._exceptionFactory = ExceptionFactory.getInstance();
      }
      throw this._exceptionFactory.createInvalidPermissionAction(value.toString());
    }
  }

  /**
   * 转换权限动作值
   *
   * @param value - 权限动作值
   * @returns 转换后的权限动作值
   * @protected
   */
  protected transform(value: PermissionActionValue): PermissionActionValue {
    return value;
  }

  /**
   * 检查是否为创建动作
   *
   * @returns 是否为创建动作
   */
  isCreateAction(): boolean {
    return this.value === PermissionActionValue.CREATE;
  }

  /**
   * 检查是否为读取动作
   *
   * @returns 是否为读取动作
   */
  isReadAction(): boolean {
    return this.value === PermissionActionValue.READ;
  }

  /**
   * 检查是否为更新动作
   *
   * @returns 是否为更新动作
   */
  isUpdateAction(): boolean {
    return this.value === PermissionActionValue.UPDATE;
  }

  /**
   * 检查是否为删除动作
   *
   * @returns 是否为删除动作
   */
  isDeleteAction(): boolean {
    return this.value === PermissionActionValue.DELETE;
  }

  /**
   * 检查是否为执行动作
   *
   * @returns 是否为执行动作
   */
  isExecuteAction(): boolean {
    return this.value === PermissionActionValue.EXECUTE;
  }

  /**
   * 检查是否为管理动作
   *
   * @returns 是否为管理动作
   */
  isManageAction(): boolean {
    return this.value === PermissionActionValue.MANAGE;
  }

  /**
   * 检查是否为分配动作
   *
   * @returns 是否为分配动作
   */
  isAssignAction(): boolean {
    return this.value === PermissionActionValue.ASSIGN;
  }

  /**
   * 检查是否为审批动作
   *
   * @returns 是否为审批动作
   */
  isApproveAction(): boolean {
    return this.value === PermissionActionValue.APPROVE;
  }

  /**
   * 检查是否为导出动作
   *
   * @returns 是否为导出动作
   */
  isExportAction(): boolean {
    return this.value === PermissionActionValue.EXPORT;
  }

  /**
   * 检查是否为导入动作
   *
   * @returns 是否为导入动作
   */
  isImportAction(): boolean {
    return this.value === PermissionActionValue.IMPORT;
  }

  /**
   * 检查权限动作是否高于指定动作
   *
   * @param otherAction - 其他权限动作
   * @returns 是否高于指定动作
   */
  hasHigherPermissionThan(otherAction: PermissionAction): boolean {
    const actionHierarchy = {
      [PermissionActionValue.MANAGE]: 10,
      [PermissionActionValue.ASSIGN]: 9,
      [PermissionActionValue.APPROVE]: 8,
      [PermissionActionValue.CREATE]: 7,
      [PermissionActionValue.UPDATE]: 6,
      [PermissionActionValue.DELETE]: 5,
      [PermissionActionValue.EXECUTE]: 4,
      [PermissionActionValue.EXPORT]: 3,
      [PermissionActionValue.IMPORT]: 2,
      [PermissionActionValue.READ]: 1,
    };

    return actionHierarchy[this.value] > actionHierarchy[otherAction.value];
  }

  /**
   * 检查权限动作是否等于或高于指定动作
   *
   * @param otherAction - 其他权限动作
   * @returns 是否等于或高于指定动作
   */
  hasPermissionOrHigher(otherAction: PermissionAction): boolean {
    const actionHierarchy = {
      [PermissionActionValue.MANAGE]: 10,
      [PermissionActionValue.ASSIGN]: 9,
      [PermissionActionValue.APPROVE]: 8,
      [PermissionActionValue.CREATE]: 7,
      [PermissionActionValue.UPDATE]: 6,
      [PermissionActionValue.DELETE]: 5,
      [PermissionActionValue.EXECUTE]: 4,
      [PermissionActionValue.EXPORT]: 3,
      [PermissionActionValue.IMPORT]: 2,
      [PermissionActionValue.READ]: 1,
    };

    return actionHierarchy[this.value] >= actionHierarchy[otherAction.value];
  }

  /**
   * 获取权限动作描述
   *
   * @returns 权限动作描述
   */
  getDescription(): string {
    const descriptions = {
      [PermissionActionValue.CREATE]: "创建",
      [PermissionActionValue.READ]: "读取",
      [PermissionActionValue.UPDATE]: "更新",
      [PermissionActionValue.DELETE]: "删除",
      [PermissionActionValue.EXECUTE]: "执行",
      [PermissionActionValue.MANAGE]: "管理",
      [PermissionActionValue.ASSIGN]: "分配",
      [PermissionActionValue.APPROVE]: "审批",
      [PermissionActionValue.EXPORT]: "导出",
      [PermissionActionValue.IMPORT]: "导入",
    };
    return descriptions[this.value] || "未知权限动作";
  }
}
