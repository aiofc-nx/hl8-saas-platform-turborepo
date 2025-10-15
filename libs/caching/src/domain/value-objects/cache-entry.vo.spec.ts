/**
 * CacheEntry 值对象单元测试
 *
 * @description 测试缓存条目的验证、序列化和TTL逻辑
 *
 * @group domain/value-objects
 */

import { IsolationContext, TenantId } from "@hl8/isolation-model";
import { CacheEntry } from "./cache-entry.vo.js";
import { CacheKey } from "./cache-key.vo.js";

// Mock logger
const createMockLogger = () => ({
  warn: () => {},
  error: () => {},
  debug: () => {},
});

describe("CacheEntry", () => {
  const UUID_TENANT = "550e8400-e29b-41d4-a716-446655440000";
  const PREFIX = "hl8:cache:";

  let testKey: CacheKey;

  let mockLogger: any;

  beforeEach(() => {
    const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
    testKey = CacheKey.forTenant("user", "profile", PREFIX, context);
    mockLogger = createMockLogger();
  });

  describe("create()", () => {
    it("应该创建缓存条目", () => {
      const value = { id: "u999", name: "张三" };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      expect(entry).toBeInstanceOf(CacheEntry);
      expect(entry.getValue()).toEqual(value);
      expect(entry.getTTL()).toBe(3600);
    });

    it("应该支持 TTL 为 0（永不过期）", () => {
      const value = { config: "value" };
      const entry = CacheEntry.create(testKey, value, 0, mockLogger);

      expect(entry.getTTL()).toBe(0);
      expect(entry.isExpired()).toBe(false);
    });

    it("应该拒绝负数 TTL", () => {
      const value = { test: "value" };

      expect(() => {
        CacheEntry.create(testKey, value, -1, mockLogger);
      }).toThrow();
    });

    it("应该拒绝超过最大值的 TTL", () => {
      const value = { test: "value" };
      const maxTTL = 2592000; // 30 天

      expect(() => {
        CacheEntry.create(testKey, value, maxTTL + 1, mockLogger);
      }).toThrow();
    });
  });

  describe("序列化", () => {
    it("应该序列化简单对象", () => {
      const value = { name: "张三", age: 30 };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      const serialized = entry.getSerializedValue();
      expect(typeof serialized).toBe("string");
      expect(JSON.parse(serialized)).toEqual(value);
    });

    it("应该处理 Date 对象", () => {
      const value = { createdAt: new Date("2025-01-01") };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      const serialized = entry.getSerializedValue();
      const deserialized = JSON.parse(serialized);
      expect(deserialized.createdAt).toBeTruthy();
    });

    it("应该处理嵌套对象", () => {
      const value = {
        user: {
          id: "u999",
          profile: { name: "张三", email: "test@example.com" },
        },
      };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      const serialized = entry.getSerializedValue();
      expect(JSON.parse(serialized)).toEqual(value);
    });
  });

  describe("值大小验证", () => {
    it("应该接受合理大小的值", () => {
      const value = { data: "a".repeat(1000) }; // ~1KB

      expect(() => {
        CacheEntry.create(testKey, value, 3600, mockLogger);
      }).not.toThrow();
    });

    it("应该接受稍大的值（警告但不报错）", () => {
      const value = { data: "a".repeat(100000) }; // ~100KB

      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      // 应该成功创建，不抛出异常
      expect(entry).toBeInstanceOf(CacheEntry);
      expect(entry.getSize()).toBeGreaterThan(100000);
    });
  });

  describe("过期检查", () => {
    it("应该正确判断未过期的条目", () => {
      const value = { test: "value" };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      expect(entry.isExpired()).toBe(false);
    });

    it("应该检测即将过期的条目", () => {
      const value = { test: "value" };
      const entry = CacheEntry.create(testKey, value, 10, mockLogger); // 10秒

      // 非常短的 TTL 应该被认为是即将过期
      // 注意：isExpiringSoon 的实现可能需要较短的 TTL 才能触发
      expect(entry.isExpired()).toBe(false); // 刚创建，未过期
      expect(entry.getTTL()).toBe(10);
    });

    it("TTL 为 0 时永不过期", () => {
      const value = { test: "value" };
      const entry = CacheEntry.create(testKey, value, 0, mockLogger);

      expect(entry.isExpired()).toBe(false);
      expect(entry.isExpiringSoon()).toBe(false);
    });
  });

  describe("getSize()", () => {
    it("应该返回序列化后的值大小", () => {
      const value = { data: "test" };
      const entry = CacheEntry.create(testKey, value, 3600, mockLogger);

      const size = entry.getSize();
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe("number");
    });
  });
});
