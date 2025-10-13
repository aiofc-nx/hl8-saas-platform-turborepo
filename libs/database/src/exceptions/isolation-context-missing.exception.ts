/**
 * 隔离上下文缺失异常
 *
 * @description 当需要隔离上下文但未提供时抛出此异常
 *
 * ## 业务规则
 *
 * - HTTP 状态码：400 Bad Request
 * - 错误代码：ISOLATION_CONTEXT_MISSING
 * - 使用场景：租户级数据访问缺少租户 ID、组织级访问缺少组织 ID 等
 *
 * ## 使用场景
 *
 * - 租户级数据访问但缺少租户 ID
 * - 组织级数据访问但缺少组织 ID
 * - 部门级数据访问但缺少部门 ID
 * - 用户级数据访问但缺少用户 ID
 *
 * @example
 * ```typescript
 * const context = this.isolationService.getContext();
 * 
 * if (!context || !context.getTenantId()) {
 *   throw new IsolationContextMissingException(
 *     '租户级数据访问要求提供租户 ID',
 *     { requiredLevel: 'TENANT' }
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 */

import { AbstractHttpException } from '@hl8/exceptions';

export class IsolationContextMissingException extends AbstractHttpException {
  /**
   * 创建隔离上下文缺失异常
   *
   * @param detail - 详细错误说明（中文）
   * @param data - 诊断信息（可选），如 requiredLevel、providedContext 等
   */
  constructor(detail: string, data?: Record<string, any>) {
    super(
      'ISOLATION_CONTEXT_MISSING',  // errorCode
      '隔离上下文缺失',              // title
      detail,                        // detail
      400,                           // status
      data                           // data
    );
  }
}

