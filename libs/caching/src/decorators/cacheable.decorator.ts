/**
 * @Cacheable 装饰器
 *
 * @description 自动缓存方法返回值，缓存命中时直接返回缓存值
 *
 * ## 业务规则
 *
 * ### 缓存策略
 * - 首次调用时执行方法并缓存结果
 * - 后续调用直接返回缓存值
 * - 缓存键自动结合隔离上下文
 *
 * ### 键生成规则
 * - 默认使用第一个参数作为键
 * - 可通过 keyGenerator 自定义
 * - 自动添加隔离上下文前缀
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   @Cacheable('user')
 *   async getUserById(id: string): Promise<User> {
 *     return this.repository.findOne(id);
 *   }
 *
 *   @Cacheable('user', {
 *     keyGenerator: (id: string) => `profile:${id}`,
 *     ttl: 1800,
 *     condition: (id: string) => id !== 'admin',
 *   })
 *   async getUserProfile(id: string): Promise<UserProfile> {
 *     return this.repository.findProfile(id);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { SetMetadata, UseInterceptors, applyDecorators } from "@nestjs/common";
import {
  CACHEABLE_KEY,
  CacheInterceptor,
  CacheableMetadata,
} from "../interceptors/cache.interceptor.js";

export interface CacheableOptions {
  /**
   * 缓存键生成函数
   *
   * @param args - 方法参数
   * @returns 缓存键
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
   * 装饰器必须支持任意方法签名，因此参数类型必须使用 any[]。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器必须支持任意方法签名（宪章 IX 允许场景）
  keyGenerator?: (...args: any[]) => string;

  /**
   * TTL（秒）
   *
   * @default 使用配置的 defaultTTL
   */
  ttl?: number;

  /**
   * 条件函数
   *
   * @description 返回 false 时不缓存
   * @param args - 方法参数
   * @returns true 表示缓存，false 表示不缓存
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器必须支持任意方法签名（宪章 IX 允许场景）
  condition?: (...args: any[]) => boolean;

  /**
   * 是否缓存 null 值
   *
   * @default false
   */
  cacheNull?: boolean;
}

/**
 * 缓存装饰器
 *
 * @param namespace - 命名空间
 * @param options - 缓存选项
 * @returns 方法装饰器
 */
export function Cacheable(namespace: string, options?: CacheableOptions) {
  const metadata: CacheableMetadata = {
    namespace,
    ...options,
  };

  return applyDecorators(
    SetMetadata(CACHEABLE_KEY, metadata),
    UseInterceptors(CacheInterceptor),
  );
}
