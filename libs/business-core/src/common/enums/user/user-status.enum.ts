/**
 * 用户状态枚举
 *
 * @description 定义系统中所有用户状态的枚举值
 *
 * ## 业务规则
 *
 * ### 状态转换规则
 * - 未激活 -> 激活：需要管理员激活
 * - 激活 -> 锁定：连续登录失败或管理员锁定
 * - 锁定 -> 激活：管理员解锁或自动解锁
 * - 激活 -> 禁用：管理员禁用
 * - 禁用 -> 激活：管理员重新激活
 *
 * ### 状态验证规则
 * - 只有激活状态的用户才能登录
 * - 锁定状态的用户需要管理员解锁
 * - 禁用状态的用户不能进行任何操作
 *
 * @example
 * ```typescript
 * import { UserStatus } from './user-status.enum.js';
 *
 * // 检查状态
 * console.log(UserStatus.ACTIVE); // "ACTIVE"
 * console.log(UserStatusUtils.canLogin(UserStatus.ACTIVE)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum UserStatus {
  /** 激活状态 */
  ACTIVE = "ACTIVE",
  /** 未激活状态 */
  INACTIVE = "INACTIVE",
  /** 锁定状态 */
  LOCKED = "LOCKED",
  /** 禁用状态 */
  DISABLED = "DISABLED",
}

/**
 * 用户状态工具类
 *
 * @description 提供用户状态相关的工具方法
 */
export class UserStatusUtils {
  /**
   * 状态描述映射
   */
  private static readonly STATUS_DESCRIPTIONS: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: "激活",
    [UserStatus.INACTIVE]: "未激活",
    [UserStatus.LOCKED]: "锁定",
    [UserStatus.DISABLED]: "禁用",
  };

  /**
   * 检查是否为激活状态
   *
   * @param status - 用户状态
   * @returns 是否为激活状态
   * @example
   * ```typescript
   * const isActive = UserStatusUtils.isActive(UserStatus.ACTIVE);
   * console.log(isActive); // true
   * ```
   */
  static isActive(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否为未激活状态
   *
   * @param status - 用户状态
   * @returns 是否为未激活状态
   */
  static isInactive(status: UserStatus): boolean {
    return status === UserStatus.INACTIVE;
  }

  /**
   * 检查是否为锁定状态
   *
   * @param status - 用户状态
   * @returns 是否为锁定状态
   */
  static isLocked(status: UserStatus): boolean {
    return status === UserStatus.LOCKED;
  }

  /**
   * 检查是否为禁用状态
   *
   * @param status - 用户状态
   * @returns 是否为禁用状态
   */
  static isDisabled(status: UserStatus): boolean {
    return status === UserStatus.DISABLED;
  }

  /**
   * 检查是否可以登录
   *
   * @param status - 用户状态
   * @returns 是否可以登录
   */
  static canLogin(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否可以操作
   *
   * @param status - 用户状态
   * @returns 是否可以操作
   */
  static canOperate(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 获取状态描述
   *
   * @param status - 用户状态
   * @returns 状态描述
   */
  static getDescription(status: UserStatus): string {
    return this.STATUS_DESCRIPTIONS[status] || "未知状态";
  }

  /**
   * 获取所有状态
   *
   * @returns 所有状态数组
   */
  static getAllStatuses(): UserStatus[] {
    return Object.values(UserStatus);
  }

  /**
   * 获取有效状态（可以登录的状态）
   *
   * @returns 有效状态数组
   */
  static getValidStatuses(): UserStatus[] {
    return [UserStatus.ACTIVE];
  }
}
