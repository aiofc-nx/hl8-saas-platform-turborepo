/**
 * 缓存模块配置接口
 * 
 * @description 定义缓存模块的配置选项
 * 
 * @since 1.0.0
 */

import type { ModuleMetadata, Type } from '@nestjs/common';
import type { RedisOptions } from './redis-options.interface.js';

/**
 * 缓存模块配置选项
 */
export interface CachingModuleOptions {
  /**
   * Redis 配置
   */
  redis: RedisOptions;
  
  /**
   * 默认 TTL（秒）
   * 
   * @default 3600
   */
  ttl?: number;
  
  /**
   * 缓存键前缀
   * 
   * @default 'hl8:cache:'
   */
  keyPrefix?: string;
  
  /**
   * 是否启用调试日志
   * 
   * @default false
   */
  debug?: boolean;
}

/**
 * 缓存模块异步配置选项
 */
export interface CachingModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * 注入依赖
   * 
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：第三方库集成（NestJS 依赖注入模式）。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NestJS 依赖注入模式必须支持任意依赖（宪章 IX 允许场景）
  inject?: any[];
  
  /**
   * 工厂函数
   * 
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：第三方库集成（NestJS 依赖注入模式）。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NestJS 依赖注入模式必须支持任意依赖（宪章 IX 允许场景）
  useFactory?: (...args: any[]) => Promise<CachingModuleOptions> | CachingModuleOptions;
  
  /**
   * 使用类
   */
  useClass?: Type<CachingModuleOptionsFactory>;
  
  /**
   * 使用现有实例
   */
  useExisting?: Type<CachingModuleOptionsFactory>;
}

/**
 * 缓存模块配置工厂接口
 */
export interface CachingModuleOptionsFactory {
  /**
   * 创建缓存模块配置
   */
  createCachingModuleOptions(): Promise<CachingModuleOptions> | CachingModuleOptions;
}

