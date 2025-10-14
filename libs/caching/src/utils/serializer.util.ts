/**
 * 序列化工具
 *
 * @description 提供缓存值的序列化和反序列化功能
 *
 * ## 业务规则
 *
 * ### 序列化规则
 * - 使用 JSON.stringify 进行序列化
 * - 支持 Date、RegExp、undefined 等特殊类型
 * - 处理循环引用
 *
 * ### 反序列化规则
 * - 使用 JSON.parse 进行反序列化
 * - 自动恢复特殊类型
 * - 错误处理
 *
 * @example
 * ```typescript
 * // 序列化对象
 * const obj = { name: 'John', date: new Date(), regex: /test/g };
 * const serialized = serialize(obj);
 *
 * // 反序列化
 * const deserialized = deserialize<typeof obj>(serialized);
 * console.log(deserialized.date instanceof Date); // true
 * ```
 *
 * @since 1.0.0
 */

import { CacheSerializationException } from '../exceptions/cache-serialization.exception.js';

/**
 * 序列化值为字符串
 *
 * @param value - 要序列化的值
 * @returns 序列化后的字符串
 *
 * @throws {Error} 当值无法序列化时抛出
 *
 * @example
 * ```typescript
 * const obj = {
 *   name: 'John',
 *   age: 30,
 *   createdAt: new Date(),
 * };
 *
 * const serialized = serialize(obj);
 * await redis.set('user:123', serialized);
 * ```
 *
 * @remarks
 * 使用 any 符合宪章 IX 允许场景：通用工具函数必须支持任意类型。
 * 这是序列化函数的标准模式，类似于 JSON.stringify。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 序列化函数必须支持任意类型（宪章 IX 允许场景）
export function serialize(value: any): string {
  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  // 处理基本类型
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  // 处理顶层特殊类型
  if (value instanceof Date) {
    return JSON.stringify({ __type: 'Date', value: value.toISOString() });
  }

  if (value instanceof RegExp) {
    return JSON.stringify({ __type: 'RegExp', value: value.toString() });
  }

  // 处理循环引用
  const seen = new WeakSet();

  return JSON.stringify(value, (key, val) => {
    // 注意：嵌套的 Date/RegExp 会被 JSON.stringify 自动转换
    // 只有顶层的特殊类型需要特殊处理（已在上面处理）

    if (val === undefined) {
      return { __type: 'undefined' };
    }

    // 处理循环引用
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) {
        return { __type: 'CircularReference' };
      }
      seen.add(val);
    }

    return val;
  });
}

/**
 * 反序列化字符串为值
 *
 * @param value - 要反序列化的字符串
 * @returns 反序列化后的值
 *
 * @throws {Error} 当字符串无法反序列化时抛出
 *
 * @example
 * ```typescript
 * const serialized = await redis.get('user:123');
 * if (serialized) {
 *   const user = deserialize<User>(serialized);
 *   console.log(user.name);
 * }
 * ```
 */
export function deserialize<T = any>(value: string): T {
  if (value === 'undefined') {
    return undefined as T;
  }

  if (value === 'null') {
    return null as T;
  }

  try {
    return JSON.parse(value, (key, val) => {
      // 恢复特殊类型
      if (val && typeof val === 'object' && val.__type) {
        switch (val.__type) {
          case 'Date':
            return new Date(val.value);

          case 'RegExp': {
            const match = val.value.match(/^\/(.*)\/([gimuy]*)$/);
            if (match) {
              return new RegExp(match[1], match[2]);
            }
            return new RegExp(val.value);
          }

          case 'undefined':
            return undefined;

          case 'CircularReference':
            return '[Circular]';

          default:
            return val;
        }
      }

      return val;
    });
  } catch (error) {
    throw new CacheSerializationException(
      `反序列化失败: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * 检查值是否可序列化
 *
 * @param value - 要检查的值
 * @returns 如果可序列化返回 true
 *
 * @example
 * ```typescript
 * const obj = { name: 'John' };
 *
 * if (isSerializable(obj)) {
 *   await cacheService.set('user', 'john', obj);
 * }
 * ```
 *
 * @remarks
 * 使用 any 符合宪章 IX 允许场景：通用工具函数必须支持任意类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 检查函数必须支持任意类型（宪章 IX 允许场景）
export function isSerializable(value: any): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  const type = typeof value;

  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  if (type === 'function' || type === 'symbol') {
    return false;
  }

  try {
    serialize(value);
    return true;
  } catch {
    return false;
  }
}
