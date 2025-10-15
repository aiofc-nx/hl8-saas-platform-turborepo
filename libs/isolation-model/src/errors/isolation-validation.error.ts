/**
 * 隔离验证异常
 *
 * @description 当隔离上下文或 ID 验证失败时抛出
 *
 * ## 错误代码
 *
 * - INVALID_TENANT_ID: 租户 ID 无效
 * - TENANT_ID_TOO_LONG: 租户 ID 过长
 * - INVALID_TENANT_ID_FORMAT: 租户 ID 格式无效
 * - INVALID_ORGANIZATION_ID: 组织 ID 无效
 * - INVALID_DEPARTMENT_ID: 部门 ID 无效
 * - INVALID_USER_ID: 用户 ID 无效
 * - INVALID_ORGANIZATION_CONTEXT: 组织上下文缺少租户
 * - INVALID_DEPARTMENT_CONTEXT: 部门上下文缺少租户或组织
 * - ACCESS_DENIED: 数据访问被拒绝
 *
 * @example
 * ```typescript
 * throw new IsolationValidationError(
 *   '租户 ID 必须是非空字符串',
 *   'INVALID_TENANT_ID',
 *   { value: '' }
 * );
 * ```
 *
 * @since 1.0.0
 */
export class IsolationValidationError extends Error {
  constructor(
    message: string,
    /** 错误代码 */
    public readonly code: string,
    /** 上下文信息 */
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = "IsolationValidationError";

    // 设置原型链（TypeScript 继承 Error 的必需操作）
    Object.setPrototypeOf(this, IsolationValidationError.prototype);
  }
}
