/**
 * 缓存拦截器
 * 
 * @description 处理 @Cacheable、@CacheEvict、@CachePut 装饰器的核心逻辑
 * 
 * @since 1.0.0
 * @internal
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service.js';

// 元数据键
export const CACHEABLE_KEY = 'cacheable';
export const CACHE_EVICT_KEY = 'cache_evict';
export const CACHE_PUT_KEY = 'cache_put';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器元数据必须支持任意方法签名（宪章 IX 允许场景：高阶函数和装饰器）
export interface CacheableMetadata {
  namespace: string;
  keyGenerator?: (...args: any[]) => string;
  ttl?: number;
  condition?: (...args: any[]) => boolean;
  cacheNull?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器元数据必须支持任意方法签名（宪章 IX 允许场景：高阶函数和装饰器）
export interface CacheEvictMetadata {
  namespace: string;
  keyGenerator?: (...args: any[]) => string;
  allEntries?: boolean;
  beforeInvocation?: boolean;
  condition?: (...args: any[]) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器元数据必须支持任意方法签名（宪章 IX 允许场景：高阶函数和装饰器）
export interface CachePutMetadata {
  namespace: string;
  keyGenerator?: (...args: any[]) => string;
  ttl?: number;
  condition?: (...args: any[]) => boolean;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheableMetadata = this.reflector.get<CacheableMetadata>(
      CACHEABLE_KEY,
      context.getHandler(),
    );
    
    const cacheEvictMetadata = this.reflector.get<CacheEvictMetadata>(
      CACHE_EVICT_KEY,
      context.getHandler(),
    );
    
    const cachePutMetadata = this.reflector.get<CachePutMetadata>(
      CACHE_PUT_KEY,
      context.getHandler(),
    );
    
    // 获取方法参数
    const request = context.switchToHttp().getRequest();
    const args = context.getArgs();
    
    // 处理 @CacheEvict（beforeInvocation = true）
    if (cacheEvictMetadata?.beforeInvocation) {
      return from(this.handleCacheEvict(cacheEvictMetadata, args)).pipe(
        switchMap(() => next.handle()),
      );
    }
    
    // 处理 @Cacheable
    if (cacheableMetadata) {
      return from(this.handleCacheable(cacheableMetadata, args, next));
    }
    
    // 处理 @CachePut
    if (cachePutMetadata) {
      return next.handle().pipe(
        switchMap(async (result) => {
          await this.handleCachePut(cachePutMetadata, args, result);
          return result;
        }),
      );
    }
    
    // 处理 @CacheEvict（afterInvocation，默认）
    if (cacheEvictMetadata && !cacheEvictMetadata.beforeInvocation) {
      return next.handle().pipe(
        tap(async () => {
          await this.handleCacheEvict(cacheEvictMetadata, args);
        }),
      );
    }
    
    return next.handle();
  }
  
  /**
   * 处理 @Cacheable 逻辑
   * 
   * @remarks
   * 使用 any[] 和 any 符合宪章 IX 允许场景：处理任意方法的参数和返回值。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 处理任意方法的参数和返回值（宪章 IX 允许场景）
  private async handleCacheable(
    metadata: CacheableMetadata,
    args: any[],
    next: CallHandler,
  ): Promise<any> {
    // 检查条件
    if (metadata.condition && !metadata.condition(...args)) {
      return next.handle().toPromise();
    }
    
    // 生成缓存键
    const cacheKey = metadata.keyGenerator 
      ? metadata.keyGenerator(...args)
      : this.generateDefaultKey(args);
    
    // 尝试从缓存获取
    const cachedValue = await this.cacheService.get(metadata.namespace, cacheKey);
    
    if (cachedValue !== undefined) {
      this.logger.debug(`缓存命中: ${metadata.namespace}:${cacheKey}`);
      return cachedValue;
    }
    
    // 缓存未命中，执行方法
    const result = await next.handle().toPromise();
    
    // 存储到缓存
    if (result !== null || metadata.cacheNull) {
      await this.cacheService.set(
        metadata.namespace,
        cacheKey,
        result,
        metadata.ttl,
      );
      this.logger.debug(`缓存更新: ${metadata.namespace}:${cacheKey}`);
    }
    
    return result;
  }
  
  /**
   * 处理 @CacheEvict 逻辑
   * 
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：处理任意方法的参数。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 处理任意方法的参数（宪章 IX 允许场景）
  private async handleCacheEvict(
    metadata: CacheEvictMetadata,
    args: any[],
  ): Promise<void> {
    // 检查条件
    if (metadata.condition && !metadata.condition(...args)) {
      return;
    }
    
    if (metadata.allEntries) {
      // 清除所有缓存（根据命名空间）
      await this.cacheService.clear();
      this.logger.debug(`清除所有缓存: ${metadata.namespace}`);
    } else {
      // 清除单个键
      const cacheKey = metadata.keyGenerator
        ? metadata.keyGenerator(...args)
        : this.generateDefaultKey(args);
      
      await this.cacheService.del(metadata.namespace, cacheKey);
      this.logger.debug(`缓存失效: ${metadata.namespace}:${cacheKey}`);
    }
  }
  
  /**
   * 处理 @CachePut 逻辑
   * 
   * @remarks
   * 使用 any[] 和 any 符合宪章 IX 允许场景：处理任意方法的参数和返回值。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 处理任意方法的参数和返回值（宪章 IX 允许场景）
  private async handleCachePut(
    metadata: CachePutMetadata,
    args: any[],
    result: any,
  ): Promise<void> {
    // 检查条件
    if (metadata.condition && !metadata.condition(...args)) {
      return;
    }
    
    // 生成缓存键
    const cacheKey = metadata.keyGenerator
      ? metadata.keyGenerator(...args)
      : this.generateDefaultKey(args);
    
    // 更新缓存
    await this.cacheService.set(
      metadata.namespace,
      cacheKey,
      result,
      metadata.ttl,
    );
    
    this.logger.debug(`缓存强制更新: ${metadata.namespace}:${cacheKey}`);
  }
  
  /**
   * 生成默认缓存键
   * 
   * @private
   * 
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：处理任意方法的参数。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 处理任意方法的参数（宪章 IX 允许场景）
  private generateDefaultKey(args: any[]): string {
    if (args.length === 0) {
      return 'default';
    }
    
    // 使用第一个参数作为键
    const firstArg = args[0];
    
    if (typeof firstArg === 'string' || typeof firstArg === 'number') {
      return String(firstArg);
    }
    
    if (firstArg?.id) {
      return String(firstArg.id);
    }
    
    // 使用 JSON 序列化（简化版）
    return JSON.stringify(firstArg);
  }
}

