/**
 * 缓存服务接口
 *
 * @description 定义缓存操作的接口，支持数据的缓存、获取、删除等操作
 *
 * ## 业务规则
 *
 * ### 缓存管理规则
 * - 缓存应该是可选的，缓存失败不应该影响主要业务逻辑
 * - 缓存应该有明确的生存时间（TTL）
 * - 缓存应该支持批量操作
 * - 缓存应该支持键值对存储
 *
 * ### 缓存性能规则
 * - 缓存操作应该是异步的
 * - 缓存操作应该有超时机制
 * - 缓存操作应该有重试机制
 * - 缓存操作应该有监控和日志
 *
 * ### 缓存一致性规则
 * - 缓存失效时应该及时清理
 * - 缓存更新时应该保持一致性
 * - 缓存应该支持版本控制
 * - 缓存应该支持分布式一致性
 *
 * @example
 * ```typescript
 * // 获取缓存数据
 * const cached = await cacheService.get<User>('user:123');
 * if (cached) {
 *   return cached;
 * }
 *
 * // 设置缓存数据
 * await cacheService.set('user:123', user, 300); // 5分钟
 *
 * // 删除缓存数据
 * await cacheService.delete('user:123');
 * ```
 *
 * @since 1.0.0
 */

/**
 * 缓存服务接口
 *
 * @description 定义缓存操作的接口，支持数据的缓存、获取、删除等操作
 */
export interface ICacheService {
  /**
   * 获取缓存数据
   *
   * @description 从缓存中获取指定键的数据
   *
   * @param key - 缓存键
   * @returns Promise<T | null> 缓存数据，如果不存在返回null
   *
   * @example
   * ```typescript
   * const user = await cacheService.get<User>('user:123');
   * ```
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 设置缓存数据
   *
   * @description 将数据存储到缓存中
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（秒），可选
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await cacheService.set('user:123', user, 300); // 5分钟
   * ```
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 删除缓存数据
   *
   * @description 从缓存中删除指定键的数据
   *
   * @param key - 缓存键
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await cacheService.delete('user:123');
   * ```
   */
  delete(key: string): Promise<void>;

  /**
   * 清空所有缓存
   *
   * @description 清空所有缓存数据
   *
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await cacheService.clear();
   * ```
   */
  clear(): Promise<void>;

  /**
   * 检查缓存是否存在
   *
   * @description 检查指定键的缓存是否存在
   *
   * @param key - 缓存键
   * @returns Promise<boolean> 是否存在
   *
   * @example
   * ```typescript
   * const exists = await cacheService.exists('user:123');
   * ```
   */
  exists(key: string): Promise<boolean>;

  /**
   * 获取缓存剩余生存时间
   *
   * @description 获取指定键的缓存剩余生存时间
   *
   * @param key - 缓存键
   * @returns Promise<number> 剩余生存时间（秒），-1表示永不过期，-2表示不存在
   *
   * @example
   * ```typescript
   * const ttl = await cacheService.ttl('user:123');
   * ```
   */
  ttl(key: string): Promise<number>;

  /**
   * 批量获取缓存数据
   *
   * @description 批量从缓存中获取多个键的数据
   *
   * @param keys - 缓存键列表
   * @returns Promise<Map<string, T>> 缓存数据映射
   *
   * @example
   * ```typescript
   * const users = await cacheService.mget<User>(['user:123', 'user:456']);
   * ```
   */
  mget<T>(keys: string[]): Promise<Map<string, T>>;

  /**
   * 批量设置缓存数据
   *
   * @description 批量将数据存储到缓存中
   *
   * @param data - 缓存数据映射
   * @param ttl - 生存时间（秒），可选
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await cacheService.mset(new Map([
   *   ['user:123', user1],
   *   ['user:456', user2]
   * ]), 300);
   * ```
   */
  mset<T>(data: Map<string, T>, ttl?: number): Promise<void>;

  /**
   * 获取缓存统计信息
   *
   * @description 获取缓存的统计信息
   *
   * @returns Promise<CacheStats> 缓存统计信息
   *
   * @example
   * ```typescript
   * const stats = await cacheService.getStats();
   * console.log(`缓存命中率: ${stats.hitRate}%`);
   * ```
   */
  getStats(): Promise<CacheStats>;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number;
  /** 缓存未命中次数 */
  misses: number;
  /** 缓存命中率 */
  hitRate: number;
  /** 缓存键数量 */
  keyCount: number;
  /** 缓存内存使用量（字节） */
  memoryUsage: number;
  /** 缓存操作次数 */
  operations: number;
}
