/**
 * 权限动作枚举
 *
 * @description 定义系统中所有权限动作的枚举值
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
 * import { PermissionAction } from './permission-action.enum.js';
 *
 * // 检查动作
 * console.log(PermissionAction.CREATE); // "CREATE"
 * console.log(PermissionActionUtils.isCreateAction(PermissionAction.CREATE)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum PermissionAction {
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
 * 权限动作工具类
 *
 * @description 提供权限动作相关的工具方法
 */
export class PermissionActionUtils {
  /**
   * 动作层级映射
   */
  private static readonly ACTION_HIERARCHY: Record<PermissionAction, number> = {
    [PermissionAction.MANAGE]: 10,
    [PermissionAction.ASSIGN]: 9,
    [PermissionAction.APPROVE]: 8,
    [PermissionAction.CREATE]: 7,
    [PermissionAction.UPDATE]: 6,
    [PermissionAction.DELETE]: 5,
    [PermissionAction.EXECUTE]: 4,
    [PermissionAction.EXPORT]: 3,
    [PermissionAction.IMPORT]: 2,
    [PermissionAction.READ]: 1,
  };

  /**
   * 动作描述映射
   */
  private static readonly ACTION_DESCRIPTIONS: Record<
    PermissionAction,
    string
  > = {
    [PermissionAction.CREATE]: "创建",
    [PermissionAction.READ]: "读取",
    [PermissionAction.UPDATE]: "更新",
    [PermissionAction.DELETE]: "删除",
    [PermissionAction.EXECUTE]: "执行",
    [PermissionAction.MANAGE]: "管理",
    [PermissionAction.ASSIGN]: "分配",
    [PermissionAction.APPROVE]: "审批",
    [PermissionAction.EXPORT]: "导出",
    [PermissionAction.IMPORT]: "导入",
  };

  /**
   * 检查是否为创建动作
   *
   * @param action - 权限动作
   * @returns 是否为创建动作
   * @example
   * ```typescript
   * const isCreate = PermissionActionUtils.isCreateAction(PermissionAction.CREATE);
   * console.log(isCreate); // true
   * ```
   */
  static isCreateAction(action: PermissionAction): boolean {
    return action === PermissionAction.CREATE;
  }

  /**
   * 检查是否为读取动作
   *
   * @param action - 权限动作
   * @returns 是否为读取动作
   */
  static isReadAction(action: PermissionAction): boolean {
    return action === PermissionAction.READ;
  }

  /**
   * 检查是否为更新动作
   *
   * @param action - 权限动作
   * @returns 是否为更新动作
   */
  static isUpdateAction(action: PermissionAction): boolean {
    return action === PermissionAction.UPDATE;
  }

  /**
   * 检查是否为删除动作
   *
   * @param action - 权限动作
   * @returns 是否为删除动作
   */
  static isDeleteAction(action: PermissionAction): boolean {
    return action === PermissionAction.DELETE;
  }

  /**
   * 检查是否为执行动作
   *
   * @param action - 权限动作
   * @returns 是否为执行动作
   */
  static isExecuteAction(action: PermissionAction): boolean {
    return action === PermissionAction.EXECUTE;
  }

  /**
   * 检查是否为管理动作
   *
   * @param action - 权限动作
   * @returns 是否为管理动作
   */
  static isManageAction(action: PermissionAction): boolean {
    return action === PermissionAction.MANAGE;
  }

  /**
   * 检查是否为分配动作
   *
   * @param action - 权限动作
   * @returns 是否为分配动作
   */
  static isAssignAction(action: PermissionAction): boolean {
    return action === PermissionAction.ASSIGN;
  }

  /**
   * 检查是否为审批动作
   *
   * @param action - 权限动作
   * @returns 是否为审批动作
   */
  static isApproveAction(action: PermissionAction): boolean {
    return action === PermissionAction.APPROVE;
  }

  /**
   * 检查是否为导出动作
   *
   * @param action - 权限动作
   * @returns 是否为导出动作
   */
  static isExportAction(action: PermissionAction): boolean {
    return action === PermissionAction.EXPORT;
  }

  /**
   * 检查是否为导入动作
   *
   * @param action - 权限动作
   * @returns 是否为导入动作
   */
  static isImportAction(action: PermissionAction): boolean {
    return action === PermissionAction.IMPORT;
  }

  /**
   * 检查权限动作是否高于指定动作
   *
   * @param action1 - 动作1
   * @param action2 - 动作2
   * @returns 动作1是否高于动作2
   */
  static hasHigherPermission(
    action1: PermissionAction,
    action2: PermissionAction,
  ): boolean {
    return this.ACTION_HIERARCHY[action1] > this.ACTION_HIERARCHY[action2];
  }

  /**
   * 检查权限动作是否等于或高于指定动作
   *
   * @param action1 - 动作1
   * @param action2 - 动作2
   * @returns 动作1是否等于或高于动作2
   */
  static hasPermissionOrHigher(
    action1: PermissionAction,
    action2: PermissionAction,
  ): boolean {
    return this.ACTION_HIERARCHY[action1] >= this.ACTION_HIERARCHY[action2];
  }

  /**
   * 获取动作描述
   *
   * @param action - 权限动作
   * @returns 动作描述
   */
  static getDescription(action: PermissionAction): string {
    return this.ACTION_DESCRIPTIONS[action] || "未知权限动作";
  }

  /**
   * 获取所有动作
   *
   * @returns 所有动作数组
   */
  static getAllActions(): PermissionAction[] {
    return Object.values(PermissionAction);
  }

  /**
   * 获取基础动作（创建、读取、更新、删除）
   *
   * @returns 基础动作数组
   */
  static getBasicActions(): PermissionAction[] {
    return [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ];
  }
}
