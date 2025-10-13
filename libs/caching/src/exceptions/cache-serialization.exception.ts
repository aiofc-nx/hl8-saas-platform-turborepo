import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 缓存序列化异常
 * 
 * @description 当缓存数据序列化或反序列化失败时抛出
 * 
 * ## 业务规则
 * 
 * ### 触发条件
 * - 数据序列化为 JSON 失败
 * - 数据反序列化失败
 * - 不支持的数据类型
 * - 数据格式损坏
 * 
 * ### 错误处理
 * - 记录序列化失败的详细信息
 * - 提供数据类型建议
 * - 包含原始错误信息用于调试
 * 
 * @example
 * ```typescript
 * // 序列化失败处理
 * try {
 *   const serialized = JSON.stringify(data);
 * } catch (error) {
 *   this.logger.error('缓存序列化失败', undefined, { 
 *     dataType: typeof data,
 *     dataSize: JSON.stringify(data).length 
 *   });
 *   throw new CacheSerializationException('数据序列化失败', error);
 * }
 * ```
 * 
 * @since 1.0.0
 */
export class CacheSerializationException extends HttpException {
  /**
   * 创建缓存序列化异常
   * 
   * @param message 错误消息
   * @param cause 原始错误（可选）
   */
  constructor(message: string, cause?: Error) {
    super(
      {
        message,
        error: 'Cache Serialization Error',
        statusCode: HttpStatus.BAD_REQUEST,
        cause: cause?.message,
      },
      HttpStatus.BAD_REQUEST,
    );
    
    // 保存原始错误用于调试
    if (cause) {
      this.cause = cause;
    }
  }
}
