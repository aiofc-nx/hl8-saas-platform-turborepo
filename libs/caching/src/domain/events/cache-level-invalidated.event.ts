/**
 * 缓存层级失效事件
 *
 * @description 当整个层级的缓存被清除时触发
 *
 * ## 使用场景
 *
 * - 租户数据清除
 * - 组织重组
 * - 部门解散
 * - 批量缓存失效
 *
 * @example
 * ```typescript
 * // 清除租户的所有缓存
 * const event = new CacheLevelInvalidatedEvent(
 *   CacheLevel.TENANT,
 *   { tenantId: 't123' },
 *   'tenant-deleted'
 * );
 *
 * eventEmitter.emit('cache.level.invalidated', event);
 * ```
 *
 * @since 1.0.0
 */

import { CacheLevel } from '../../types/cache-level.enum.js';

export class CacheLevelInvalidatedEvent {
  /** 事件发生时间 */
  public readonly occurredAt: Date;

  constructor(
    /** 被失效的缓存层级 */
    public readonly level: CacheLevel,

    /** 层级标识符 */
    public readonly identifiers: Record<string, string>,

    /** 失效原因 */
    public readonly reason: string,

    /** 受影响的键数量（可选） */
    public readonly affectedKeys?: number,
  ) {
    this.occurredAt = new Date();
  }

  /**
   * 获取事件名称
   *
   * @returns 事件名称
   */
  getEventName(): string {
    return 'cache.level.invalidated';
  }

  /**
   * 转换为日志格式
   *
   * @returns 日志对象
   */
  toLogFormat(): Record<string, any> {
    return {
      event: this.getEventName(),
      level: this.level,
      identifiers: this.identifiers,
      reason: this.reason,
      affectedKeys: this.affectedKeys,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
