/**
 * @CacheEvict 装饰器
 *
 * @description 自动清除缓存
 *
 * ## 业务规则
 *
 * ### 清除时机
 * - 默认在方法执行后清除（afterInvocation）
 * - 可配置为方法执行前清除（beforeInvocation）
 *
 * ### 清除范围
 * - 默认清除单个键
 * - 可配置为清除所有键（allEntries）
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   @CacheEvict('user')
 *   async updateUser(id: string, data: UpdateUserDto): Promise<User> {
 *     return this.repository.update(id, data);
 *   }
 *
 *   @CacheEvict('user', {
 *     keyGenerator: (id: string) => `profile:${id}`,
 *   })
 *   async deleteUser(id: string): Promise<void> {
 *     await this.repository.delete(id);
 *   }
 *
 *   @CacheEvict('user', {
 *     allEntries: true,
 *     beforeInvocation: true,
 *   })
 *   async resetAllUsers(): Promise<void> {
 *     await this.repository.truncate();
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import {
  CACHE_EVICT_KEY,
  CacheEvictMetadata,
  CacheInterceptor,
} from '../interceptors/cache.interceptor.js';

export interface CacheEvictOptions {
  /**
   * 缓存键生成函数
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器必须支持任意方法签名（宪章 IX 允许场景）
  keyGenerator?: (...args: any[]) => string;

  /**
   * 是否清除所有缓存
   *
   * @default false
   */
  allEntries?: boolean;

  /**
   * 是否在方法执行前清除
   *
   * @default false（方法执行后清除）
   */
  beforeInvocation?: boolean;

  /**
   * 条件函数
   *
   * @description 返回 false 时不清除
   *
   * @remarks
   * 使用 any[] 符合宪章 IX 允许场景：高阶函数和装饰器。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 装饰器必须支持任意方法签名（宪章 IX 允许场景）
  condition?: (...args: any[]) => boolean;
}

/**
 * 缓存清除装饰器
 *
 * @param namespace - 命名空间
 * @param options - 清除选项
 * @returns 方法装饰器
 */
export function CacheEvict(namespace: string, options?: CacheEvictOptions) {
  const metadata: CacheEvictMetadata = {
    namespace,
    ...options,
  };

  return applyDecorators(
    SetMetadata(CACHE_EVICT_KEY, metadata),
    UseInterceptors(CacheInterceptor),
  );
}
