/**
 * 获取组织列表用例单元测试
 *
 * @description 测试获取组织列表用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { GetOrganizationsUseCase } from "./get-organizations.use-case.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import {
  MockOrganizationRepository,
  MockCacheService,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("GetOrganizationsUseCase", () => {
  let useCase: GetOrganizationsUseCase;
  let mockOrganizationRepository: MockOrganizationRepository;
  let mockCacheService: MockCacheService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockOrganizationRepository = new MockOrganizationRepository();
    mockCacheService = new MockCacheService();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new GetOrganizationsUseCase(
      mockOrganizationRepository,
      mockCacheService,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockOrganizationRepository.clear();
    mockCacheService.clear();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("GetOrganizations");
      expect(useCase.useCaseDescription).toBe("获取组织列表用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["organization:read"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功获取组织列表", async () => {
      // 准备测试数据 - 创建多个组织
      await createTestOrganizations(3);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items).toBeDefined();
      expect(result.data?.items.length).toBeGreaterThan(0);
      expect(result.data?.total).toBeGreaterThan(0);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it("应该支持分页查询", async () => {
      // 准备测试数据 - 创建多个组织
      await createTestOrganizations(5);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 2,
        limit: 2,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(2);
      expect(result.data?.hasNext).toBeDefined();
      expect(result.data?.hasPrevious).toBeDefined();
    });

    it("应该支持类型过滤", async () => {
      // 准备测试数据 - 创建不同类型的组织
      await createTestOrganizations(2, OrganizationType.DEPARTMENT);
      await createTestOrganizations(2, OrganizationType.COMMITTEE);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        filters: {
          type: OrganizationType.DEPARTMENT,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items.length).toBe(2);
      expect(
        result.data?.items.every(
          (org) => org.type === OrganizationType.DEPARTMENT,
        ),
      ).toBe(true);
    });

    it("应该支持名称搜索", async () => {
      // 准备测试数据 - 创建不同名称的组织
      await createTestOrganizations(1, OrganizationType.DEPARTMENT, "搜索组织");
      await createTestOrganizations(1, OrganizationType.DEPARTMENT, "其他组织");
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        search: "搜索",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items.length).toBe(1);
      expect(result.data?.items[0].name).toBe("搜索组织");
    });

    it("应该支持排序", async () => {
      // 准备测试数据 - 创建多个组织
      await createTestOrganizations(3);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        sortBy: "name",
        sortOrder: "asc" as const,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items).toBeDefined();
    });

    it("应该从缓存获取数据", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织列表放入缓存
      const cacheKey = `organizations:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedOrganizations = {
        items: [
          {
            organizationId: TestDataFactory.createEntityId(),
            name: "缓存组织1",
            type: OrganizationType.DEPARTMENT,
            tenantId: request.tenantId,
            createdAt: new Date(),
          },
          {
            organizationId: TestDataFactory.createEntityId(),
            name: "缓存组织2",
            type: OrganizationType.COMMITTEE,
            tenantId: request.tenantId,
            createdAt: new Date(),
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      await mockCacheService.set(cacheKey, cachedOrganizations);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.items.length).toBe(2);
    });

    it("应该记录查询日志", async () => {
      // 准备测试数据
      await createTestOrganizations(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证日志记录
      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = {
        tenantId: null as any,
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TENANT_ID_REQUIRED");
    });

    it("应该拒绝无效的页码", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 0,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_PAGE_NUMBER");
    });

    it("应该拒绝无效的每页数量", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 0,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_LIMIT");
    });

    it("应该拒绝过大的每页数量", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 1001,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LIMIT_TOO_LARGE");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求组织读取权限", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户查看组织列表", async () => {
      // 准备测试数据
      await createTestOrganizations(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["organization:read"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 缓存处理", () => {
    it("应该从缓存获取数据时跳过数据库查询", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织列表放入缓存
      const cacheKey = `organizations:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedOrganizations = {
        items: [
          {
            organizationId: TestDataFactory.createEntityId(),
            name: "缓存组织",
            type: OrganizationType.DEPARTMENT,
            tenantId: request.tenantId,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      await mockCacheService.set(cacheKey, cachedOrganizations);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果来自缓存
      expect(result.success).toBe(true);
      expect(result.data?.items.length).toBe(1);
      expect(result.data?.items[0].name).toBe("缓存组织");
    });

    it("应该处理缓存失效的情况", async () => {
      // 准备测试数据
      await createTestOrganizations(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例（不使用缓存）
      const result = await useCase.execute(request, context);

      // 验证结果来自数据库
      expect(result.success).toBe(true);
      expect(result.data?.items.length).toBe(2);
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储查找失败", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储查找失败
      const originalFindByTenantId = mockOrganizationRepository.findByTenantId;
      mockOrganizationRepository.findByTenantId = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockOrganizationRepository.findByTenantId = originalFindByTenantId;
    });

    it("应该处理缓存服务失败", async () => {
      // 准备测试数据
      await createTestOrganizations(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟缓存服务失败
      const originalGet = mockCacheService.get;
      mockCacheService.get = async () => {
        throw new Error("缓存服务连接失败");
      };

      // 执行用例（应该回退到数据库查询）
      const result = await useCase.execute(request, context);

      // 验证成功（从数据库获取）
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 恢复原始方法
      mockCacheService.get = originalGet;
    });
  });

  describe("execute - 性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据
      await createTestOrganizations(10);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 记录开始时间
      const startTime = Date.now();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 记录结束时间
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证成功
      expect(result.success).toBe(true);

      // 验证执行时间（应该在1秒内完成）
      expect(executionTime).toBeLessThan(1000);
    });

    it("应该从缓存获取数据时更快", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织列表放入缓存
      const cacheKey = `organizations:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedOrganizations = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      await mockCacheService.set(cacheKey, cachedOrganizations);

      // 记录开始时间
      const startTime = Date.now();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 记录结束时间
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证成功
      expect(result.success).toBe(true);

      // 验证执行时间（缓存查询应该更快）
      expect(executionTime).toBeLessThan(100);
    });
  });

  /**
   * 创建测试组织
   *
   * @param count - 组织数量
   * @param type - 组织类型
   * @param namePrefix - 名称前缀
   * @returns Promise<void>
   */
  async function createTestOrganizations(
    count: number,
    type: OrganizationType = OrganizationType.DEPARTMENT,
    namePrefix: string = "测试组织",
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      const organizationAggregate = {
        id: EntityId.generate(),
        tenantId: TestDataFactory.createTenantId(),
        getOrganization: () => ({
          id: EntityId.generate(),
          name: `${namePrefix}${i + 1}`,
          type,
          description: `测试组织${i + 1}描述`,
          isActive: true,
          parentId: undefined,
          path: "/",
          sortOrder: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        getUncommittedEvents: () => [],
        markEventsAsCommitted: () => {},
      };

      await mockOrganizationRepository.save(organizationAggregate);
    }
  }
});
