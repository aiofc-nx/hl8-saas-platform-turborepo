/**
 * 缓存失效事件
 *
 * @description 当缓存被删除或失效时触发
 *
 * ## 使用场景
 *
 * - 缓存同步（集群环境）
 * - 审计日志
 * - 性能监控
 * - 缓存依赖更新
 *
 * @example
 * ```typescript
 * const event = new CacheInvalidatedEvent(
 *   cacheKey,
 *   'manual-clear',
 *   { userId: 'u999' }
 * );
 *
 * eventEmitter.emit('cache.invalidated', event);
 * ```
 *
 * @since 1.0.0
 */

import type { CacheKey } from "../value-objects/cache-key.vo.js";

export class CacheInvalidatedEvent {
  /** 事件发生时间 */
  public readonly occurredAt: Date;

  constructor(
    /** 被失效的缓存键 */
    public readonly cacheKey: CacheKey,

    /** 失效原因 */
    public readonly reason: string,

    /** 上下文信息（可选） */
    public readonly context?: Record<string, any>,
  ) {
    this.occurredAt = new Date();
  }

  /**
   * 获取事件名称
   *
   * @returns 事件名称
   */
  getEventName(): string {
    return "cache.invalidated";
  }

  /**
   * 转换为日志格式
   *
   * @returns 日志对象
   */
  toLogFormat(): Record<string, any> {
    return {
      event: this.getEventName(),
      cacheKey: this.cacheKey.toString(),
      level: this.cacheKey.getLevel(),
      reason: this.reason,
      context: this.context,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
