/**
 * @hl8/caching
 * 
 * 企业级 NestJS Redis 缓存模块
 * 支持多层级数据隔离（平台、租户、组织、部门、用户）
 * 
 * @module @hl8/caching
 * @since 1.0.0
 */

// 模块
export { CachingModule } from './caching.module.js';

// 服务
export { CacheService } from './services/cache.service.js';
export { RedisService } from './services/redis.service.js';

// 值对象
export { CacheKey } from './domain/value-objects/cache-key.vo.js';
export { CacheEntry } from './domain/value-objects/cache-entry.vo.js';

// 枚举
export { CacheLevel } from './types/cache-level.enum.js';

// 类型
export type { CachingModuleOptions, CachingModuleAsyncOptions } from './types/cache-options.interface.js';
export type { RedisOptions } from './types/redis-options.interface.js';

// 配置
export { CachingModuleConfig, RedisConfig } from './config/caching.config.js';

// 领域事件
export { CacheInvalidatedEvent } from './domain/events/cache-invalidated.event.js';
export { CacheLevelInvalidatedEvent } from './domain/events/cache-level-invalidated.event.js';

// 装饰器
export { Cacheable, type CacheableOptions } from './decorators/cacheable.decorator.js';
export { CacheEvict, type CacheEvictOptions } from './decorators/cache-evict.decorator.js';
export { CachePut, type CachePutOptions } from './decorators/cache-put.decorator.js';

// 拦截器（通常不需要导出，装饰器内部使用）
export { CacheInterceptor } from './interceptors/cache.interceptor.js';

// 监控服务
export { CacheMetricsService } from './monitoring/cache-metrics.service.js';

// 监控类型
export type { CacheMetrics } from './types/cache-metrics.interface.js';

// 工具函数
export { serialize, deserialize, isSerializable } from './utils/serializer.util.js';
export { generateKey, sanitizeKey, isValidKey, generatePattern } from './utils/key-generator.util.js';

// 异常类
export { RedisConnectionException, CacheSerializationException } from './exceptions/index.js';

