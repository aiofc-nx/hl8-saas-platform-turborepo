import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Redis 连接异常
 *
 * @description 当 Redis 连接失败或未初始化时抛出
 *
 * ## 业务规则
 *
 * ### 触发条件
 * - Redis 服务未连接时尝试获取客户端
 * - Redis 连接初始化失败
 * - Redis 连接意外断开
 *
 * ### 错误处理
 * - 记录详细的连接状态信息
 * - 提供重连建议
 * - 包含原始错误信息用于调试
 *
 * @example
 * ```typescript
 * // 检查连接状态
 * if (!this.isConnected) {
 *   this.logger.error('Redis 未连接，尝试获取客户端', undefined, {
 *     connectionState: this.isConnected,
 *     clientExists: !!this.client
 *   });
 *   throw new RedisConnectionException('Redis 未连接，请确保模块已正确初始化');
 * }
 * ```
 *
 * @since 1.0.0
 */
export class RedisConnectionException extends HttpException {
  /**
   * 创建 Redis 连接异常
   *
   * @param message 错误消息
   * @param cause 原始错误（可选）
   */
  constructor(message: string, cause?: Error) {
    super(
      {
        message,
        error: "Redis Connection Error",
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        cause: cause?.message,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );

    // 保存原始错误用于调试
    if (cause) {
      this.cause = cause;
    }
  }
}
