/**
 * TenantId 值对象单元测试
 *
 * @description 测试租户 ID 值对象的所有功能
 */

import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import { TenantId } from "./tenant-id.vo.js";

describe("TenantId", () => {
  // 测试用的有效 UUID v4
  const validUuid1 = "550e8400-e29b-41d4-a716-446655440000";
  const validUuid2 = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

  // 每个测试前清除缓存
  beforeEach(() => {
    TenantId.clearCache();
  });

  describe("create()", () => {
    it("应该创建有效的 TenantId（UUID v4）", () => {
      const tenantId = TenantId.create(validUuid1);

      expect(tenantId).toBeInstanceOf(TenantId);
      expect(tenantId.getValue()).toBe(validUuid1);
    });

    it("应该支持不同的有效 UUID v4", () => {
      const validUuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-41d1-80b4-00c04fd430c8", // 注意：第3段第1位必须是4（版本）
        "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      ];

      validUuids.forEach((uuid) => {
        const tenantId = TenantId.create(uuid);
        expect(tenantId.getValue()).toBe(uuid);
      });
    });

    it("应该使用 Flyweight 模式缓存实例", () => {
      const id1 = TenantId.create(validUuid1);
      const id2 = TenantId.create(validUuid1);

      // 相同值返回相同实例（引用相等）
      expect(id1).toBe(id2);
      expect(id1 === id2).toBe(true);
    });

    it("应该为不同值创建不同实例", () => {
      const id1 = TenantId.create(validUuid1);
      const id2 = TenantId.create(validUuid2);

      expect(id1).not.toBe(id2);
      expect(id1 === id2).toBe(false);
    });
  });

  describe("UUID v4 验证规则", () => {
    it("应该拒绝空字符串", () => {
      expect(() => TenantId.create("")).toThrow(IsolationValidationError);
      expect(() => TenantId.create("")).toThrow("TenantId 必须是非空字符串");
    });

    it("应该拒绝 null 和 undefined", () => {
      expect(() => TenantId.create(null as any)).toThrow(
        IsolationValidationError,
      );
      expect(() => TenantId.create(undefined as any)).toThrow(
        IsolationValidationError,
      );
    });

    it("应该拒绝非字符串类型", () => {
      expect(() => TenantId.create(123 as any)).toThrow(
        IsolationValidationError,
      );
      expect(() => TenantId.create({} as any)).toThrow(
        IsolationValidationError,
      );
    });

    it("应该拒绝非 UUID 格式的字符串", () => {
      const invalidFormats = [
        "t123", // 简单字符串
        "not-a-uuid", // 非 UUID
        "550e8400-e29b-11d4-a716", // 不完整
        "550e8400-e29b-31d4-a716-446655440000", // UUID v3（非 v4）
        "550e8400-e29b-51d4-a716-446655440000", // UUID v5（非 v4）
      ];

      invalidFormats.forEach((format) => {
        expect(() => TenantId.create(format)).toThrow(IsolationValidationError);
        expect(() => TenantId.create(format)).toThrow(
          "TenantId 必须是有效的 UUID v4 格式",
        );
      });
    });

    it("应该接受有效的 UUID v4", () => {
      const validUuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      ];

      validUuids.forEach((uuid) => {
        expect(() => TenantId.create(uuid)).not.toThrow();
      });
    });

    it("应该验证错误代码正确", () => {
      try {
        TenantId.create("");
      } catch (error) {
        expect(error).toBeInstanceOf(IsolationValidationError);
        expect((error as IsolationValidationError).code).toBe(
          "INVALID_TENANTID",
        );
      }

      try {
        TenantId.create("invalid-uuid");
      } catch (error) {
        expect((error as IsolationValidationError).code).toBe(
          "INVALID_TENANTID_FORMAT",
        );
      }
    });
  });

  describe("getValue()", () => {
    it("应该返回原始值", () => {
      const tenantId = TenantId.create(validUuid1);

      expect(tenantId.getValue()).toBe(validUuid1);
    });

    it("应该返回不可变的值", () => {
      const tenantId = TenantId.create(validUuid1);
      const value1 = tenantId.getValue();
      const value2 = tenantId.getValue();

      expect(value1).toBe(value2);
    });
  });

  describe("equals()", () => {
    it("应该正确比较相等的 TenantId", () => {
      const id1 = TenantId.create(validUuid1);
      const id2 = TenantId.create(validUuid1);

      expect(id1.equals(id2)).toBe(true);
    });

    it("应该正确比较不相等的 TenantId", () => {
      const id1 = TenantId.create(validUuid1);
      const id2 = TenantId.create(validUuid2);

      expect(id1.equals(id2)).toBe(false);
    });

    it("应该处理 undefined", () => {
      const id1 = TenantId.create(validUuid1);

      expect(id1.equals(undefined)).toBe(false);
    });

    it("应该处理 null", () => {
      const id1 = TenantId.create(validUuid1);

      expect(id1.equals(null as any)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("应该返回字符串表示", () => {
      const tenantId = TenantId.create(validUuid1);

      expect(tenantId.toString()).toBe(validUuid1);
    });

    it("应该可以用于字符串拼接", () => {
      const tenantId = TenantId.create(validUuid1);
      const result = `tenant:${tenantId}`;

      expect(result).toBe(`tenant:${validUuid1}`);
    });
  });

  describe("Flyweight 模式性能", () => {
    it("应该缓存常用的 ID", () => {
      // 创建 100 次相同的 ID
      const ids = Array.from({ length: 100 }, () =>
        TenantId.create(validUuid1),
      );

      // 所有实例应该是同一个对象
      const firstId = ids[0];
      ids.forEach((id) => {
        expect(id).toBe(firstId);
      });
    });

    it("clearCache() 应该清除缓存", () => {
      const id1 = TenantId.create(validUuid1);

      TenantId.clearCache();

      const id2 = TenantId.create(validUuid1);

      // 清除缓存后，创建的是新实例
      expect(id1).not.toBe(id2);
      // 但值相等
      expect(id1.equals(id2)).toBe(true);
    });
  });
});
