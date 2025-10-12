/**
 * Serializer 单元测试
 */

import { Serializer } from './serializer.util.js';

describe('Serializer', () => {
  describe('serialize', () => {
    it('应该序列化简单对象', () => {
      const obj = { name: 'test', age: 25 };
      
      const result = Serializer.serialize(obj);

      expect(result).toBe(JSON.stringify(obj));
    });

    it('应该序列化嵌套对象', () => {
      const obj = {
        user: {
          name: 'test',
          profile: {
            age: 25,
            city: 'Beijing',
          },
        },
      };

      const result = Serializer.serialize(obj);

      expect(result).toBe(JSON.stringify(obj));
    });

    it('应该序列化数组', () => {
      const arr = [1, 2, 3, 4, 5];

      const result = Serializer.serialize(arr);

      expect(result).toBe(JSON.stringify(arr));
    });

    it('应该序列化 null', () => {
      const result = Serializer.serialize(null);

      expect(result).toBe('null');
    });

    it('应该序列化 undefined 为 undefined', () => {
      const result = Serializer.serialize(undefined);

      // JSON.stringify(undefined) 返回 undefined（不是字符串）
      expect(result).toBeUndefined();
    });

    it('应该处理包含 Date 的对象', () => {
      const date = new Date('2025-01-01');
      const obj = { createdAt: date };

      const result = Serializer.serialize(obj);

      expect(result).toContain('2025-01-01');
    });
  });

  describe('deserialize', () => {
    it('应该反序列化简单对象', () => {
      const json = '{"name":"test","age":25}';

      const result = Serializer.deserialize(json);

      expect(result).toEqual({ name: 'test', age: 25 });
    });

    it('应该反序列化嵌套对象', () => {
      const json = '{"user":{"name":"test","profile":{"age":25}}}';

      const result = Serializer.deserialize(json);

      expect(result).toEqual({
        user: {
          name: 'test',
          profile: { age: 25 },
        },
      });
    });

    it('应该反序列化数组', () => {
      const json = '[1,2,3,4,5]';

      const result = Serializer.deserialize(json);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该反序列化 null', () => {
      const result = Serializer.deserialize('null');

      expect(result).toBeNull();
    });

    it('应该反序列化 Date 对象', () => {
      const date = new Date('2025-01-01');
      const serialized = Serializer.serialize({ createdAt: date });
      
      const result = Serializer.deserialize(serialized);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(date.toISOString());
    });

    it('应该反序列化 Map 对象', () => {
      const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const serialized = Serializer.serialize({ data: map });
      
      const result = Serializer.deserialize(serialized);

      expect(result.data).toBeInstanceOf(Map);
      expect(result.data.get('key1')).toBe('value1');
      expect(result.data.get('key2')).toBe('value2');
    });

    it('应该反序列化 Set 对象', () => {
      const set = new Set([1, 2, 3, 4, 5]);
      const serialized = Serializer.serialize({ data: set });
      
      const result = Serializer.deserialize(serialized);

      expect(result.data).toBeInstanceOf(Set);
      expect(result.data.has(1)).toBe(true);
      expect(result.data.size).toBe(5);
    });

    it('无效 JSON 应该抛出错误', () => {
      expect(() => {
        Serializer.deserialize('invalid json');
      }).toThrow(SyntaxError);
    });

    it('空字符串应该抛出错误', () => {
      expect(() => {
        Serializer.deserialize('');
      }).toThrow(SyntaxError);
    });
  });

  describe('序列化和反序列化循环', () => {
    it('应该正确处理复杂对象的完整循环', () => {
      const original = {
        name: 'test',
        count: 42,
        date: new Date('2025-01-01'),
        tags: new Set(['tag1', 'tag2']),
        metadata: new Map([['key', 'value']]),
      };

      const serialized = Serializer.serialize(original);
      const deserialized = Serializer.deserialize(serialized);

      expect(deserialized.name).toBe(original.name);
      expect(deserialized.count).toBe(original.count);
      expect(deserialized.date).toBeInstanceOf(Date);
      expect(deserialized.tags).toBeInstanceOf(Set);
      expect(deserialized.metadata).toBeInstanceOf(Map);
    });
  });
});

