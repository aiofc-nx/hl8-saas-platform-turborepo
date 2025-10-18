/**
 * 用户状态值对象
 *
 * @description 定义用户的状态枚举和验证逻辑
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../base-value-object.js";
import { BusinessRuleViolationException } from "../../exceptions/base/base-domain-exception.js";
import { ErrorCodes } from "../../../common/constants/index.js";

/**
 * 用户状态枚举
 */
export enum UserStatusValue {
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
 * 用户状态值对象
 *
 * @description 表示用户的状态，包括激活、未激活、锁定、禁用等状态
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
 * // 创建用户状态
 * const status = new UserStatus(UserStatusValue.ACTIVE);
 *
 * // 检查状态
 * console.log(status.isActive()); // true
 * console.log(status.canLogin()); // true
 *
 * // 状态转换
 * const lockedStatus = status.lock();
 * console.log(lockedStatus.isLocked()); // true
 * ```
 *
 * @since 1.0.0
 */
export class UserStatus extends BaseValueObject<UserStatusValue> {
  /**
   * 激活状态
   */
  static get ACTIVE(): UserStatus {
    return new UserStatus(UserStatusValue.ACTIVE);
  }

  /**
   * 未激活状态
   */
  static get INACTIVE(): UserStatus {
    return new UserStatus(UserStatusValue.INACTIVE);
  }

  /**
   * 锁定状态
   */
  static get LOCKED(): UserStatus {
    return new UserStatus(UserStatusValue.LOCKED);
  }

  /**
   * 禁用状态
   */
  static get DISABLED(): UserStatus {
    return new UserStatus(UserStatusValue.DISABLED);
  }

  /**
   * 验证状态值
   *
   * @param value - 状态值
   * @protected
   */
  protected validate(value: UserStatusValue): void {
    this.validateNotEmpty(value, "用户状态");
    const validStatuses = Object.values(UserStatusValue);
    if (!validStatuses.includes(value)) {
      throw new BusinessRuleViolationException(
        `无效的用户状态: ${value}`,
        ErrorCodes.VALIDATION_FAILED,
      );
    }
  }

  /**
   * 转换状态值
   *
   * @param value - 状态值
   * @returns 转换后的状态值
   * @protected
   */
  protected transform(value: UserStatusValue): UserStatusValue {
    return value;
  }

  /**
   * 检查是否为激活状态
   *
   * @returns 是否为激活状态
   */
  isActive(): boolean {
    return this.value === UserStatusValue.ACTIVE;
  }

  /**
   * 检查是否为未激活状态
   *
   * @returns 是否为未激活状态
   */
  isInactive(): boolean {
    return this.value === UserStatusValue.INACTIVE;
  }

  /**
   * 检查是否为锁定状态
   *
   * @returns 是否为锁定状态
   */
  isLocked(): boolean {
    return this.value === UserStatusValue.LOCKED;
  }

  /**
   * 检查是否为禁用状态
   *
   * @returns 是否为禁用状态
   */
  isDisabled(): boolean {
    return this.value === UserStatusValue.DISABLED;
  }

  /**
   * 检查是否可以登录
   *
   * @returns 是否可以登录
   */
  canLogin(): boolean {
    return this.value === UserStatusValue.ACTIVE;
  }

  /**
   * 检查是否可以操作
   *
   * @returns 是否可以操作
   */
  canOperate(): boolean {
    return this.value === UserStatusValue.ACTIVE;
  }

  /**
   * 锁定状态
   *
   * @returns 锁定状态实例
   */
  lock(): UserStatus {
    return UserStatus.LOCKED;
  }

  /**
   * 激活状态
   *
   * @returns 激活状态实例
   */
  activate(): UserStatus {
    return UserStatus.ACTIVE;
  }

  /**
   * 禁用状态
   *
   * @returns 禁用状态实例
   */
  disable(): UserStatus {
    return UserStatus.DISABLED;
  }

  /**
   * 获取状态描述
   *
   * @returns 状态描述
   */
  getDescription(): string {
    const descriptions = {
      [UserStatusValue.ACTIVE]: "激活",
      [UserStatusValue.INACTIVE]: "未激活",
      [UserStatusValue.LOCKED]: "锁定",
      [UserStatusValue.DISABLED]: "禁用",
    };
    return descriptions[this.value] || "未知状态";
  }
}
