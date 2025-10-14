/**
 * 数据库事务异常
 *
 * @description 当事务执行失败时抛出此异常
 *
 * ## 业务规则
 *
 * - HTTP 状态码：500 Internal Server Error
 * - 错误代码：DATABASE_TRANSACTION_ERROR
 * - 使用场景：事务提交失败、回滚失败、死锁
 *
 * ## 使用场景
 *
 * - 事务提交失败
 * - 事务回滚失败
 * - 事务超时
 * - 数据库死锁
 *
 * @example
 * ```typescript
 * try {
 *   await em.transactional(async (tem) => {
 *     // 事务操作
 *   });
 * } catch (error) {
 *   throw new DatabaseTransactionException(
 *     '事务执行失败',
 *     { operation: 'createUser' }
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 */

import { AbstractHttpException } from '@hl8/exceptions';

export class DatabaseTransactionException extends AbstractHttpException {
  /**
   * 创建数据库事务异常
   *
   * @param detail - 详细错误说明（中文）
   * @param data - 诊断信息（可选），如 operation、step 等
   */
  constructor(detail: string, data?: Record<string, any>) {
    super(
      'DATABASE_TRANSACTION_ERROR', // errorCode
      '数据库事务错误', // title
      detail, // detail
      500, // status
      data, // data
    );
  }
}
