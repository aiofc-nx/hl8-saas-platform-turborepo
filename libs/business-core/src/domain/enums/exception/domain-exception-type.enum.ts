/**
 * 领域异常类型枚举
 *
 * @description 定义系统中所有领域异常类型的枚举值
 *
 * ## 业务规则
 *
 * ### 领域异常类型规则
 * - 业务规则异常：违反业务规则时抛出
 * - 验证异常：数据验证失败时抛出
 * - 状态异常：无效状态变更时抛出
 * - 权限异常：权限不足时抛出
 * - 并发异常：并发冲突时抛出
 * - 未找到异常：资源不存在时抛出
 *
 * ### 异常处理规则
 * - 领域异常应该在领域层边界被捕获
 * - 领域异常应该转换为适当的应用层异常
 * - 领域异常应该记录详细的日志信息
 * - 领域异常应该提供用户友好的错误消息
 *
 * @example
 * ```typescript
 * import { DomainExceptionType } from './domain-exception-type.enum.js';
 *
 * // 检查异常类型
 * console.log(DomainExceptionType.BUSINESS_RULE); // "business_rule"
 * console.log(DomainExceptionTypeUtils.isBusinessRule(DomainExceptionType.BUSINESS_RULE)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum DomainExceptionType {
  /** 业务规则异常 */
  BUSINESS_RULE = "business_rule",
  /** 验证异常 */
  VALIDATION = "validation",
  /** 状态异常 */
  STATE = "state",
  /** 权限异常 */
  PERMISSION = "permission",
  /** 并发异常 */
  CONCURRENCY = "concurrency",
  /** 未找到异常 */
  NOT_FOUND = "not_found",
}

/**
 * 领域异常类型工具类
 *
 * @description 提供领域异常类型相关的工具方法
 */
export class DomainExceptionTypeUtils {
  /**
   * 异常类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<DomainExceptionType, string> = {
    [DomainExceptionType.BUSINESS_RULE]: "业务规则异常",
    [DomainExceptionType.VALIDATION]: "验证异常",
    [DomainExceptionType.STATE]: "状态异常",
    [DomainExceptionType.PERMISSION]: "权限异常",
    [DomainExceptionType.CONCURRENCY]: "并发异常",
    [DomainExceptionType.NOT_FOUND]: "未找到异常",
  };

  /**
   * 检查是否为业务规则异常
   *
   * @param type - 领域异常类型
   * @returns 是否为业务规则异常
   * @example
   * ```typescript
   * const isBusinessRule = DomainExceptionTypeUtils.isBusinessRule(DomainExceptionType.BUSINESS_RULE);
   * console.log(isBusinessRule); // true
   * ```
   */
  static isBusinessRule(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.BUSINESS_RULE;
  }

  /**
   * 检查是否为验证异常
   *
   * @param type - 领域异常类型
   * @returns 是否为验证异常
   */
  static isValidation(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.VALIDATION;
  }

  /**
   * 检查是否为状态异常
   *
   * @param type - 领域异常类型
   * @returns 是否为状态异常
   */
  static isState(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.STATE;
  }

  /**
   * 检查是否为权限异常
   *
   * @param type - 领域异常类型
   * @returns 是否为权限异常
   */
  static isPermission(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.PERMISSION;
  }

  /**
   * 检查是否为并发异常
   *
   * @param type - 领域异常类型
   * @returns 是否为并发异常
   */
  static isConcurrency(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.CONCURRENCY;
  }

  /**
   * 检查是否为未找到异常
   *
   * @param type - 领域异常类型
   * @returns 是否为未找到异常
   */
  static isNotFound(type: DomainExceptionType): boolean {
    return type === DomainExceptionType.NOT_FOUND;
  }

  /**
   * 获取异常类型描述
   *
   * @param type - 领域异常类型
   * @returns 异常类型描述
   */
  static getDescription(type: DomainExceptionType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知领域异常类型";
  }

  /**
   * 获取所有异常类型
   *
   * @returns 所有异常类型数组
   */
  static getAllTypes(): DomainExceptionType[] {
    return Object.values(DomainExceptionType);
  }

  /**
   * 获取业务异常类型（业务规则、验证、状态、权限）
   *
   * @returns 业务异常类型数组
   */
  static getBusinessTypes(): DomainExceptionType[] {
    return [
      DomainExceptionType.BUSINESS_RULE,
      DomainExceptionType.VALIDATION,
      DomainExceptionType.STATE,
      DomainExceptionType.PERMISSION,
    ];
  }

  /**
   * 获取技术异常类型（并发、未找到）
   *
   * @returns 技术异常类型数组
   */
  static getTechnicalTypes(): DomainExceptionType[] {
    return [
      DomainExceptionType.CONCURRENCY,
      DomainExceptionType.NOT_FOUND,
    ];
  }
}
