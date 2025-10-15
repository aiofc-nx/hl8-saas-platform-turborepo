/**
 * 用户状态枚举
 *
 * @description 业务特定的用户状态枚举，定义用户账户的各种状态
 *
 * ## 业务规则
 *
 * ### 状态转换规则
 * - PENDING -> ACTIVE: 用户注册后激活
 * - ACTIVE -> DISABLED: 管理员禁用用户
 * - ACTIVE -> LOCKED: 登录失败次数过多
 * - DISABLED -> ACTIVE: 管理员启用用户
 * - LOCKED -> ACTIVE: 管理员解锁用户
 * - 任何状态 -> EXPIRED: 长期未登录
 * - 任何状态 -> DELETED: 删除用户
 *
 * ### 权限规则
 * - PENDING: 无法登录，需要激活
 * - ACTIVE: 正常登录和操作权限
 * - DISABLED: 无法登录，需要管理员启用
 * - LOCKED: 无法登录，需要管理员解锁
 * - EXPIRED: 无法登录，需要重新激活
 * - DELETED: 完全无权限，数据标记删除
 *
 * @example
 * ```typescript
 * // 检查用户状态
 * if (user.getStatus() === UserStatus.ACTIVE) {
 *   console.log("用户已激活");
 * }
 *
 * // 状态转换
 * user.verifyEmail(); // PENDING -> ACTIVE
 * user.disable();     // ACTIVE -> DISABLED
 * ```
 *
 * @since 1.0.0
 */

/**
 * 用户状态枚举
 *
 * @description 用户账户状态定义
 */
export enum UserStatus {
  /**
   * 待激活状态
   *
   * @description 用户已创建但未激活，无法登录
   */
  PENDING = "PENDING",

  /**
   * 活跃状态
   *
   * @description 用户已激活，可以正常登录和操作
   */
  ACTIVE = "ACTIVE",

  /**
   * 禁用状态
   *
   * @description 用户被管理员禁用，无法登录
   */
  DISABLED = "DISABLED",

  /**
   * 锁定状态
   *
   * @description 用户因登录失败次数过多被锁定
   */
  LOCKED = "LOCKED",

  /**
   * 过期状态
   *
   * @description 用户长期未登录，账户已过期
   */
  EXPIRED = "EXPIRED",

  /**
   * 已删除状态
   *
   * @description 用户已删除，数据标记删除
   */
  DELETED = "DELETED",
}

/**
 * 用户状态工具类
 *
 * @description 提供用户状态相关的工具方法
 */
export class UserStatusUtils {
  /**
   * 检查状态是否有效
   *
   * @description 检查用户状态是否为有效状态
   * @param status - 用户状态
   * @returns 是否有效
   */
  public static isValid(status: string): boolean {
    return Object.values(UserStatus).includes(status as UserStatus);
  }

  /**
   * 检查是否可以登录
   *
   * @description 检查用户状态是否允许登录
   * @param status - 用户状态
   * @returns 是否可以登录
   */
  public static canLogin(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否可以激活
   *
   * @description 检查用户状态是否允许激活
   * @param status - 用户状态
   * @returns 是否可以激活
   */
  public static canActivate(status: UserStatus): boolean {
    return status === UserStatus.PENDING;
  }

  /**
   * 检查是否可以禁用
   *
   * @description 检查用户状态是否允许禁用
   * @param status - 用户状态
   * @returns 是否可以禁用
   */
  public static canDisable(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否可以启用
   *
   * @description 检查用户状态是否允许启用
   * @param status - 用户状态
   * @returns 是否可以启用
   */
  public static canEnable(status: UserStatus): boolean {
    return status === UserStatus.DISABLED;
  }

  /**
   * 检查是否可以锁定
   *
   * @description 检查用户状态是否允许锁定
   * @param status - 用户状态
   * @returns 是否可以锁定
   */
  public static canLock(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否可以解锁
   *
   * @description 检查用户状态是否允许解锁
   * @param status - 用户状态
   * @returns 是否可以解锁
   */
  public static canUnlock(status: UserStatus): boolean {
    return status === UserStatus.LOCKED;
  }

  /**
   * 检查是否可以过期
   *
   * @description 检查用户状态是否允许过期
   * @param status - 用户状态
   * @returns 是否可以过期
   */
  public static canExpire(status: UserStatus): boolean {
    return [UserStatus.ACTIVE, UserStatus.PENDING].includes(status);
  }

  /**
   * 检查是否可以删除
   *
   * @description 检查用户状态是否允许删除
   * @param status - 用户状态
   * @returns 是否可以删除
   */
  public static canDelete(status: UserStatus): boolean {
    return status !== UserStatus.DELETED;
  }

  /**
   * 获取状态显示名称
   *
   * @description 获取用户状态的中文显示名称
   * @param status - 用户状态
   * @returns 显示名称
   */
  public static getDisplayName(status: UserStatus): string {
    const displayNames: Record<UserStatus, string> = {
      [UserStatus.PENDING]: "待激活",
      [UserStatus.ACTIVE]: "活跃",
      [UserStatus.DISABLED]: "已禁用",
      [UserStatus.LOCKED]: "已锁定",
      [UserStatus.EXPIRED]: "已过期",
      [UserStatus.DELETED]: "已删除",
    };

    return displayNames[status] || "未知状态";
  }

  /**
   * 获取状态描述
   *
   * @description 获取用户状态的详细描述
   * @param status - 用户状态
   * @returns 状态描述
   */
  public static getDescription(status: UserStatus): string {
    const descriptions: Record<UserStatus, string> = {
      [UserStatus.PENDING]: "用户已创建但未激活，需要激活后才能登录",
      [UserStatus.ACTIVE]: "用户已激活，可以正常登录和操作系统",
      [UserStatus.DISABLED]: "用户被管理员禁用，无法登录系统",
      [UserStatus.LOCKED]: "用户因登录失败次数过多被锁定，需要管理员解锁",
      [UserStatus.EXPIRED]: "用户长期未登录，账户已过期，需要重新激活",
      [UserStatus.DELETED]: "用户已删除，数据标记删除但未物理删除",
    };

    return descriptions[status] || "未知状态";
  }

  /**
   * 获取状态优先级（用于排序）
   *
   * @description 获取用户状态的优先级，数值越小优先级越高
   * @param status - 用户状态
   * @returns 优先级
   */
  public static getPriority(status: UserStatus): number {
    const priorities: Record<UserStatus, number> = {
      [UserStatus.ACTIVE]: 1,
      [UserStatus.PENDING]: 2,
      [UserStatus.LOCKED]: 3,
      [UserStatus.EXPIRED]: 4,
      [UserStatus.DISABLED]: 5,
      [UserStatus.DELETED]: 6,
    };

    return priorities[status] || 999;
  }
}
