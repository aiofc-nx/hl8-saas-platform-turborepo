/**
 * MFA类型枚举
 *
 * @description 定义系统中所有MFA类型的枚举值
 *
 * ## 业务规则
 *
 * ### MFA类型规则
 * - 短信验证：通过短信发送验证码
 * - 邮件验证：通过邮件发送验证码
 * - 应用验证：通过认证应用生成验证码
 * - 硬件令牌：通过硬件设备生成验证码
 * - 生物识别：通过生物特征验证
 *
 * ### MFA类型安全规则
 * - 短信验证：安全性中等，依赖运营商
 * - 邮件验证：安全性较低，依赖邮件服务
 * - 应用验证：安全性高，推荐使用
 * - 硬件令牌：安全性最高，适合高安全要求
 * - 生物识别：安全性高，用户体验好
 *
 * @example
 * ```typescript
 * import { MfaType } from './mfa-type.enum.js';
 *
 * // 检查MFA类型
 * console.log(MfaType.SMS); // "SMS"
 * console.log(MfaTypeUtils.isSms(MfaType.SMS)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum MfaType {
  /** 短信验证 */
  SMS = "SMS",
  /** 邮件验证 */
  EMAIL = "EMAIL",
  /** 应用验证 */
  APP = "APP",
  /** 硬件令牌 */
  HARDWARE = "HARDWARE",
  /** 生物识别 */
  BIOMETRIC = "BIOMETRIC",
}

/**
 * MFA类型工具类
 *
 * @description 提供MFA类型相关的工具方法
 */
export class MfaTypeUtils {
  /**
   * MFA类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<MfaType, string> = {
    [MfaType.SMS]: "短信验证",
    [MfaType.EMAIL]: "邮件验证",
    [MfaType.APP]: "应用验证",
    [MfaType.HARDWARE]: "硬件令牌",
    [MfaType.BIOMETRIC]: "生物识别",
  };

  /**
   * MFA类型安全级别映射
   */
  private static readonly TYPE_SECURITY_LEVELS: Record<MfaType, number> = {
    [MfaType.BIOMETRIC]: 5,
    [MfaType.HARDWARE]: 4,
    [MfaType.APP]: 3,
    [MfaType.SMS]: 2,
    [MfaType.EMAIL]: 1,
  };

  /**
   * 检查是否为短信验证
   *
   * @param type - MFA类型
   * @returns 是否为短信验证
   * @example
   * ```typescript
   * const isSms = MfaTypeUtils.isSms(MfaType.SMS);
   * console.log(isSms); // true
   * ```
   */
  static isSms(type: MfaType): boolean {
    return type === MfaType.SMS;
  }

  /**
   * 检查是否为邮件验证
   *
   * @param type - MFA类型
   * @returns 是否为邮件验证
   */
  static isEmail(type: MfaType): boolean {
    return type === MfaType.EMAIL;
  }

  /**
   * 检查是否为应用验证
   *
   * @param type - MFA类型
   * @returns 是否为应用验证
   */
  static isApp(type: MfaType): boolean {
    return type === MfaType.APP;
  }

  /**
   * 检查是否为硬件令牌
   *
   * @param type - MFA类型
   * @returns 是否为硬件令牌
   */
  static isHardware(type: MfaType): boolean {
    return type === MfaType.HARDWARE;
  }

  /**
   * 检查是否为生物识别
   *
   * @param type - MFA类型
   * @returns 是否为生物识别
   */
  static isBiometric(type: MfaType): boolean {
    return type === MfaType.BIOMETRIC;
  }

  /**
   * 检查MFA类型是否高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否高于类型2
   */
  static hasHigherSecurity(type1: MfaType, type2: MfaType): boolean {
    return this.TYPE_SECURITY_LEVELS[type1] > this.TYPE_SECURITY_LEVELS[type2];
  }

  /**
   * 检查MFA类型是否等于或高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否等于或高于类型2
   */
  static hasSecurityOrHigher(type1: MfaType, type2: MfaType): boolean {
    return this.TYPE_SECURITY_LEVELS[type1] >= this.TYPE_SECURITY_LEVELS[type2];
  }

  /**
   * 获取MFA类型描述
   *
   * @param type - MFA类型
   * @returns MFA类型描述
   */
  static getDescription(type: MfaType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知MFA类型";
  }

  /**
   * 获取所有MFA类型
   *
   * @returns 所有MFA类型数组
   */
  static getAllTypes(): MfaType[] {
    return Object.values(MfaType);
  }

  /**
   * 获取高安全级别类型（生物识别、硬件令牌、应用验证）
   *
   * @returns 高安全级别类型数组
   */
  static getHighSecurityTypes(): MfaType[] {
    return [
      MfaType.BIOMETRIC,
      MfaType.HARDWARE,
      MfaType.APP,
    ];
  }

  /**
   * 获取低安全级别类型（短信验证、邮件验证）
   *
   * @returns 低安全级别类型数组
   */
  static getLowSecurityTypes(): MfaType[] {
    return [
      MfaType.SMS,
      MfaType.EMAIL,
    ];
  }
}
