/**
 * 缓存模块
 *
 * @description 提供 Redis 缓存功能
 *
 * @since 0.2.0
 */

import { Module, DynamicModule, Provider } from '@nestjs/common';
import { CacheService } from './cache.service.js';
import { RedisService, RedisOptions } from './redis.service.js';
import { ConfigValidator } from '../configuration/validators/config.validator.js';
import { CachingModuleConfig } from './config/caching.config.js';

/**
 * 缓存模块选项
 */
export interface CachingModuleOptions {
  /** Redis 连接配置 */
  redis: RedisOptions;
  /** 默认 TTL（秒） */
  defaultTTL?: number;
  /** 缓存键前缀 */
  keyPrefix?: string;
}

/**
 * 缓存模块异步选项
 */
export interface CachingModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<CachingModuleOptions> | CachingModuleOptions;
  inject?: any[];
  imports?: any[];
}

/**
 * 缓存模块
 */
@Module({})
export class CachingModule {
  /**
   * 同步配置缓存模块
   *
   * @param options - 配置选项
   * @returns 动态模块
   * @throws {GeneralBadRequestException} 配置验证失败
   */
  static forRoot(options: CachingModuleOptions): DynamicModule {
    // 验证配置
    const validatedConfig = ConfigValidator.validate(CachingModuleConfig, {
      redis: options.redis,
      ttl: options.defaultTTL,
      keyPrefix: options.keyPrefix,
    });

    const redisService = new RedisService(validatedConfig.redis);

    const providers: Provider[] = [
      {
        provide: RedisService,
        useValue: redisService,
      },
      {
        provide: 'REDIS_CLIENT',
        useFactory: (service: RedisService) => service.getClient(),
        inject: [RedisService],
      },
      {
        provide: 'CACHE_OPTIONS',
        useValue: {
          defaultTTL: validatedConfig.ttl || 3600,
          keyPrefix: validatedConfig.keyPrefix || 'hl8:cache:',
        },
      },
      CacheService,
    ];

    return {
      module: CachingModule,
      providers,
      exports: [CacheService, RedisService],
    };
  }

  /**
   * 异步配置缓存模块
   *
   * @param options - 异步配置选项
   * @returns 动态模块
   */
  static forRootAsync(options: CachingModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'CACHING_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: RedisService,
        useFactory: async (opts: CachingModuleOptions) => {
          const service = new RedisService(opts.redis);
          await service.connect();
          return service;
        },
        inject: ['CACHING_OPTIONS'],
      },
      {
        provide: 'REDIS_CLIENT',
        useFactory: (service: RedisService) => service.getClient(),
        inject: [RedisService],
      },
      {
        provide: 'CACHE_OPTIONS',
        useFactory: (opts: CachingModuleOptions) => ({
          defaultTTL: opts.defaultTTL || 3600,
          keyPrefix: opts.keyPrefix || 'hl8:cache:',
        }),
        inject: ['CACHING_OPTIONS'],
      },
      CacheService,
    ];

    return {
      module: CachingModule,
      imports: options.imports || [],
      providers,
      exports: [CacheService, RedisService],
    };
  }
}

