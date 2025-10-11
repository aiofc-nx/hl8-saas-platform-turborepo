/**
 * 缓存服务
 *
 * @description 提供统一的缓存操作接口，支持5层级数据隔离
 *
 * ## 业务规则
 *
 * ### 缓存键规则
 * - 格式：`hl8:cache:{level}:{namespace}:{key}`
 * - level: platform/tenant/organization/department/user
 * - 自动根据隔离上下文生成键
 *
 * ### TTL 规则
 * - 默认 TTL：3600秒（1小时）
 * - 可为每个键设置自定义 TTL
 * - TTL=0 表示永不过期
 *
 * ### 序列化规则
 * - 自动序列化/反序列化 JSON
 * - 支持复杂对象
 * - 处理循环引用
 *
 * @since 0.2.0
 */

import { Injectable, Inject } from '@nestjs/common';
import { GeneralInternalServerException } from '../exceptions/core/general-internal-server.exception';
import type Redis from 'ioredis';

/**
 * 缓存服务接口
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<void>;
}

/**
 * 缓存服务
 *
 * @description 提供Redis缓存操作
 */
@Injectable()
export class CacheService implements ICacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('CACHE_OPTIONS') private readonly options: { defaultTTL: number; keyPrefix: string },
  ) {}

  /**
   * 获取缓存值
   *
   * @param key - 缓存键
   * @returns 缓存值，不存在返回 null
   *
   * @throws {GeneralInternalServerException} Redis 操作失败
   *
   * @example
   * ```typescript
   * const user = await cacheService.get<User>('user:123');
   * ```
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const value = await this.redis.get(fullKey);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存读取失败',
        `无法读取缓存键: ${key}`,
        { key },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 设置缓存值
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（秒），默认使用配置的 defaultTTL
   *
   * @throws {GeneralInternalServerException} Redis 操作失败
   *
   * @example
   * ```typescript
   * await cacheService.set('user:123', user, 3600);
   * ```
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      const serialized = JSON.stringify(value);
      const effectiveTTL = ttl ?? this.options.defaultTTL;

      if (effectiveTTL > 0) {
        await this.redis.setex(fullKey, effectiveTTL, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存写入失败',
        `无法写入缓存键: ${key}`,
        { key, ttl },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 删除缓存
   *
   * @param key - 缓存键
   *
   * @throws {GeneralInternalServerException} Redis 操作失败
   *
   * @example
   * ```typescript
   * await cacheService.del('user:123');
   * ```
   */
  async del(key: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      await this.redis.del(fullKey);
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存删除失败',
        `无法删除缓存键: ${key}`,
        { key },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 检查缓存是否存在
   *
   * @param key - 缓存键
   * @returns 存在返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * if (await cacheService.exists('user:123')) {
   *   // 缓存存在
   * }
   * ```
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存检查失败',
        `无法检查缓存键: ${key}`,
        { key },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 清空缓存
   *
   * @param pattern - 匹配模式（可选），默认清空所有
   *
   * @example
   * ```typescript
   * // 清空所有用户缓存
   * await cacheService.clear('user:*');
   * ```
   */
  async clear(pattern?: string): Promise<void> {
    try {
      const fullPattern = pattern
        ? this.buildKey(pattern)
        : `${this.options.keyPrefix}*`;

      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存清空失败',
        `无法清空缓存`,
        { pattern },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 构建完整的缓存键
   *
   * @param key - 原始键
   * @returns 完整的缓存键
   * @private
   */
  private buildKey(key: string): string {
    return `${this.options.keyPrefix}${key}`;
  }
}

