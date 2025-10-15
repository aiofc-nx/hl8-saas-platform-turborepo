/**
 * EntityId 值对象测试
 *
 * @group value-objects
 */

import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import { EntityId } from "./entity-id.vo.js";

// 测试用的具体实现类
class TestEntityId extends EntityId<"TestEntity"> {
  private static cache = new Map<string, TestEntityId>();

  private constructor(value: string) {
    super(value, "TestEntity");
  }

  static create(value: string): TestEntityId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new TestEntityId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

describe("EntityId", () => {
  const validUuid1 = "550e8400-e29b-41d4-a716-446655440000";
  const validUuid2 = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

  beforeEach(() => {
    TestEntityId.clearCache();
  });

  describe("create()", () => {
    it("应该创建有效的 EntityId", () => {
      const id = TestEntityId.create(validUuid1);

      expect(id).toBeInstanceOf(TestEntityId);
      expect(id).toBeInstanceOf(EntityId);
      expect(id.getValue()).toBe(validUuid1);
    });

    it("应该使用 Flyweight 模式", () => {
      const id1 = TestEntityId.create(validUuid1);
      const id2 = TestEntityId.create(validUuid1);

      expect(id1).toBe(id2);
    });
  });

  describe("UUID v4 验证", () => {
    it("应该接受有效的 UUID v4", () => {
      const validUuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "123e4567-e89b-42d3-a456-426614174000",
      ];

      validUuids.forEach((uuid) => {
        expect(() => TestEntityId.create(uuid)).not.toThrow();
      });
    });

    it("应该拒绝非 UUID v4 格式", () => {
      const invalidFormats = [
        "", // 空字符串
        "not-a-uuid", // 非 UUID
        "550e8400-e29b-11d4-a716-446655440000", // UUID v1
        "550e8400-e29b-31d4-a716-446655440000", // UUID v3
        "550e8400-e29b-51d4-a716-446655440000", // UUID v5
        "550e8400-e29b-41d4-a716", // 不完整
        "g50e8400-e29b-41d4-a716-446655440000", // 非十六进制字符
      ];

      invalidFormats.forEach((format) => {
        expect(() => TestEntityId.create(format)).toThrow(
          IsolationValidationError,
        );
      });
    });

    it("应该拒绝 null 和 undefined", () => {
      expect(() => TestEntityId.create(null as any)).toThrow(
        IsolationValidationError,
      );
      expect(() => TestEntityId.create(undefined as any)).toThrow(
        IsolationValidationError,
      );
    });

    it("应该提供正确的错误信息", () => {
      try {
        TestEntityId.create("invalid");
      } catch (error) {
        expect(error).toBeInstanceOf(IsolationValidationError);
        expect((error as IsolationValidationError).code).toBe(
          "INVALID_TESTENTITY_FORMAT",
        );
        expect((error as IsolationValidationError).message).toContain(
          "UUID v4",
        );
      }
    });
  });

  describe("getValue()", () => {
    it("应该返回 UUID 值", () => {
      const id = TestEntityId.create(validUuid1);
      expect(id.getValue()).toBe(validUuid1);
    });
  });

  describe("equals()", () => {
    it("应该正确比较相等的 ID", () => {
      const id1 = TestEntityId.create(validUuid1);
      const id2 = TestEntityId.create(validUuid1);

      expect(id1.equals(id2)).toBe(true);
    });

    it("应该正确比较不同的 ID", () => {
      const id1 = TestEntityId.create(validUuid1);
      const id2 = TestEntityId.create(validUuid2);

      expect(id1.equals(id2)).toBe(false);
    });

    it("应该处理 undefined 和 null", () => {
      const id = TestEntityId.create(validUuid1);

      expect(id.equals(undefined)).toBe(false);
      expect(id.equals(null as any)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("应该返回 UUID 字符串", () => {
      const id = TestEntityId.create(validUuid1);
      expect(id.toString()).toBe(validUuid1);
    });
  });

  describe("clearCache()", () => {
    it("应该清除缓存", () => {
      const id1 = TestEntityId.create(validUuid1);
      TestEntityId.clearCache();
      const id2 = TestEntityId.create(validUuid1);

      // 不同实例
      expect(id1).not.toBe(id2);
      // 但值相等
      expect(id1.equals(id2)).toBe(true);
    });
  });
});
