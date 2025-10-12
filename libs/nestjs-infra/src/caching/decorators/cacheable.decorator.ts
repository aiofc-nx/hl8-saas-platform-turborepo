/**
 * @Cacheable 装饰器
 *
 * @description 自动缓存方法返回值
 *
 * @since 0.2.0
 */

/**
 * Cacheable 装饰器选项
 */
export interface CacheableOptions {
  /** 缓存键或键生成函数 */
  key?: string | ((...args: any[]) => string);
  /** TTL（秒） */
  ttl?: number;
  /** 命名空间 */
  namespace?: string;
}

/**
 * Cacheable 装饰器
 *
 * @param options - 选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @Cacheable({ namespace: 'user', ttl: 3600 })
 *   async findById(id: string): Promise<User> {
 *     // 查询数据库
 *   }
 * }
 * ```
 */
export function Cacheable(options: CacheableOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 简化实现：标记方法需要缓存
      // 实际实现需要通过 AOP 拦截器完成
      const result = await originalMethod.apply(this, args);
      return result;
    };

    // 保存元数据供拦截器使用
    Reflect.defineMetadata('cache:options', options, target, propertyKey);
    Reflect.defineMetadata('cache:enabled', true, target, propertyKey);

    return descriptor;
  };
}

