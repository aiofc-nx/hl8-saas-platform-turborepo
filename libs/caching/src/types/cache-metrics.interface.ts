/**
 * 缓存性能指标接口
 *
 * @description 定义缓存性能监控的指标数据结构
 *
 * ## 指标说明
 *
 * ### 命中率计算
 * - 命中率 = 命中次数 / (命中次数 + 未命中次数)
 * - 范围：0-1
 * - 越接近 1 表示缓存效果越好
 *
 * ### 延迟计算
 * - 平均延迟 = 总延迟时间 / 总操作次数
 * - 单位：毫秒
 *
 * @example
 * ```typescript
 * const metrics: CacheMetrics = {
 *   hits: 850,
 *   misses: 150,
 *   errors: 2,
 *   hitRate: 0.85,
 *   averageLatency: 12.5,
 *   totalOperations: 1000,
 * };
 *
 * console.log(`命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
 * console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
 * ```
 *
 * @since 1.0.0
 */
export interface CacheMetrics {
  /**
   * 缓存命中次数
   *
   * @description 从缓存成功获取数据的次数
   */
  hits: number;

  /**
   * 缓存未命中次数
   *
   * @description 尝试从缓存获取数据但未找到的次数
   */
  misses: number;

  /**
   * 错误次数
   *
   * @description 缓存操作过程中发生错误的次数
   */
  errors: number;

  /**
   * 缓存命中率
   *
   * @description 命中次数占总查询次数的比例
   * @range 0-1
   */
  hitRate: number;

  /**
   * 平均延迟
   *
   * @description 缓存操作的平均响应时间
   * @unit 毫秒
   */
  averageLatency: number;

  /**
   * 总操作次数
   *
   * @description hits + misses + errors
   */
  totalOperations: number;
}
