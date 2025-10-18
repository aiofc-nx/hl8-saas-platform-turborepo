/**
 * 错误代码枚举
 *
 * @description 定义系统中所有错误代码的枚举值
 *
 * ## 业务规则
 *
 * ### 错误代码规则
 * - 验证失败：数据验证失败
 * - 业务规则违反：违反业务规则
 * - 实体不存在：实体不存在
 * - 重复实体：实体重复
 * - 状态转换无效：无效的状态转换
 * - 权限不足：权限不足
 * - 操作不允许：操作不允许
 * - 数据完整性违反：数据完整性违反
 * - 并发冲突：并发冲突
 * - 配置错误：配置错误
 *
 * @example
 * ```typescript
 * import { ErrorCodes } from './error-codes.enum.js';
 *
 * // 检查错误代码
 * console.log(ErrorCodes.VALIDATION_FAILED); // "VALIDATION_FAILED"
 * console.log(ErrorCodesUtils.isValidationFailed(ErrorCodes.VALIDATION_FAILED)); // true
 * ```
 *
 * @since 1.0.0
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
 * 错误代码工具类
 *
 * @description 提供错误代码相关的工具方法
 */
export class ErrorCodesUtils {
  /**
   * 错误代码描述映射
   */
  private static readonly CODE_DESCRIPTIONS: Record<ErrorCodes, string> = {
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

  /**
   * 检查是否为验证失败
   *
   * @param code - 错误代码
   * @returns 是否为验证失败
   * @example
   * ```typescript
   * const isValidationFailed = ErrorCodesUtils.isValidationFailed(ErrorCodes.VALIDATION_FAILED);
   * console.log(isValidationFailed); // true
   * ```
   */
  static isValidationFailed(code: ErrorCodes): boolean {
    return code === ErrorCodes.VALIDATION_FAILED;
  }

  /**
   * 检查是否为业务规则违反
   *
   * @param code - 错误代码
   * @returns 是否为业务规则违反
   */
  static isBusinessRuleViolation(code: ErrorCodes): boolean {
    return code === ErrorCodes.BUSINESS_RULE_VIOLATION;
  }

  /**
   * 检查是否为实体不存在
   *
   * @param code - 错误代码
   * @returns 是否为实体不存在
   */
  static isEntityNotFound(code: ErrorCodes): boolean {
    return code === ErrorCodes.ENTITY_NOT_FOUND;
  }

  /**
   * 检查是否为重复实体
   *
   * @param code - 错误代码
   * @returns 是否为重复实体
   */
  static isDuplicateEntity(code: ErrorCodes): boolean {
    return code === ErrorCodes.DUPLICATE_ENTITY;
  }

  /**
   * 检查是否为状态转换无效
   *
   * @param code - 错误代码
   * @returns 是否为状态转换无效
   */
  static isInvalidStateTransition(code: ErrorCodes): boolean {
    return code === ErrorCodes.INVALID_STATE_TRANSITION;
  }

  /**
   * 检查是否为权限不足
   *
   * @param code - 错误代码
   * @returns 是否为权限不足
   */
  static isInsufficientPermissions(code: ErrorCodes): boolean {
    return code === ErrorCodes.INSUFFICIENT_PERMISSIONS;
  }

  /**
   * 检查是否为操作不允许
   *
   * @param code - 错误代码
   * @returns 是否为操作不允许
   */
  static isOperationNotAllowed(code: ErrorCodes): boolean {
    return code === ErrorCodes.OPERATION_NOT_ALLOWED;
  }

  /**
   * 检查是否为数据完整性违反
   *
   * @param code - 错误代码
   * @returns 是否为数据完整性违反
   */
  static isDataIntegrityViolation(code: ErrorCodes): boolean {
    return code === ErrorCodes.DATA_INTEGRITY_VIOLATION;
  }

  /**
   * 检查是否为并发冲突
   *
   * @param code - 错误代码
   * @returns 是否为并发冲突
   */
  static isConcurrencyConflict(code: ErrorCodes): boolean {
    return code === ErrorCodes.CONCURRENCY_CONFLICT;
  }

  /**
   * 检查是否为配置错误
   *
   * @param code - 错误代码
   * @returns 是否为配置错误
   */
  static isConfigurationError(code: ErrorCodes): boolean {
    return code === ErrorCodes.CONFIGURATION_ERROR;
  }

  /**
   * 获取错误代码描述
   *
   * @param code - 错误代码
   * @returns 错误代码描述
   */
  static getDescription(code: ErrorCodes): string {
    return this.CODE_DESCRIPTIONS[code] || "未知错误代码";
  }

  /**
   * 获取所有错误代码
   *
   * @returns 所有错误代码数组
   */
  static getAllCodes(): ErrorCodes[] {
    return Object.values(ErrorCodes);
  }

  /**
   * 获取验证错误代码（验证失败、业务规则违反、数据完整性违反）
   *
   * @returns 验证错误代码数组
   */
  static getValidationCodes(): ErrorCodes[] {
    return [
      ErrorCodes.VALIDATION_FAILED,
      ErrorCodes.BUSINESS_RULE_VIOLATION,
      ErrorCodes.DATA_INTEGRITY_VIOLATION,
    ];
  }

  /**
   * 获取业务错误代码（实体不存在、重复实体、状态转换无效、权限不足、操作不允许）
   *
   * @returns 业务错误代码数组
   */
  static getBusinessCodes(): ErrorCodes[] {
    return [
      ErrorCodes.ENTITY_NOT_FOUND,
      ErrorCodes.DUPLICATE_ENTITY,
      ErrorCodes.INVALID_STATE_TRANSITION,
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      ErrorCodes.OPERATION_NOT_ALLOWED,
    ];
  }

  /**
   * 获取技术错误代码（并发冲突、配置错误）
   *
   * @returns 技术错误代码数组
   */
  static getTechnicalCodes(): ErrorCodes[] {
    return [ErrorCodes.CONCURRENCY_CONFLICT, ErrorCodes.CONFIGURATION_ERROR];
  }
}
