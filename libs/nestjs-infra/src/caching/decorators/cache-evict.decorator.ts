/**
 * @CacheEvict 装饰器
 *
 * @description 清除缓存
 *
 * @since 0.2.0
 */

/**
 * CacheEvict 装饰器选项
 */
export interface CacheEvictOptions {
  /** 缓存键或键生成函数 */
  key?: string | ((...args: any[]) => string);
  /** 命名空间 */
  namespace?: string;
  /** 是否清空所有 */
  allEntries?: boolean;
}

/**
 * CacheEvict 装饰器
 *
 * @param options - 选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @CacheEvict({ namespace: 'user' })
 *   async update(id: string, data: UpdateUserDto): Promise<User> {
 *     // 更新数据库
 *   }
 * }
 * ```
 */
export function CacheEvict(options: CacheEvictOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      // 简化实现：标记需要清除缓存
      // 实际实现需要通过 AOP 拦截器完成
      return result;
    };

    // 保存元数据
    Reflect.defineMetadata('cache-evict:options', options, target, propertyKey);
    Reflect.defineMetadata('cache-evict:enabled', true, target, propertyKey);

    return descriptor;
  };
}

