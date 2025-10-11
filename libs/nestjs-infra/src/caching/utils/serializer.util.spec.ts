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
});

