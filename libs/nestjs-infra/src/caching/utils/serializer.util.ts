/**
 * 数据序列化器
 *
 * @description 提供缓存数据的序列化和反序列化
 *
 * @since 0.2.0
 */

/**
 * 序列化器
 */
export class Serializer {
  /**
   * 序列化数据
   *
   * @param value - 要序列化的值
   * @returns 序列化后的字符串
   *
   * @example
   * ```typescript
   * const json = Serializer.serialize({ name: 'test', date: new Date() });
   * ```
   */
  static serialize(value: any): string {
    return JSON.stringify(value, (key, val) => {
      // 处理 Date 对象
      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() };
      }
      // 处理 Map
      if (val instanceof Map) {
        return { __type: 'Map', value: Array.from(val.entries()) };
      }
      // 处理 Set
      if (val instanceof Set) {
        return { __type: 'Set', value: Array.from(val) };
      }
      return val;
    });
  }

  /**
   * 反序列化数据
   *
   * @param json - JSON 字符串
   * @returns 反序列化后的对象
   *
   * @example
   * ```typescript
   * const obj = Serializer.deserialize<MyType>(json);
   * ```
   */
  static deserialize<T>(json: string): T {
    return JSON.parse(json, (key, value) => {
      // 处理特殊类型
      if (value && typeof value === 'object' && '__type' in value) {
        switch (value.__type) {
          case 'Date':
            return new Date(value.value);
          case 'Map':
            return new Map(value.value);
          case 'Set':
            return new Set(value.value);
        }
      }
      return value;
    });
  }
}

