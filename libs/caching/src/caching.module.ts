/**
 * 缓存模块
 *
 * @description 提供多层级数据隔离的缓存功能
 *
 * ## 功能特性
 *
 * - 自动多层级数据隔离
 * - Redis 作为缓存后端
 * - DDD 充血模型设计
 * - 完整的装饰器支持
 *
 * ## 使用方式
 *
 * ```typescript
 * @Module({
 *   imports: [
 *     CachingModule.forRoot({
 *       redis: {
 *         host: 'localhost',
 *         port: 6379,
 *       },
 *       ttl: 3600,
 *       keyPrefix: 'hl8:cache:',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @since 1.0.0
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import { CacheSerializationException } from './exceptions/cache-serialization.exception.js';
import { CacheInterceptor } from './interceptors/cache.interceptor.js';
import { CacheMetricsService } from './monitoring/cache-metrics.service.js';
import { CACHE_OPTIONS, CacheService } from './services/cache.service.js';
import { REDIS_OPTIONS, RedisService } from './services/redis.service.js';
import type {
  CachingModuleAsyncOptions,
  CachingModuleOptions,
} from './types/cache-options.interface.js';

@Global()
@Module({})
export class CachingModule {
  /**
   * 同步配置缓存模块
   *
   * @param options - 缓存模块配置
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * CachingModule.forRoot({
   *   redis: { host: 'localhost', port: 6379 },
   *   ttl: 3600,
   *   keyPrefix: 'hl8:cache:',
   * })
   * ```
   */
  static forRoot(options: CachingModuleOptions): DynamicModule {
    return {
      module: CachingModule,
      providers: [
        {
          provide: REDIS_OPTIONS,
          useValue: options.redis,
        },
        {
          provide: CACHE_OPTIONS,
          useValue: {
            ttl: options.ttl,
            keyPrefix: options.keyPrefix,
          },
        },
        RedisService,
        CacheService,
        CacheInterceptor,
        CacheMetricsService,
      ],
      exports: [
        RedisService,
        CacheService,
        CacheInterceptor,
        CacheMetricsService,
      ],
    };
  }

  /**
   * 异步配置缓存模块
   *
   * @param options - 异步配置选项
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * CachingModule.forRootAsync({
   *   inject: [ConfigService],
   *   useFactory: (config: ConfigService) => ({
   *     redis: config.get('redis'),
   *     ttl: config.get('cache.ttl'),
   *   }),
   * })
   * ```
   */
  static forRootAsync(options: CachingModuleAsyncOptions): DynamicModule {
    return {
      module: CachingModule,
      imports: options.imports || [],
      providers: [
        {
          provide: REDIS_OPTIONS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NestJS useFactory 模式必须支持任意依赖（宪章 IX 允许场景）
          useFactory: async (...args: any[]) => {
            if (options.useFactory) {
              const config = await options.useFactory(...args);
              return config.redis;
            }
            throw new CacheSerializationException(
              'useFactory is required for async configuration',
            );
          },
          inject: options.inject || [],
        },
        {
          provide: CACHE_OPTIONS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NestJS useFactory 模式必须支持任意依赖（宪章 IX 允许场景）
          useFactory: async (...args: any[]) => {
            if (options.useFactory) {
              const config = await options.useFactory(...args);
              return {
                ttl: config.ttl,
                keyPrefix: config.keyPrefix,
              };
            }
            throw new CacheSerializationException(
              'useFactory is required for async configuration',
            );
          },
          inject: options.inject || [],
        },
        RedisService,
        CacheService,
        CacheInterceptor,
        CacheMetricsService,
      ],
      exports: [
        RedisService,
        CacheService,
        CacheInterceptor,
        CacheMetricsService,
      ],
    };
  }
}
