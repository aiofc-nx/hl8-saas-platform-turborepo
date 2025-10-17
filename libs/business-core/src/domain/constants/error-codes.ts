/**
 * 错误代码常量
 *
 * 统一管理领域层中使用的错误代码，避免硬编码字符串。
 * 提供类型安全的错误代码定义和验证。
 *
 * @description 领域层错误代码常量定义
 * @example
 * ```typescript
 * import { ErrorCodes } from './error-codes.js';
 *
 * throw new BusinessRuleViolationException(
 *   '验证失败',
 *   ErrorCodes.VALIDATION_FAILED
 * );
 * ```
 *
 * @since 1.0.0
 */

/**
 * 错误代码枚举
 *
 * @description 定义所有领域层错误代码
 */
export enum ErrorCodes {
  /** 验证失败 */
  VALIDATION_FAILED = "VALIDATION_FAILED",

  /** 业务规则违反 */
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",

  /** 实体不存在 */
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",

  /** 重复实体 */
  DUPLICATE_ENTITY = "DUPLICATE_ENTITY",

  /** 状态转换无效 */
  INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION",

  /** 权限不足 */
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  /** 操作不允许 */
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",

  /** 数据完整性违反 */
  DATA_INTEGRITY_VIOLATION = "DATA_INTEGRITY_VIOLATION",

  /** 并发冲突 */
  CONCURRENCY_CONFLICT = "CONCURRENCY_CONFLICT",

  /** 配置错误 */
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

/**
 * 错误代码验证器
 *
 * @description 提供错误代码的验证和类型检查功能
 */
export class ErrorCodeValidator {
  /**
   * 验证错误代码是否有效
   *
   * @param code 错误代码
   * @returns 是否为有效错误代码
   * @example
   * ```typescript
   * const isValid = ErrorCodeValidator.isValid("VALIDATION_FAILED");
   * console.log(isValid); // true
   * ```
   */
  static isValid(code: string): boolean {
    return Object.values(ErrorCodes).includes(code as ErrorCodes);
  }

  /**
   * 获取所有错误代码
   *
   * @returns 所有错误代码数组
   * @example
   * ```typescript
   * const allCodes = ErrorCodeValidator.getAllCodes();
   * console.log(allCodes); // ["VALIDATION_FAILED", "BUSINESS_RULE_VIOLATION", ...]
   * ```
   */
  static getAllCodes(): string[] {
    return Object.values(ErrorCodes);
  }

  /**
   * 获取错误代码的描述
   *
   * @param code 错误代码
   * @returns 错误代码描述
   * @example
   * ```typescript
   * const description = ErrorCodeValidator.getDescription(ErrorCodes.VALIDATION_FAILED);
   * console.log(description); // "验证失败"
   * ```
   */
  static getDescription(code: ErrorCodes): string {
    const descriptions: Record<ErrorCodes, string> = {
      [ErrorCodes.VALIDATION_FAILED]: "验证失败",
      [ErrorCodes.BUSINESS_RULE_VIOLATION]: "业务规则违反",
      [ErrorCodes.ENTITY_NOT_FOUND]: "实体不存在",
      [ErrorCodes.DUPLICATE_ENTITY]: "重复实体",
      [ErrorCodes.INVALID_STATE_TRANSITION]: "状态转换无效",
      [ErrorCodes.INSUFFICIENT_PERMISSIONS]: "权限不足",
      [ErrorCodes.OPERATION_NOT_ALLOWED]: "操作不允许",
      [ErrorCodes.DATA_INTEGRITY_VIOLATION]: "数据完整性违反",
      [ErrorCodes.CONCURRENCY_CONFLICT]: "并发冲突",
      [ErrorCodes.CONFIGURATION_ERROR]: "配置错误",
    };

    return descriptions[code] || "未知错误";
  }
}
