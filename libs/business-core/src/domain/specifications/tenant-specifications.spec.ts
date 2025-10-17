import {
  TenantActiveSpecification,
  TenantTypeSpecification,
  TenantNameSpecification,
  TenantQuotaSpecification,
  TenantExpiredSpecification,
} from "./tenant-specifications.js";
import { Tenant } from "../entities/tenant/tenant.entity.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { EntityId } from "@hl8/isolation-model";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";

// 模拟Tenant实体
class MockTenant {
  constructor(
    public id: EntityId,
    public name: string,
    public type: TenantType,
    public isActive: boolean = true,
    public quota: number = 100,
    public usedQuota: number = 0,
    public expiresAt?: Date,
  ) {}
}

describe("Tenant Specifications", () => {
  let tenant: MockTenant;
  let auditInfo: IPartialAuditInfo;

  beforeEach(() => {
    tenant = new MockTenant(
      EntityId.generate(),
      "测试租户",
      TenantType.ENTERPRISE,
      true,
      100,
      50,
    );
    auditInfo = { createdBy: "test-user" };
  });

  describe("TenantActiveSpecification", () => {
    let specification: TenantActiveSpecification;

    beforeEach(() => {
      specification = new TenantActiveSpecification();
    });

    it("应该正确识别激活的租户", () => {
      tenant.isActive = true;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该正确识别未激活的租户", () => {
      tenant.isActive = false;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(false);
    });

    it("应该提供正确的错误信息", () => {
      tenant.isActive = false;
      const errorMessage = specification.getErrorMessage(tenant as any);
      expect(errorMessage).toContain("租户");
      expect(errorMessage).toContain("未激活");
    });

    it("应该正确获取规范信息", () => {
      const info = specification.getSpecificationInfo();
      expect(info.name).toBe("TenantActiveSpecification");
      expect(info.description).toBe("租户必须处于激活状态");
      expect(info.category).toBe("tenant");
      expect(info.tags).toContain("tenant");
      expect(info.tags).toContain("status");
      expect(info.tags).toContain("active");
    });
  });

  describe("TenantTypeSpecification", () => {
    let specification: TenantTypeSpecification;

    beforeEach(() => {
      specification = new TenantTypeSpecification(TenantType.ENTERPRISE);
    });

    it("应该正确识别匹配类型的租户", () => {
      tenant.type = TenantType.ENTERPRISE;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该正确识别不匹配类型的租户", () => {
      tenant.type = TenantType.COMMUNITY;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(false);
    });

    it("应该提供正确的错误信息", () => {
      tenant.type = TenantType.COMMUNITY;
      const errorMessage = specification.getErrorMessage(tenant as any);
      expect(errorMessage).toContain("租户类型");
      expect(errorMessage).toContain("ENTERPRISE");
    });

    it("应该正确获取规范信息", () => {
      const info = specification.getSpecificationInfo();
      expect(info.name).toBe("TenantTypeSpecification");
      expect(info.description).toContain("ENTERPRISE");
      expect(info.category).toBe("tenant");
    });
  });

  describe("TenantNameSpecification", () => {
    let specification: TenantNameSpecification;

    beforeEach(() => {
      specification = new TenantNameSpecification("测试租户");
    });

    it("应该正确识别匹配名称的租户", () => {
      tenant.name = "测试租户";
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该正确识别不匹配名称的租户", () => {
      tenant.name = "其他租户";
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(false);
    });

    it("应该提供正确的错误信息", () => {
      tenant.name = "其他租户";
      const errorMessage = specification.getErrorMessage(tenant as any);
      expect(errorMessage).toContain("租户名称");
      expect(errorMessage).toContain("测试租户");
    });

    it("应该正确获取规范信息", () => {
      const info = specification.getSpecificationInfo();
      expect(info.name).toBe("TenantNameSpecification");
      expect(info.description).toContain("测试租户");
      expect(info.category).toBe("tenant");
    });
  });

  describe("TenantQuotaSpecification", () => {
    let specification: TenantQuotaSpecification;

    beforeEach(() => {
      specification = new TenantQuotaSpecification(80);
    });

    it("应该正确识别未超过配额的租户", () => {
      tenant.usedQuota = 50;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该正确识别超过配额的租户", () => {
      tenant.usedQuota = 90;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(false);
    });

    it("应该提供正确的错误信息", () => {
      tenant.usedQuota = 90;
      const errorMessage = specification.getErrorMessage(tenant as any);
      expect(errorMessage).toContain("租户配额");
      expect(errorMessage).toContain("80");
    });

    it("应该正确获取规范信息", () => {
      const info = specification.getSpecificationInfo();
      expect(info.name).toBe("TenantQuotaSpecification");
      expect(info.description).toContain("80");
      expect(info.category).toBe("tenant");
    });
  });

  describe("TenantExpiredSpecification", () => {
    let specification: TenantExpiredSpecification;

    beforeEach(() => {
      specification = new TenantExpiredSpecification();
    });

    it("应该正确识别未过期的租户", () => {
      tenant.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 明天过期
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该正确识别已过期的租户", () => {
      tenant.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 昨天过期
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(false);
    });

    it("应该正确处理没有过期时间的租户", () => {
      tenant.expiresAt = undefined;
      const result = specification.isSatisfiedBy(tenant as any);
      expect(result).toBe(true);
    });

    it("应该提供正确的错误信息", () => {
      tenant.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const errorMessage = specification.getErrorMessage(tenant as any);
      expect(errorMessage).toContain("租户已过期");
    });

    it("应该正确获取规范信息", () => {
      const info = specification.getSpecificationInfo();
      expect(info.name).toBe("TenantExpiredSpecification");
      expect(info.description).toContain("租户未过期");
      expect(info.category).toBe("tenant");
    });
  });

  describe("规范组合", () => {
    it("应该支持AND操作", () => {
      const activeSpec = new TenantActiveSpecification();
      const typeSpec = new TenantTypeSpecification(TenantType.ENTERPRISE);
      const combinedSpec = activeSpec.and(typeSpec);

      tenant.isActive = true;
      tenant.type = TenantType.ENTERPRISE;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(true);

      tenant.isActive = false;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(false);

      tenant.isActive = true;
      tenant.type = TenantType.COMMUNITY;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(false);
    });

    it("应该支持OR操作", () => {
      const activeSpec = new TenantActiveSpecification();
      const typeSpec = new TenantTypeSpecification(TenantType.ENTERPRISE);
      const combinedSpec = activeSpec.or(typeSpec);

      tenant.isActive = true;
      tenant.type = TenantType.COMMUNITY;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(true);

      tenant.isActive = false;
      tenant.type = TenantType.ENTERPRISE;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(true);

      tenant.isActive = false;
      tenant.type = TenantType.COMMUNITY;
      expect(combinedSpec.isSatisfiedBy(tenant as any)).toBe(false);
    });

    it("应该支持NOT操作", () => {
      const activeSpec = new TenantActiveSpecification();
      const notActiveSpec = activeSpec.not();

      tenant.isActive = true;
      expect(notActiveSpec.isSatisfiedBy(tenant as any)).toBe(false);

      tenant.isActive = false;
      expect(notActiveSpec.isSatisfiedBy(tenant as any)).toBe(true);
    });
  });

  describe("边界情况", () => {
    it("应该处理null和undefined", () => {
      const activeSpec = new TenantActiveSpecification();
      expect(activeSpec.isSatisfiedBy(null as any)).toBe(false);
      expect(activeSpec.isSatisfiedBy(undefined as any)).toBe(false);
    });

    it("应该处理无效的租户对象", () => {
      const activeSpec = new TenantActiveSpecification();
      const invalidTenant = {} as any;
      expect(activeSpec.isSatisfiedBy(invalidTenant)).toBe(false);
    });
  });
});
