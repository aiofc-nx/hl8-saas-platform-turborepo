/**
 * 缓存性能指标服务
 * 
 * @description 收集和计算缓存性能指标
 * 
 * ## 业务规则
 * 
 * ### 指标收集规则
 * - 每次缓存操作都应记录指标
 * - 指标数据存储在内存中
 * - 支持手动重置指标
 * 
 * ### 计算规则
 * - 命中率 = hits / (hits + misses)
 * - 平均延迟 = totalLatency / totalOperations
 * - 总操作数 = hits + misses + errors
 * 
 * ### 延迟测量
 * - 记录每次操作的开始和结束时间
 * - 计算时间差（毫秒）
 * - 累加到总延迟
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class CacheService {
 *   constructor(
 *     private readonly metricsService: CacheMetricsService,
 *   ) {}
 *   
 *   async get<T>(namespace: string, key: string): Promise<T | undefined> {
 *     const startTime = Date.now();
 *     
 *     try {
 *       const value = await this.redis.get(key);
 *       const latency = Date.now() - startTime;
 *       
 *       if (value) {
 *         this.metricsService.recordHit(latency);
 *         return JSON.parse(value);
 *       } else {
 *         this.metricsService.recordMiss(latency);
 *         return undefined;
 *       }
 *     } catch (error) {
 *       const latency = Date.now() - startTime;
 *       this.metricsService.recordError(latency);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import type { CacheMetrics } from '../types/cache-metrics.interface.js';

@Injectable()
export class CacheMetricsService {
  private readonly logger = new Logger(CacheMetricsService.name);
  
  private hits = 0;
  private misses = 0;
  private errors = 0;
  private totalLatency = 0;
  
  /**
   * 记录缓存命中
   * 
   * @param latency - 操作延迟（毫秒）
   * 
   * @example
   * ```typescript
   * const startTime = Date.now();
   * const value = await redis.get(key);
   * const latency = Date.now() - startTime;
   * 
   * if (value) {
   *   metricsService.recordHit(latency);
   * }
   * ```
   */
  recordHit(latency: number): void {
    this.hits++;
    this.totalLatency += latency;
    this.logger.debug(`缓存命中 | 延迟: ${latency.toFixed(2)}ms`);
  }
  
  /**
   * 记录缓存未命中
   * 
   * @param latency - 操作延迟（毫秒）
   * 
   * @example
   * ```typescript
   * const startTime = Date.now();
   * const value = await redis.get(key);
   * const latency = Date.now() - startTime;
   * 
   * if (!value) {
   *   metricsService.recordMiss(latency);
   * }
   * ```
   */
  recordMiss(latency: number): void {
    this.misses++;
    this.totalLatency += latency;
    this.logger.debug(`缓存未命中 | 延迟: ${latency.toFixed(2)}ms`);
  }
  
  /**
   * 记录缓存错误
   * 
   * @param latency - 操作延迟（毫秒）
   * 
   * @example
   * ```typescript
   * try {
   *   await redis.get(key);
   * } catch (error) {
   *   const latency = Date.now() - startTime;
   *   metricsService.recordError(latency);
   * }
   * ```
   */
  recordError(latency: number): void {
    this.errors++;
    this.totalLatency += latency;
    this.logger.warn(`缓存错误 | 延迟: ${latency.toFixed(2)}ms`);
  }
  
  /**
   * 获取缓存命中率
   * 
   * @returns 命中率（0-1）
   * 
   * @example
   * ```typescript
   * const hitRate = metricsService.getHitRate();
   * console.log(`命中率: ${(hitRate * 100).toFixed(2)}%`);
   * ```
   */
  getHitRate(): number {
    const totalQueries = this.hits + this.misses;
    if (totalQueries === 0) {
      return 0;
    }
    return this.hits / totalQueries;
  }
  
  /**
   * 获取平均延迟
   * 
   * @returns 平均延迟（毫秒）
   * 
   * @example
   * ```typescript
   * const avgLatency = metricsService.getAverageLatency();
   * console.log(`平均延迟: ${avgLatency.toFixed(2)}ms`);
   * ```
   */
  getAverageLatency(): number {
    const totalOperations = this.hits + this.misses + this.errors;
    if (totalOperations === 0) {
      return 0;
    }
    return this.totalLatency / totalOperations;
  }
  
  /**
   * 获取完整的缓存指标
   * 
   * @returns 缓存指标对象
   * 
   * @example
   * ```typescript
   * const metrics = metricsService.getMetrics();
   * 
   * console.log(`命中: ${metrics.hits}`);
   * console.log(`未命中: ${metrics.misses}`);
   * console.log(`错误: ${metrics.errors}`);
   * console.log(`命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
   * console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
   * console.log(`总操作: ${metrics.totalOperations}`);
   * ```
   */
  getMetrics(): CacheMetrics {
    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      hitRate: this.getHitRate(),
      averageLatency: this.getAverageLatency(),
      totalOperations: this.hits + this.misses + this.errors,
    };
  }
  
  /**
   * 重置所有指标
   * 
   * @description 清空所有缓存指标数据，用于重新开始收集
   * 
   * @example
   * ```typescript
   * // 定时重置指标（每天）
   * @Cron('0 0 * * *')
   * resetMetrics() {
   *   const metrics = this.metricsService.getMetrics();
   *   this.logger.log(`日报 | 命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
   *   this.metricsService.reset();
   * }
   * ```
   */
  reset(): void {
    const metrics = this.getMetrics();
    this.logger.log(`重置指标 | 命中率: ${(metrics.hitRate * 100).toFixed(2)}%, 总操作: ${metrics.totalOperations}`);
    
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.totalLatency = 0;
  }
}

