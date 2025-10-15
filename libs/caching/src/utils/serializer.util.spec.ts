/**
 * 序列化工具单元测试
 */

import { deserialize, isSerializable, serialize } from "./serializer.util.js";

describe("serializer.util", () => {
  describe("serialize()", () => {
    it("应该序列化字符串", () => {
      const value = "hello";
      const serialized = serialize(value);
      expect(serialized).toBe('"hello"');
    });

    it("应该序列化数字", () => {
      const value = 42;
      const serialized = serialize(value);
      expect(serialized).toBe("42");
    });

    it("应该序列化布尔值", () => {
      const value = true;
      const serialized = serialize(value);
      expect(serialized).toBe("true");
    });

    it("应该序列化 null", () => {
      const value = null;
      const serialized = serialize(value);
      expect(serialized).toBe("null");
    });

    it("应该序列化 undefined", () => {
      const value = undefined;
      const serialized = serialize(value);
      expect(serialized).toBe("undefined");
    });

    it("应该序列化对象", () => {
      const value = { name: "John", age: 30 };
      const serialized = serialize(value);
      expect(JSON.parse(serialized)).toEqual(value);
    });

    it("应该序列化数组", () => {
      const value = [1, 2, 3];
      const serialized = serialize(value);
      expect(JSON.parse(serialized)).toEqual(value);
    });

    it("应该序列化 Date", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const serialized = serialize(date);
      const parsed = JSON.parse(serialized);

      expect(parsed).toHaveProperty("__type", "Date");
      expect(parsed).toHaveProperty("value", date.toISOString());
    });

    it("应该序列化 RegExp", () => {
      const regex = /test/gi;
      const serialized = serialize(regex);
      const parsed = JSON.parse(serialized);

      expect(parsed).toHaveProperty("__type", "RegExp");
      expect(parsed.value).toContain("test");
    });

    // 注意：嵌套的 Date 会被 JSON.stringify 自动转换为 ISO 字符串
    // 这是 JSON 的标准行为，我们只支持顶层的特殊类型

    it("应该处理循环引用", () => {
      const obj: any = { name: "test" };
      obj.self = obj;

      const serialized = serialize(obj);
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe("test");
      expect(parsed.self).toHaveProperty("__type", "CircularReference");
    });
  });

  describe("deserialize()", () => {
    it("应该反序列化字符串", () => {
      const serialized = '"hello"';
      const value = deserialize<string>(serialized);
      expect(value).toBe("hello");
    });

    it("应该反序列化数字", () => {
      const serialized = "42";
      const value = deserialize<number>(serialized);
      expect(value).toBe(42);
    });

    it("应该反序列化布尔值", () => {
      const serialized = "true";
      const value = deserialize<boolean>(serialized);
      expect(value).toBe(true);
    });

    it("应该反序列化 null", () => {
      const serialized = "null";
      const value = deserialize(serialized);
      expect(value).toBe(null);
    });

    it("应该反序列化 undefined", () => {
      const serialized = "undefined";
      const value = deserialize(serialized);
      expect(value).toBe(undefined);
    });

    it("应该反序列化对象", () => {
      const original = { name: "John", age: 30 };
      const serialized = JSON.stringify(original);
      const value = deserialize<typeof original>(serialized);

      expect(value).toEqual(original);
    });

    it("应该反序列化数组", () => {
      const original = [1, 2, 3];
      const serialized = JSON.stringify(original);
      const value = deserialize<number[]>(serialized);

      expect(value).toEqual(original);
    });

    it("应该反序列化 Date", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const serialized = serialize(date);
      const deserialized = deserialize<Date>(serialized);

      expect(deserialized).toBeInstanceOf(Date);
      expect(deserialized.getTime()).toBe(date.getTime());
    });

    it("应该反序列化 RegExp", () => {
      const regex = /test/gi;
      const serialized = serialize(regex);
      const deserialized = deserialize<RegExp>(serialized);

      expect(deserialized).toBeInstanceOf(RegExp);
      expect(deserialized.source).toBe("test");
      expect(deserialized.flags).toContain("g");
      expect(deserialized.flags).toContain("i");
    });

    // 注意：嵌套的 Date 会被 JSON.stringify 自动转换为 ISO 字符串
    // 这是 JSON 的标准行为，我们只支持顶层的特殊类型

    it("应该抛出错误当字符串无效时", () => {
      const invalidJson = "{invalid}";

      expect(() => deserialize(invalidJson)).toThrow();
    });
  });

  describe("serialize() + deserialize()", () => {
    it("应该正确往返字符串", () => {
      const original = "hello world";
      const roundtrip = deserialize(serialize(original));
      expect(roundtrip).toBe(original);
    });

    it("应该正确往返数字", () => {
      const original = 42;
      const roundtrip = deserialize(serialize(original));
      expect(roundtrip).toBe(original);
    });

    it("应该正确往返对象", () => {
      const original = { name: "John", age: 30, active: true };
      const roundtrip = deserialize(serialize(original));
      expect(roundtrip).toEqual(original);
    });

    it("应该正确往返 Date", () => {
      const original = new Date("2024-01-01T00:00:00.000Z");
      const roundtrip = deserialize<Date>(serialize(original));

      expect(roundtrip).toBeInstanceOf(Date);
      expect(roundtrip.toISOString()).toBe(original.toISOString());
    });

    it("应该正确往返 RegExp", () => {
      const original = /test/gi;
      const roundtrip = deserialize<RegExp>(serialize(original));

      expect(roundtrip).toBeInstanceOf(RegExp);
      expect(roundtrip.source).toBe(original.source);
      expect(roundtrip.flags).toBe(original.flags);
    });

    it("应该正确往返对象（不含特殊类型）", () => {
      const original = {
        name: "John",
        age: 30,
        tags: ["developer", "nodejs"],
        metadata: {
          department: "Engineering",
          level: "Senior",
        },
      };

      const roundtrip = deserialize<typeof original>(serialize(original));

      expect(roundtrip).toEqual(original);
    });
  });

  describe("isSerializable()", () => {
    it("应该认为字符串可序列化", () => {
      expect(isSerializable("hello")).toBe(true);
    });

    it("应该认为数字可序列化", () => {
      expect(isSerializable(42)).toBe(true);
    });

    it("应该认为布尔值可序列化", () => {
      expect(isSerializable(true)).toBe(true);
    });

    it("应该认为 null 可序列化", () => {
      expect(isSerializable(null)).toBe(true);
    });

    it("应该认为 undefined 可序列化", () => {
      expect(isSerializable(undefined)).toBe(true);
    });

    it("应该认为对象可序列化", () => {
      expect(isSerializable({ name: "John" })).toBe(true);
    });

    it("应该认为数组可序列化", () => {
      expect(isSerializable([1, 2, 3])).toBe(true);
    });

    it("应该认为函数不可序列化", () => {
      expect(isSerializable(() => {})).toBe(false);
    });

    it("应该认为 Symbol 不可序列化", () => {
      expect(isSerializable(Symbol("test"))).toBe(false);
    });
  });
});
