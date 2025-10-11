/**
 * 配置缓存服务
 *
 * @description 提供配置的内存缓存和更新检测
 *
 * @since 0.3.0
 */

import { Injectable } from '@nestjs/common';

/**
 * 配置缓存服务
 */
@Injectable()
export class ConfigCacheService {
  private cache: Map<string, any> = new Map();
  private timestamps: Map<string, number> = new Map();

  /**
   * 获取缓存的配置
   *
   * @param key - 配置键
   * @returns 配置值，不存在返回 undefined
   */
  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * 设置配置缓存
   *
   * @param key - 配置键
   * @param value - 配置值
   */
  set(key: string, value: any): void {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  /**
   * 检查配置是否存在
   *
   * @param key - 配置键
   * @returns 存在返回 true
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除配置缓存
   *
   * @param key - 配置键
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * 获取配置的更新时间
   *
   * @param key - 配置键
   * @returns 时间戳，不存在返回 undefined
   */
  getTimestamp(key: string): number | undefined {
    return this.timestamps.get(key);
  }

  /**
   * 获取缓存大小
   *
   * @returns 缓存条目数量
   */
  size(): number {
    return this.cache.size;
  }
}

