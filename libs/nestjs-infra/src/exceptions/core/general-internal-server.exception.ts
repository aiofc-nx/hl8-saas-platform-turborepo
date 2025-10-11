/**
 * 通用 500 内部服务器错误异常
 *
 * @description 表示服务器内部发生了未预期的错误
 *
 * ## 业务规则
 *
 * ### 使用场景
 * - 数据库连接失败
 * - 外部服务调用失败
 * - 系统资源不足
 * - 未捕获的运行时错误
 *
 * ### 响应规则
 * - HTTP 状态码：500
 * - 错误代码：INTERNAL_SERVER_ERROR
 * - 生产环境不应暴露敏感错误详情
 * - 应记录完整的错误堆栈到日志
 *
 * ### 安全规则
 * - 不应暴露系统内部细节
 * - 不应包含敏感信息（数据库密码、API 密钥等）
 * - 错误堆栈仅记录到日志，不返回给客户端
 *
 * ## 使用场景
 *
 * 1. **数据库错误**：数据库连接或查询失败
 * 2. **外部服务**：第三方 API 调用失败
 * 3. **系统资源**：内存不足、磁盘满等
 * 4. **未预期错误**：捕获所有其他未处理的错误
 *
 * @example
 * ```typescript
 * // 数据库错误
 * try {
 *   await this.db.transaction(async (trx) => {
 *     // ... 复杂事务操作
 *   });
 * } catch (error) {
 *   throw new GeneralInternalServerException(
 *     '数据库事务失败',
 *     '执行数据库事务时发生错误',
 *     { operation: 'transaction' },
 *     error
 *   );
 * }
 *
 * // 外部服务调用失败
 * try {
 *   const result = await this.paymentService.charge(amount);
 * } catch (error) {
 *   throw new GeneralInternalServerException(
 *     '支付服务异常',
 *     '调用支付服务时发生错误',
 *     { amount, provider: 'stripe' },
 *     error
 *   );
 * }
 *
 * // 资源不足
 * if (!this.hasEnoughMemory()) {
 *   throw new GeneralInternalServerException(
 *     '系统资源不足',
 *     '服务器内存不足，无法处理请求',
 *     { availableMemory: process.memoryUsage() }
 *   );
 * }
 *
 * // 包装未知错误
 * try {
 *   // ... 可能抛出任何错误的代码
 * } catch (error) {
 *   if (error instanceof AbstractHttpException) {
 *     throw error; // 重新抛出已知的业务异常
 *   }
 *   // 将未知错误包装为 500 错误
 *   throw new GeneralInternalServerException(
 *     '服务器内部错误',
 *     '处理请求时发生未预期的错误',
 *     undefined,
 *     error instanceof Error ? error : new Error(String(error))
 *   );
 * }
 * ```
 *
 * @since 0.1.0
 */

import { AbstractHttpException } from './abstract-http.exception';

/**
 * 通用 500 内部服务器错误异常
 *
 * @description 表示服务器内部发生了未预期的错误
 */
export class GeneralInternalServerException extends AbstractHttpException {
  /**
   * 创建 500 内部服务器错误异常
   *
   * @param title - 错误的简短摘要（如："数据库连接失败"）
   * @param detail - 错误的详细说明（如："无法连接到数据库服务器"）
   * @param data - 附加数据（可选，不应包含敏感信息）
   * @param rootCause - 根本原因（可选，用于错误链追踪）
   *
   * @example
   * ```typescript
   * try {
   *   await this.cache.connect();
   * } catch (error) {
   *   throw new GeneralInternalServerException(
   *     'Redis 连接失败',
   *     '无法连接到 Redis 服务器',
   *     { host: 'localhost', port: 6379 },
   *     error instanceof Error ? error : undefined
   *   );
   * }
   * ```
   */
  constructor(title: string, detail: string, data?: any, rootCause?: Error) {
    super('INTERNAL_SERVER_ERROR', title, detail, 500, data, undefined, rootCause);
  }
}

