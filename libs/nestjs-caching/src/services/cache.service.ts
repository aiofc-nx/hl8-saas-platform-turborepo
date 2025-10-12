/**
 * 缓存服务
 * 
 * @description 提供多层级隔离的缓存操作服务
 * 
 * ## 业务规则
 * 
 * ### 自动隔离
 * - 自动从 CLS 获取隔离上下文
 * - 自动生成隔离的缓存键
 * - 支持 5 个隔离层级
 * 
 * ### TTL 规则
 * - 使用配置的默认 TTL
 * - 每个操作可覆盖 TTL
 * - 0 表示永不过期
 * 
 * ### 批量操作
 * - 使用 SCAN 避免阻塞
 * - 分批删除（每批 100 个）
 * - 返回删除数量
 * 
 * @since 1.0.0
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IsolationContext } from '@hl8/isolation-model';
import { CacheKey } from '../domain/value-objects/cache-key.vo.js';
import { CacheEntry } from '../domain/value-objects/cache-entry.vo.js';
import { CacheLevel } from '../types/cache-level.enum.js';
import { RedisService } from './redis.service.js';

export const CACHE_OPTIONS = 'CACHE_OPTIONS';

interface CacheServiceOptions {
  ttl?: number;
  keyPrefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL: number;
  private readonly keyPrefix: string;
  
  constructor(
    private readonly redisService: RedisService,
    private readonly cls: ClsService,
    @Inject(CACHE_OPTIONS)
    private readonly options: CacheServiceOptions,
  ) {
    this.defaultTTL = options.ttl ?? 3600;
    this.keyPrefix = options.keyPrefix ?? 'hl8:cache:';
  }
  
  /**
   * 获取缓存
   * 
   * @description 自动根据隔离上下文生成键
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @returns 缓存值或 undefined
   * 
   * @example
   * ```typescript
   * const users = await cacheService.get<User[]>('user', 'list');
   * ```
   */
  async get<T>(namespace: string, key: string): Promise<T | undefined> {
    try {
      const cacheKey = this.buildKey(namespace, key);
      const redis = this.redisService.getClient();
      
      const value = await redis.get(cacheKey.toString());
      
      if (!value) {
        return undefined;
      }
      
      // 反序列化
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`获取缓存失败: ${namespace}:${key}`, error);
      return undefined;
    }
  }
  
  /**
   * 设置缓存
   * 
   * @description 自动根据隔离上下文生成键并序列化值
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param value - 缓存值
   * @param ttl - TTL（秒），不传则使用默认值
   * 
   * @example
   * ```typescript
   * await cacheService.set('user', 'list', users, 1800);
   * ```
   */
  async set<T>(namespace: string, key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.buildKey(namespace, key);
      const entry = CacheEntry.create(
        cacheKey,
        value,
        ttl ?? this.defaultTTL,
        this.logger,
      );
      
      const redis = this.redisService.getClient();
      const serializedValue = entry.getSerializedValue();
      const effectiveTTL = entry.getTTL();
      
      if (effectiveTTL > 0) {
        await redis.setex(cacheKey.toString(), effectiveTTL, serializedValue);
      } else {
        // TTL 为 0，永不过期
        await redis.set(cacheKey.toString(), serializedValue);
      }
      
    } catch (error) {
      this.logger.error(`设置缓存失败: ${namespace}:${key}`, error);
      throw error;
    }
  }
  
  /**
   * 删除缓存
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @returns true 如果删除成功
   */
  async del(namespace: string, key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildKey(namespace, key);
      const redis = this.redisService.getClient();
      
      const result = await redis.del(cacheKey.toString());
      return result > 0;
    } catch (error) {
      this.logger.error(`删除缓存失败: ${namespace}:${key}`, error);
      return false;
    }
  }
  
  /**
   * 检查缓存是否存在
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @returns true 如果存在
   */
  async exists(namespace: string, key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildKey(namespace, key);
      const redis = this.redisService.getClient();
      
      const result = await redis.exists(cacheKey.toString());
      return result === 1;
    } catch (error) {
      this.logger.error(`检查缓存存在性失败: ${namespace}:${key}`, error);
      return false;
    }
  }
  
  /**
   * 清空所有缓存（慎用！）
   * 
   * @returns 删除的键数量
   */
  async clear(): Promise<number> {
    try {
      const redis = this.redisService.getClient();
      
      // 获取所有匹配前缀的键
      const pattern = `${this.keyPrefix}*`;
      return await this.clearByPattern(pattern);
    } catch (error) {
      this.logger.error('清空所有缓存失败', error);
      return 0;
    }
  }
  
  /**
   * 清除租户的所有缓存
   * 
   * @param tenantId - 租户 ID
   * @returns 删除的键数量
   */
  async clearTenantCache(tenantId: string): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}tenant:${tenantId}:*`;
      return await this.clearByPattern(pattern);
    } catch (error) {
      this.logger.error(`清除租户缓存失败: ${tenantId}`, error);
      return 0;
    }
  }
  
  /**
   * 清除组织的所有缓存
   * 
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns 删除的键数量
   */
  async clearOrganizationCache(tenantId: string, organizationId: string): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}tenant:${tenantId}:org:${organizationId}:*`;
      return await this.clearByPattern(pattern);
    } catch (error) {
      this.logger.error(`清除组织缓存失败: ${tenantId}/${organizationId}`, error);
      return 0;
    }
  }
  
  /**
   * 清除部门的所有缓存
   * 
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @returns 删除的键数量
   */
  async clearDepartmentCache(
    tenantId: string,
    organizationId: string,
    departmentId: string,
  ): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}tenant:${tenantId}:org:${organizationId}:dept:${departmentId}:*`;
      return await this.clearByPattern(pattern);
    } catch (error) {
      this.logger.error(`清除部门缓存失败: ${tenantId}/${organizationId}/${departmentId}`, error);
      return 0;
    }
  }
  
  /**
   * 根据模式清除缓存
   * 
   * @description 使用 SCAN 命令避免阻塞，分批删除
   * 
   * @param pattern - 匹配模式
   * @returns 删除的键数量
   * @private
   */
  private async clearByPattern(pattern: string): Promise<number> {
    const redis = this.redisService.getClient();
    let cursor = '0';
    let deletedCount = 0;
    
    do {
      // 使用 SCAN 而非 KEYS，避免阻塞
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100, // 每次扫描 100 个
      );
      
      cursor = nextCursor;
      
      if (keys.length > 0) {
        // 批量删除
        const result = await redis.del(...keys);
        deletedCount += result;
      }
    } while (cursor !== '0');
    
    this.logger.log(`根据模式清除缓存: ${pattern}, 删除 ${deletedCount} 个键`);
    
    return deletedCount;
  }
  
  /**
   * 构建缓存键
   * 
   * @description 根据当前隔离上下文自动生成键
   * 
   * @param namespace - 命名空间
   * @param key - 键名
   * @returns CacheKey 实例
   * @private
   */
  private buildKey(namespace: string, key: string): CacheKey {
    const context = this.getIsolationContext();
    return CacheKey.fromContext(namespace, key, this.keyPrefix, context);
  }
  
  /**
   * 获取隔离上下文
   * 
   * @description 从 CLS 获取，如果没有则返回平台级
   * 
   * @returns 隔离上下文
   * @private
   */
  private getIsolationContext(): IsolationContext {
    const context = this.cls.get<IsolationContext>('ISOLATION_CONTEXT');
    return context ?? IsolationContext.platform();
  }
}

