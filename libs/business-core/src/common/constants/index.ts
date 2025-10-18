/**
 * 领域层常量统一导出
 *
 * 统一导出所有领域层常量，提供便捷的导入方式。
 * 避免硬编码字符串，提高代码的可维护性和类型安全性。
 *
 * @description 领域层常量统一导出
 * @example
 * ```typescript
 * import { ErrorCodes, BusinessRules, TenantTypes } from './constants/index.js';
 *
 * // 使用错误代码
 * throw new BusinessRuleViolationException(
 *   '验证失败',
 *   ErrorCodes.VALIDATION_FAILED
 * );
 *
 * // 使用业务规则
 * if (name.length > BusinessRules.MAX_NAME_LENGTH) {
 *   throw new Error('名称过长');
 * }
 *
 * // 使用租户类型
 * const validTypes = TenantTypes.getAllTypes();
 * ```
 *
 * @since 1.0.0
 */

export * from "./error-codes.js";
export * from "./business-rules.js";
