/**
 * 缓存服务实现
 *
 * @description 实现缓存操作功能，支持数据的缓存、获取、删除等操作
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
 * // 创建缓存服务
 * const cacheService = new CacheService(logger);
 *
 * // 获取缓存数据
 * const user = await cacheService.get<User>('user:123');
 *
 * // 设置缓存数据
 * await cacheService.set('user:123', user, 300);
 * ```
 *
 * @since 1.0.0
 */

import type { ICacheService, CacheStats } from "./cache-service.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * 缓存服务实现
 *
 * @description 实现缓存操作功能，支持数据的缓存、获取、删除等操作
 */
export class CacheService implements ICacheService {
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly logger: FastifyLoggerService;
  private readonly defaultTtl: number = 300; // 5分钟
  private readonly maxSize: number = 10000; // 最大缓存项数量
  private hits = 0;
  private misses = 0;
  private operations = 0;

  constructor(logger: FastifyLoggerService, defaultTtl = 300, maxSize = 10000) {
    this.logger = logger;
    this.defaultTtl = defaultTtl;
    this.maxSize = maxSize;

    // 启动清理任务
    this.startCleanupTask();
  }

  /**
   * 获取缓存数据
   *
   * @description 从缓存中获取指定键的数据
   *
   * @param key - 缓存键
   * @returns Promise<T | null> 缓存数据，如果不存在返回null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      this.operations++;

      const item = this.cache.get(key);
      if (!item) {
        this.misses++;
        this.logger.debug(`缓存未命中: ${key}`);
        return null;
      }

      // 检查是否过期
      if (this.isExpired(item)) {
        this.cache.delete(key);
        this.misses++;
        this.logger.debug(`缓存已过期: ${key}`);
        return null;
      }

      this.hits++;
      this.logger.debug(`缓存命中: ${key}`);
      return item.value as T;
    } catch (error) {
      this.logger.error(`获取缓存失败: ${key}`, { error: error.message });
      return null;
    }
  }

  /**
   * 设置缓存数据
   *
   * @description 将数据存储到缓存中
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（秒），可选
   * @returns Promise<void>
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      this.operations++;

      // 检查缓存大小限制
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }

      const expiresAt = Date.now() + (ttl || this.defaultTtl) * 1000;
      const item: CacheItem<T> = {
        value,
        expiresAt,
        createdAt: Date.now(),
      };

      this.cache.set(key, item);
      this.logger.debug(
        `缓存设置成功: ${key}, TTL: ${ttl || this.defaultTtl}s`,
      );
    } catch (error) {
      this.logger.error(`设置缓存失败: ${key}`, { error: error.message });
      // 缓存失败不应该影响主要业务逻辑
    }
  }

  /**
   * 删除缓存数据
   *
   * @description 从缓存中删除指定键的数据
   *
   * @param key - 缓存键
   * @returns Promise<void>
   */
  async delete(key: string): Promise<void> {
    try {
      this.operations++;

      const deleted = this.cache.delete(key);
      if (deleted) {
        this.logger.debug(`缓存删除成功: ${key}`);
      } else {
        this.logger.debug(`缓存键不存在: ${key}`);
      }
    } catch (error) {
      this.logger.error(`删除缓存失败: ${key}`, { error: error.message });
    }
  }

  /**
   * 清空所有缓存
   *
   * @description 清空所有缓存数据
   *
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    try {
      this.operations++;

      this.cache.clear();
      this.logger.info("缓存已清空");
    } catch (error) {
      this.logger.error("清空缓存失败", { error: error.message });
    }
  }

  /**
   * 检查缓存是否存在
   *
   * @description 检查指定键的缓存是否存在
   *
   * @param key - 缓存键
   * @returns Promise<boolean> 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      this.operations++;

      const item = this.cache.get(key);
      if (!item) {
        return false;
      }

      // 检查是否过期
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`检查缓存存在性失败: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * 获取缓存剩余生存时间
   *
   * @description 获取指定键的缓存剩余生存时间
   *
   * @param key - 缓存键
   * @returns Promise<number> 剩余生存时间（秒），-1表示永不过期，-2表示不存在
   */
  async ttl(key: string): Promise<number> {
    try {
      this.operations++;

      const item = this.cache.get(key);
      if (!item) {
        return -2; // 不存在
      }

      // 检查是否过期
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return -2; // 不存在
      }

      const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
      return Math.max(0, remaining);
    } catch (error) {
      this.logger.error(`获取缓存TTL失败: ${key}`, { error: error.message });
      return -2;
    }
  }

  /**
   * 批量获取缓存数据
   *
   * @description 批量从缓存中获取多个键的数据
   *
   * @param keys - 缓存键列表
   * @returns Promise<Map<string, T>> 缓存数据映射
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      this.operations++;

      const result = new Map<string, T>();

      for (const key of keys) {
        const value = await this.get<T>(key);
        if (value !== null) {
          result.set(key, value);
        }
      }

      this.logger.debug(
        `批量获取缓存: ${keys.length} 个键，命中 ${result.size} 个`,
      );
      return result;
    } catch (error) {
      this.logger.error("批量获取缓存失败", { error: error.message });
      return new Map();
    }
  }

  /**
   * 批量设置缓存数据
   *
   * @description 批量将数据存储到缓存中
   *
   * @param data - 缓存数据映射
   * @param ttl - 生存时间（秒），可选
   * @returns Promise<void>
   */
  async mset<T>(data: Map<string, T>, ttl?: number): Promise<void> {
    try {
      this.operations++;

      for (const [key, value] of data) {
        await this.set(key, value, ttl);
      }

      this.logger.debug(`批量设置缓存: ${data.size} 个键`);
    } catch (error) {
      this.logger.error("批量设置缓存失败", { error: error.message });
    }
  }

  /**
   * 获取缓存统计信息
   *
   * @description 获取缓存的统计信息
   *
   * @returns Promise<CacheStats> 缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      keyCount: this.cache.size,
      memoryUsage: this.calculateMemoryUsage(),
      operations: this.operations,
    };
  }

  /**
   * 检查缓存项是否过期
   *
   * @param item - 缓存项
   * @returns 是否过期
   * @private
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiresAt;
  }

  /**
   * 驱逐最旧的缓存项
   *
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`驱逐最旧缓存项: ${oldestKey}`);
    }
  }

  /**
   * 计算内存使用量
   *
   * @returns 内存使用量（字节）
   * @private
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, item] of this.cache) {
      totalSize += key.length * 2; // 字符串长度 * 2（UTF-16）
      totalSize += JSON.stringify(item).length * 2;
    }

    return totalSize;
  }

  /**
   * 启动清理任务
   *
   * @private
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 清理过期缓存
   *
   * @private
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`清理过期缓存: ${cleanedCount} 个`);
    }
  }
}
