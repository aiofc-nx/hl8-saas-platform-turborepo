/**
 * @fileoverview 速率限制模块导出
 * 
 * @description
 * 统一导出速率限制模块的所有公共 API
 * 
 * @module security/rate-limit
 */

// 模块
export { RateLimitModule } from './rate-limit.module.js';

// 服务
export { RateLimitService } from './rate-limit.service.js';

// 守卫
export { RateLimitGuard } from './rate-limit.guard.js';

// 装饰器
export {
  RateLimit,
  RateLimitByIp,
  RateLimitByTenant,
  RateLimitByUser,
} from './rate-limit.decorator.js';

// 类型
export type {
  RateLimitOptions,
  RateLimitStrategy,
  RateLimitStatus,
  KeyGenerator,
} from './types/rate-limit-options.js';

export { RateLimitConfig, RATE_LIMIT_METADATA_KEY } from './types/rate-limit-options.js';

