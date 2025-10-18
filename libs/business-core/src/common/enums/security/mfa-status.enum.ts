/**
 * MFA状态枚举
 *
 * @description 定义系统中所有MFA状态的枚举值
 *
 * ## 业务规则
 *
 * ### MFA状态规则
 * - 未启用：MFA未启用
 * - 已启用：MFA已启用
 * - 已禁用：MFA已禁用
 * - 已过期：MFA已过期
 * - 已锁定：MFA已锁定
 *
 * ### MFA状态转换规则
 * - 未启用 -> 已启用：用户启用MFA
 * - 已启用 -> 已禁用：管理员禁用MFA
 * - 已启用 -> 已过期：MFA过期
 * - 已启用 -> 已锁定：连续失败锁定
 * - 已禁用 -> 已启用：用户重新启用MFA
 * - 已过期 -> 已启用：用户重新激活MFA
 * - 已锁定 -> 已启用：管理员解锁MFA
 *
 * @example
 * ```typescript
 * import { MfaStatus } from './mfa-status.enum.js';
 *
 * // 检查MFA状态
 * console.log(MfaStatus.ENABLED); // "ENABLED"
 * console.log(MfaStatusUtils.isEnabled(MfaStatus.ENABLED)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum MfaStatus {
  /** 未启用 */
  DISABLED = "DISABLED",
  /** 已启用 */
  ENABLED = "ENABLED",
  /** 已禁用 */
  DEACTIVATED = "DEACTIVATED",
  /** 已过期 */
  EXPIRED = "EXPIRED",
  /** 已锁定 */
  LOCKED = "LOCKED",
}

/**
 * MFA状态工具类
 *
 * @description 提供MFA状态相关的工具方法
 */
export class MfaStatusUtils {
  /**
   * MFA状态描述映射
   */
  private static readonly STATUS_DESCRIPTIONS: Record<MfaStatus, string> = {
    [MfaStatus.DISABLED]: "未启用",
    [MfaStatus.ENABLED]: "已启用",
    [MfaStatus.DEACTIVATED]: "已禁用",
    [MfaStatus.EXPIRED]: "已过期",
    [MfaStatus.LOCKED]: "已锁定",
  };

  /**
   * 检查是否为未启用
   *
   * @param status - MFA状态
   * @returns 是否为未启用
   * @example
   * ```typescript
   * const isDisabled = MfaStatusUtils.isDisabled(MfaStatus.DISABLED);
   * console.log(isDisabled); // true
   * ```
   */
  static isDisabled(status: MfaStatus): boolean {
    return status === MfaStatus.DISABLED;
  }

  /**
   * 检查是否为已启用
   *
   * @param status - MFA状态
   * @returns 是否为已启用
   */
  static isEnabled(status: MfaStatus): boolean {
    return status === MfaStatus.ENABLED;
  }

  /**
   * 检查是否为已禁用
   *
   * @param status - MFA状态
   * @returns 是否为已禁用
   */
  static isDeactivated(status: MfaStatus): boolean {
    return status === MfaStatus.DEACTIVATED;
  }

  /**
   * 检查是否为已过期
   *
   * @param status - MFA状态
   * @returns 是否为已过期
   */
  static isExpired(status: MfaStatus): boolean {
    return status === MfaStatus.EXPIRED;
  }

  /**
   * 检查是否为已锁定
   *
   * @param status - MFA状态
   * @returns 是否为已锁定
   */
  static isLocked(status: MfaStatus): boolean {
    return status === MfaStatus.LOCKED;
  }

  /**
   * 检查是否可以验证
   *
   * @param status - MFA状态
   * @returns 是否可以验证
   */
  static canVerify(status: MfaStatus): boolean {
    return status === MfaStatus.ENABLED;
  }

  /**
   * 检查是否可以启用
   *
   * @param status - MFA状态
   * @returns 是否可以启用
   */
  static canEnable(status: MfaStatus): boolean {
    return status === MfaStatus.DISABLED || status === MfaStatus.DEACTIVATED;
  }

  /**
   * 检查是否可以禁用
   *
   * @param status - MFA状态
   * @returns 是否可以禁用
   */
  static canDisable(status: MfaStatus): boolean {
    return status === MfaStatus.ENABLED;
  }

  /**
   * 检查是否可以解锁
   *
   * @param status - MFA状态
   * @returns 是否可以解锁
   */
  static canUnlock(status: MfaStatus): boolean {
    return status === MfaStatus.LOCKED;
  }

  /**
   * 获取MFA状态描述
   *
   * @param status - MFA状态
   * @returns MFA状态描述
   */
  static getDescription(status: MfaStatus): string {
    return this.STATUS_DESCRIPTIONS[status] || "未知MFA状态";
  }

  /**
   * 获取所有MFA状态
   *
   * @returns 所有MFA状态数组
   */
  static getAllStatuses(): MfaStatus[] {
    return Object.values(MfaStatus);
  }

  /**
   * 获取有效状态（已启用）
   *
   * @returns 有效状态数组
   */
  static getValidStatuses(): MfaStatus[] {
    return [MfaStatus.ENABLED];
  }
}
