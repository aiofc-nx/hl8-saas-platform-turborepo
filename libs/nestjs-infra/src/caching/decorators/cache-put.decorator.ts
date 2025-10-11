/**
 * @CachePut 装饰器
 *
 * @description 更新缓存
 *
 * @since 0.2.0
 */

/**
 * CachePut 装饰器选项
 */
export interface CachePutOptions {
  /** 缓存键或键生成函数 */
  key?: string | ((...args: any[]) => string);
  /** TTL（秒） */
  ttl?: number;
  /** 命名空间 */
  namespace?: string;
}

/**
 * CachePut 装饰器
 *
 * @param options - 选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @CachePut({ namespace: 'user', ttl: 3600 })
 *   async update(id: string, data: UpdateUserDto): Promise<User> {
 *     // 更新数据库
 *     // 返回的用户对象会被自动缓存
 *   }
 * }
 * ```
 */
export function CachePut(options: CachePutOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      // 简化实现：标记需要更新缓存
      // 实际实现需要通过 AOP 拦截器完成
      return result;
    };

    // 保存元数据
    Reflect.defineMetadata('cache-put:options', options, target, propertyKey);
    Reflect.defineMetadata('cache-put:enabled', true, target, propertyKey);

    return descriptor;
  };
}

