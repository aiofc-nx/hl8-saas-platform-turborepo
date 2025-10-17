/**
 * 领域异常严重级别枚举
 *
 * @description 定义系统中所有领域异常严重级别的枚举值
 *
 * ## 业务规则
 *
 * ### 异常严重级别规则
 * - 低级别：轻微问题，不影响核心功能
 * - 中级别：重要问题，可能影响部分功能
 * - 高级别：严重问题，影响核心功能
 * - 关键级别：致命问题，系统无法正常运行
 *
 * ### 异常处理规则
 * - 低级别异常：记录日志，继续执行
 * - 中级别异常：记录日志，发送通知，继续执行
 * - 高级别异常：记录日志，发送告警，停止相关操作
 * - 关键级别异常：记录日志，发送紧急告警，停止系统
 *
 * @example
 * ```typescript
 * import { DomainExceptionSeverity } from './domain-exception-severity.enum.js';
 *
 * // 检查异常严重级别
 * console.log(DomainExceptionSeverity.HIGH); // "high"
 * console.log(DomainExceptionSeverityUtils.isHigh(DomainExceptionSeverity.HIGH)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum DomainExceptionSeverity {
  /** 低级别 */
  LOW = "low",
  /** 中级别 */
  MEDIUM = "medium",
  /** 高级别 */
  HIGH = "high",
  /** 关键级别 */
  CRITICAL = "critical",
}

/**
 * 领域异常严重级别工具类
 *
 * @description 提供领域异常严重级别相关的工具方法
 */
export class DomainExceptionSeverityUtils {
  /**
   * 严重级别层级映射
   */
  private static readonly SEVERITY_HIERARCHY: Record<DomainExceptionSeverity, number> = {
    [DomainExceptionSeverity.CRITICAL]: 4,
    [DomainExceptionSeverity.HIGH]: 3,
    [DomainExceptionSeverity.MEDIUM]: 2,
    [DomainExceptionSeverity.LOW]: 1,
  };

  /**
   * 严重级别描述映射
   */
  private static readonly SEVERITY_DESCRIPTIONS: Record<DomainExceptionSeverity, string> = {
    [DomainExceptionSeverity.LOW]: "低级别",
    [DomainExceptionSeverity.MEDIUM]: "中级别",
    [DomainExceptionSeverity.HIGH]: "高级别",
    [DomainExceptionSeverity.CRITICAL]: "关键级别",
  };

  /**
   * 检查是否为低级别
   *
   * @param severity - 领域异常严重级别
   * @returns 是否为低级别
   * @example
   * ```typescript
   * const isLow = DomainExceptionSeverityUtils.isLow(DomainExceptionSeverity.LOW);
   * console.log(isLow); // true
   * ```
   */
  static isLow(severity: DomainExceptionSeverity): boolean {
    return severity === DomainExceptionSeverity.LOW;
  }

  /**
   * 检查是否为中级别
   *
   * @param severity - 领域异常严重级别
   * @returns 是否为中级别
   */
  static isMedium(severity: DomainExceptionSeverity): boolean {
    return severity === DomainExceptionSeverity.MEDIUM;
  }

  /**
   * 检查是否为高级别
   *
   * @param severity - 领域异常严重级别
   * @returns 是否为高级别
   */
  static isHigh(severity: DomainExceptionSeverity): boolean {
    return severity === DomainExceptionSeverity.HIGH;
  }

  /**
   * 检查是否为关键级别
   *
   * @param severity - 领域异常严重级别
   * @returns 是否为关键级别
   */
  static isCritical(severity: DomainExceptionSeverity): boolean {
    return severity === DomainExceptionSeverity.CRITICAL;
  }

  /**
   * 检查异常严重级别是否高于指定级别
   *
   * @param severity1 - 级别1
   * @param severity2 - 级别2
   * @returns 级别1是否高于级别2
   */
  static hasHigherSeverity(severity1: DomainExceptionSeverity, severity2: DomainExceptionSeverity): boolean {
    return this.SEVERITY_HIERARCHY[severity1] > this.SEVERITY_HIERARCHY[severity2];
  }

  /**
   * 检查异常严重级别是否等于或高于指定级别
   *
   * @param severity1 - 级别1
   * @param severity2 - 级别2
   * @returns 级别1是否等于或高于级别2
   */
  static hasSeverityOrHigher(severity1: DomainExceptionSeverity, severity2: DomainExceptionSeverity): boolean {
    return this.SEVERITY_HIERARCHY[severity1] >= this.SEVERITY_HIERARCHY[severity2];
  }

  /**
   * 获取严重级别描述
   *
   * @param severity - 领域异常严重级别
   * @returns 严重级别描述
   */
  static getDescription(severity: DomainExceptionSeverity): string {
    return this.SEVERITY_DESCRIPTIONS[severity] || "未知异常严重级别";
  }

  /**
   * 获取所有严重级别
   *
   * @returns 所有严重级别数组
   */
  static getAllSeverities(): DomainExceptionSeverity[] {
    return Object.values(DomainExceptionSeverity);
  }

  /**
   * 获取高严重级别（高、关键）
   *
   * @returns 高严重级别数组
   */
  static getHighSeverities(): DomainExceptionSeverity[] {
    return [
      DomainExceptionSeverity.HIGH,
      DomainExceptionSeverity.CRITICAL,
    ];
  }

  /**
   * 获取低严重级别（低、中）
   *
   * @returns 低严重级别数组
   */
  static getLowSeverities(): DomainExceptionSeverity[] {
    return [
      DomainExceptionSeverity.LOW,
      DomainExceptionSeverity.MEDIUM,
    ];
  }
}
