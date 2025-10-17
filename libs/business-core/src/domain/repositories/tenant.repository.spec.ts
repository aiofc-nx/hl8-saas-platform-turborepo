import { EntityId } from "@hl8/isolation-model";
import { ITenantRepository } from "./tenant.repository.js";
import { TenantAggregate } from "../aggregates/tenant-aggregate.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { IPaginatedResult } from "./base/base-repository.interface.js";

// 模拟租户仓储实现
class MockTenantRepository implements ITenantRepository {
  private tenants = new Map<string, TenantAggregate>();

  async save(tenant: TenantAggregate): Promise<TenantAggregate> {
    this.tenants.set(tenant.id.toString(), tenant);
    return tenant;
  }

  async findById(id: EntityId): Promise<TenantAggregate | null> {
    return this.tenants.get(id.toString()) || null;
  }

  async findByPlatform(platformId: EntityId): Promise<TenantAggregate[]> {
    return Array.from(this.tenants.values()).filter((tenant) =>
      tenant.platformId.equals(platformId),
    );
  }

  async findByType(
    platformId: EntityId,
    type: TenantType,
  ): Promise<TenantAggregate[]> {
    return Array.from(this.tenants.values()).filter(
      (tenant) =>
        tenant.platformId.equals(platformId) && tenant.type.equals(type),
    );
  }

  async findActiveByPlatform(platformId: EntityId): Promise<TenantAggregate[]> {
    return Array.from(this.tenants.values()).filter(
      (tenant) => tenant.platformId.equals(platformId) && tenant.isActive,
    );
  }

  async existsByName(platformId: EntityId, name: string): Promise<boolean> {
    return Array.from(this.tenants.values()).some(
      (tenant) =>
        tenant.platformId.equals(platformId) &&
        tenant.name === name &&
        !tenant.isDeleted,
    );
  }

  async existsById(id: EntityId): Promise<boolean> {
    return this.tenants.has(id.toString());
  }

  async delete(id: EntityId): Promise<void> {
    this.tenants.delete(id.toString());
  }

  async softDelete(id: EntityId): Promise<void> {
    const tenant = this.tenants.get(id.toString());
    if (tenant) {
      tenant.markAsDeleted();
    }
  }

  async restore(id: EntityId): Promise<void> {
    const tenant = this.tenants.get(id.toString());
    if (tenant) {
      tenant.restore();
    }
  }

  async findDeletedByPlatform(
    platformId: EntityId,
  ): Promise<TenantAggregate[]> {
    return Array.from(this.tenants.values()).filter(
      (tenant) => tenant.platformId.equals(platformId) && tenant.isDeleted,
    );
  }

  async countByPlatform(platformId: EntityId): Promise<number> {
    return Array.from(this.tenants.values()).filter((tenant) =>
      tenant.platformId.equals(platformId),
    ).length;
  }

  async countByType(platformId: EntityId, type: TenantType): Promise<number> {
    return Array.from(this.tenants.values()).filter(
      (tenant) =>
        tenant.platformId.equals(platformId) &&
        tenant.type.equals(type) &&
        !tenant.isDeleted,
    ).length;
  }

  async findPaginated(
    platformId: EntityId,
    options: any,
  ): Promise<IPaginatedResult<TenantAggregate>> {
    const tenants = Array.from(this.tenants.values()).filter((tenant) =>
      tenant.platformId.equals(platformId),
    );

    return {
      data: tenants,
      total: tenants.length,
      page: 1,
      limit: 10,
      hasNext: false,
      hasPrev: false,
    };
  }

  async search(
    platformId: EntityId,
    query: string,
  ): Promise<TenantAggregate[]> {
    return Array.from(this.tenants.values()).filter(
      (tenant) =>
        tenant.platformId.equals(platformId) &&
        tenant.name.toLowerCase().includes(query.toLowerCase()),
    );
  }
}

describe("TenantRepository", () => {
  let repository: MockTenantRepository;
  let tenant: TenantAggregate;
  let platformId: EntityId;
  let tenantId: EntityId;

  beforeEach(() => {
    repository = new MockTenantRepository();
    platformId = EntityId.generate();
    tenantId = EntityId.generate();

    // 创建模拟租户聚合根
    tenant = {
      id: tenantId,
      platformId: platformId,
      name: "测试租户",
      type: TenantType.ENTERPRISE,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      version: 1,
      markAsDeleted: jest.fn(),
      restore: jest.fn(),
      equals: jest.fn(),
    } as any;
  });

  describe("保存操作", () => {
    it("应该成功保存租户", async () => {
      const savedTenant = await repository.save(tenant);

      expect(savedTenant).toBe(tenant);
      expect(await repository.existsById(tenantId)).toBe(true);
    });

    it("应该能够更新已存在的租户", async () => {
      await repository.save(tenant);

      const updatedTenant = { ...tenant, name: "更新后的租户" };
      const result = await repository.save(updatedTenant);

      expect(result.name).toBe("更新后的租户");
    });
  });

  describe("查询操作", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该通过ID查找租户", async () => {
      const foundTenant = await repository.findById(tenantId);

      expect(foundTenant).toBe(tenant);
    });

    it("应该返回null当租户不存在时", async () => {
      const nonExistentId = EntityId.generate();
      const foundTenant = await repository.findById(nonExistentId);

      expect(foundTenant).toBeNull();
    });

    it("应该通过平台ID查找租户", async () => {
      const tenants = await repository.findByPlatform(platformId);

      expect(tenants).toHaveLength(1);
      expect(tenants[0]).toBe(tenant);
    });

    it("应该通过类型查找租户", async () => {
      const tenants = await repository.findByType(
        platformId,
        TenantType.ENTERPRISE,
      );

      expect(tenants).toHaveLength(1);
      expect(tenants[0]).toBe(tenant);
    });

    it("应该查找活跃租户", async () => {
      const activeTenants = await repository.findActiveByPlatform(platformId);

      expect(activeTenants).toHaveLength(1);
      expect(activeTenants[0]).toBe(tenant);
    });
  });

  describe("唯一性验证", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该检查租户名称是否存在", async () => {
      const exists = await repository.existsByName(platformId, "测试租户");
      expect(exists).toBe(true);

      const notExists = await repository.existsByName(
        platformId,
        "不存在的租户",
      );
      expect(notExists).toBe(false);
    });

    it("应该检查租户ID是否存在", async () => {
      const exists = await repository.existsById(tenantId);
      expect(exists).toBe(true);

      const nonExistentId = EntityId.generate();
      const notExists = await repository.existsById(nonExistentId);
      expect(notExists).toBe(false);
    });
  });

  describe("删除操作", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该硬删除租户", async () => {
      await repository.delete(tenantId);

      const foundTenant = await repository.findById(tenantId);
      expect(foundTenant).toBeNull();
    });

    it("应该软删除租户", async () => {
      await repository.softDelete(tenantId);

      expect(tenant.markAsDeleted).toHaveBeenCalled();
    });

    it("应该恢复软删除的租户", async () => {
      await repository.softDelete(tenantId);
      await repository.restore(tenantId);

      expect(tenant.restore).toHaveBeenCalled();
    });

    it("应该查找已删除的租户", async () => {
      await repository.softDelete(tenantId);
      const deletedTenants = await repository.findDeletedByPlatform(platformId);

      expect(deletedTenants).toHaveLength(1);
    });
  });

  describe("统计操作", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该统计平台租户数量", async () => {
      const count = await repository.countByPlatform(platformId);
      expect(count).toBe(1);
    });

    it("应该统计特定类型的租户数量", async () => {
      const count = await repository.countByType(
        platformId,
        TenantType.ENTERPRISE,
      );
      expect(count).toBe(1);
    });
  });

  describe("分页查询", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该支持分页查询", async () => {
      const result = await repository.findPaginated(platformId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe("搜索功能", () => {
    beforeEach(async () => {
      await repository.save(tenant);
    });

    it("应该支持按名称搜索", async () => {
      const results = await repository.search(platformId, "测试");
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(tenant);
    });

    it("应该支持大小写不敏感搜索", async () => {
      const results = await repository.search(platformId, "TEST");
      expect(results).toHaveLength(1);
    });

    it("应该返回空结果当搜索无匹配时", async () => {
      const results = await repository.search(platformId, "不存在的");
      expect(results).toHaveLength(0);
    });
  });

  describe("边界情况", () => {
    it("应该处理空平台ID", async () => {
      const emptyPlatformId = EntityId.generate();
      const tenants = await repository.findByPlatform(emptyPlatformId);
      expect(tenants).toHaveLength(0);
    });

    it("应该处理无效的租户ID", async () => {
      const invalidId = EntityId.generate();
      const exists = await repository.existsById(invalidId);
      expect(exists).toBe(false);
    });

    it("应该处理空搜索查询", async () => {
      const results = await repository.search(platformId, "");
      expect(results).toHaveLength(0);
    });
  });

  describe("业务规则验证", () => {
    it("应该确保租户名称在同一平台内唯一", async () => {
      await repository.save(tenant);

      const duplicateTenant = {
        ...tenant,
        id: EntityId.generate(),
      };

      const exists = await repository.existsByName(platformId, "测试租户");
      expect(exists).toBe(true);
    });

    it("应该支持不同平台的同名租户", async () => {
      await repository.save(tenant);

      const differentPlatformId = EntityId.generate();
      const exists = await repository.existsByName(
        differentPlatformId,
        "测试租户",
      );
      expect(exists).toBe(false);
    });
  });
});
