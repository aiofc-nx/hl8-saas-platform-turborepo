/**
 * @CachePut 装饰器
 *
 * @description 始终执行方法并更新缓存
 *
 * ## 业务规则
 *
 * ### 执行策略
 * - 始终执行方法（不检查缓存）
 * - 方法执行成功后更新缓存
 * - 与 @Cacheable 的区别：强制刷新缓存
 *
 * ### 使用场景
 * - 更新数据后同步更新缓存
 * - 定时刷新缓存
 * - 预热缓存
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
 *   @CachePut('user')
 *   async updateUser(id: string, data: UpdateUserDto): Promise<User> {
 *     const user = await this.repository.update(id, data);
 *     // 更新缓存，getUserById 将获取到最新数据
 *     return user;
 *   }
 *
 *   @CachePut('user', {
 *     keyGenerator: (id: string) => id,
 *     ttl: 1800,
 *   })
 *   async refreshUserCache(id: string): Promise<User> {
 *     return this.repository.findOne(id);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { SetMetadata, UseInterceptors, applyDecorators } from "@nestjs/common";
import {
  CACHE_PUT_KEY,
  CacheInterceptor,
  CachePutMetadata,
} from "../interceptors/cache.interceptor.js";

export interface CachePutOptions {
  /**
   * 缓存键生成函数
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
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
   * @description 返回 false 时不更新缓存
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器必须支持任意方法签名（宪章 IX 允许场景）
  condition?: (...args: any[]) => boolean;
}

/**
 * 缓存更新装饰器
 *
 * @param namespace - 命名空间
 * @param options - 更新选项
 * @returns 方法装饰器
 */
export function CachePut(namespace: string, options?: CachePutOptions) {
  const metadata: CachePutMetadata = {
    namespace,
    ...options,
  };

  return applyDecorators(
    SetMetadata(CACHE_PUT_KEY, metadata),
    UseInterceptors(CacheInterceptor),
  );
}
