/**
 * 审计事件类型枚举
 *
 * @description 定义系统中所有审计事件类型的枚举值
 *
 * ## 业务规则
 *
 * ### 审计事件类型规则
 * - 用户登录：用户登录系统
 * - 用户登出：用户登出系统
 * - 用户创建：创建新用户
 * - 用户更新：更新用户信息
 * - 用户删除：删除用户
 * - 权限分配：分配权限给用户
 * - 权限撤销：撤销用户权限
 * - 数据访问：访问敏感数据
 * - 数据修改：修改敏感数据
 * - 系统配置：修改系统配置
 *
 * ### 审计事件记录规则
 * - 所有敏感操作都必须记录审计事件
 * - 审计事件必须包含操作者、操作时间、操作内容
 * - 审计事件必须包含操作前后的数据状态
 * - 审计事件必须包含操作结果和错误信息
 *
 * @example
 * ```typescript
 * import { AuditEventType } from './audit-event-type.enum.js';
 *
 * // 检查审计事件类型
 * console.log(AuditEventType.USER_LOGIN); // "USER_LOGIN"
 * console.log(AuditEventTypeUtils.isUserLogin(AuditEventType.USER_LOGIN)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum AuditEventType {
  /** 用户登录 */
  USER_LOGIN = "USER_LOGIN",
  /** 用户登出 */
  USER_LOGOUT = "USER_LOGOUT",
  /** 用户创建 */
  USER_CREATE = "USER_CREATE",
  /** 用户更新 */
  USER_UPDATE = "USER_UPDATE",
  /** 用户删除 */
  USER_DELETE = "USER_DELETE",
  /** 权限分配 */
  PERMISSION_ASSIGN = "PERMISSION_ASSIGN",
  /** 权限撤销 */
  PERMISSION_REVOKE = "PERMISSION_REVOKE",
  /** 数据访问 */
  DATA_ACCESS = "DATA_ACCESS",
  /** 数据修改 */
  DATA_MODIFY = "DATA_MODIFY",
  /** 系统配置 */
  SYSTEM_CONFIG = "SYSTEM_CONFIG",
}

/**
 * 审计事件类型工具类
 *
 * @description 提供审计事件类型相关的工具方法
 */
export class AuditEventTypeUtils {
  /**
   * 审计事件类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<AuditEventType, string> = {
    [AuditEventType.USER_LOGIN]: "用户登录",
    [AuditEventType.USER_LOGOUT]: "用户登出",
    [AuditEventType.USER_CREATE]: "用户创建",
    [AuditEventType.USER_UPDATE]: "用户更新",
    [AuditEventType.USER_DELETE]: "用户删除",
    [AuditEventType.PERMISSION_ASSIGN]: "权限分配",
    [AuditEventType.PERMISSION_REVOKE]: "权限撤销",
    [AuditEventType.DATA_ACCESS]: "数据访问",
    [AuditEventType.DATA_MODIFY]: "数据修改",
    [AuditEventType.SYSTEM_CONFIG]: "系统配置",
  };

  /**
   * 审计事件类型分类映射
   */
  private static readonly TYPE_CATEGORIES: Record<AuditEventType, string> = {
    [AuditEventType.USER_LOGIN]: "authentication",
    [AuditEventType.USER_LOGOUT]: "authentication",
    [AuditEventType.USER_CREATE]: "user_management",
    [AuditEventType.USER_UPDATE]: "user_management",
    [AuditEventType.USER_DELETE]: "user_management",
    [AuditEventType.PERMISSION_ASSIGN]: "permission_management",
    [AuditEventType.PERMISSION_REVOKE]: "permission_management",
    [AuditEventType.DATA_ACCESS]: "data_operation",
    [AuditEventType.DATA_MODIFY]: "data_operation",
    [AuditEventType.SYSTEM_CONFIG]: "system_management",
  };

  /**
   * 检查是否为用户登录
   *
   * @param type - 审计事件类型
   * @returns 是否为用户登录
   * @example
   * ```typescript
   * const isUserLogin = AuditEventTypeUtils.isUserLogin(AuditEventType.USER_LOGIN);
   * console.log(isUserLogin); // true
   * ```
   */
  static isUserLogin(type: AuditEventType): boolean {
    return type === AuditEventType.USER_LOGIN;
  }

  /**
   * 检查是否为用户登出
   *
   * @param type - 审计事件类型
   * @returns 是否为用户登出
   */
  static isUserLogout(type: AuditEventType): boolean {
    return type === AuditEventType.USER_LOGOUT;
  }

  /**
   * 检查是否为用户创建
   *
   * @param type - 审计事件类型
   * @returns 是否为用户创建
   */
  static isUserCreate(type: AuditEventType): boolean {
    return type === AuditEventType.USER_CREATE;
  }

  /**
   * 检查是否为用户更新
   *
   * @param type - 审计事件类型
   * @returns 是否为用户更新
   */
  static isUserUpdate(type: AuditEventType): boolean {
    return type === AuditEventType.USER_UPDATE;
  }

  /**
   * 检查是否为用户删除
   *
   * @param type - 审计事件类型
   * @returns 是否为用户删除
   */
  static isUserDelete(type: AuditEventType): boolean {
    return type === AuditEventType.USER_DELETE;
  }

  /**
   * 检查是否为权限分配
   *
   * @param type - 审计事件类型
   * @returns 是否为权限分配
   */
  static isPermissionAssign(type: AuditEventType): boolean {
    return type === AuditEventType.PERMISSION_ASSIGN;
  }

  /**
   * 检查是否为权限撤销
   *
   * @param type - 审计事件类型
   * @returns 是否为权限撤销
   */
  static isPermissionRevoke(type: AuditEventType): boolean {
    return type === AuditEventType.PERMISSION_REVOKE;
  }

  /**
   * 检查是否为数据访问
   *
   * @param type - 审计事件类型
   * @returns 是否为数据访问
   */
  static isDataAccess(type: AuditEventType): boolean {
    return type === AuditEventType.DATA_ACCESS;
  }

  /**
   * 检查是否为数据修改
   *
   * @param type - 审计事件类型
   * @returns 是否为数据修改
   */
  static isDataModify(type: AuditEventType): boolean {
    return type === AuditEventType.DATA_MODIFY;
  }

  /**
   * 检查是否为系统配置
   *
   * @param type - 审计事件类型
   * @returns 是否为系统配置
   */
  static isSystemConfig(type: AuditEventType): boolean {
    return type === AuditEventType.SYSTEM_CONFIG;
  }

  /**
   * 获取审计事件类型描述
   *
   * @param type - 审计事件类型
   * @returns 审计事件类型描述
   */
  static getDescription(type: AuditEventType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知审计事件类型";
  }

  /**
   * 获取审计事件类型分类
   *
   * @param type - 审计事件类型
   * @returns 审计事件类型分类
   */
  static getCategory(type: AuditEventType): string {
    return this.TYPE_CATEGORIES[type] || "unknown";
  }

  /**
   * 获取所有审计事件类型
   *
   * @returns 所有审计事件类型数组
   */
  static getAllTypes(): AuditEventType[] {
    return Object.values(AuditEventType);
  }

  /**
   * 获取认证相关事件类型（用户登录、用户登出）
   *
   * @returns 认证相关事件类型数组
   */
  static getAuthenticationTypes(): AuditEventType[] {
    return [
      AuditEventType.USER_LOGIN,
      AuditEventType.USER_LOGOUT,
    ];
  }

  /**
   * 获取用户管理相关事件类型（用户创建、用户更新、用户删除）
   *
   * @returns 用户管理相关事件类型数组
   */
  static getUserManagementTypes(): AuditEventType[] {
    return [
      AuditEventType.USER_CREATE,
      AuditEventType.USER_UPDATE,
      AuditEventType.USER_DELETE,
    ];
  }

  /**
   * 获取权限管理相关事件类型（权限分配、权限撤销）
   *
   * @returns 权限管理相关事件类型数组
   */
  static getPermissionManagementTypes(): AuditEventType[] {
    return [
      AuditEventType.PERMISSION_ASSIGN,
      AuditEventType.PERMISSION_REVOKE,
    ];
  }

  /**
   * 获取数据操作相关事件类型（数据访问、数据修改）
   *
   * @returns 数据操作相关事件类型数组
   */
  static getDataOperationTypes(): AuditEventType[] {
    return [
      AuditEventType.DATA_ACCESS,
      AuditEventType.DATA_MODIFY,
    ];
  }

  /**
   * 获取系统管理相关事件类型（系统配置）
   *
   * @returns 系统管理相关事件类型数组
   */
  static getSystemManagementTypes(): AuditEventType[] {
    return [
      AuditEventType.SYSTEM_CONFIG,
    ];
  }
}
