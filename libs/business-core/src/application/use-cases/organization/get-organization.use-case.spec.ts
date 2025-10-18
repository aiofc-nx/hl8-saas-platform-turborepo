/**
 * 获取组织用例单元测试
 *
 * @description 测试获取组织用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { GetOrganizationUseCase } from "./get-organization.use-case.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import {
  MockOrganizationRepository,
  MockCacheService,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("GetOrganizationUseCase", () => {
  let useCase: GetOrganizationUseCase;
  let mockOrganizationRepository: MockOrganizationRepository;
  let mockCacheService: MockCacheService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockOrganizationRepository = new MockOrganizationRepository();
    mockCacheService = new MockCacheService();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new GetOrganizationUseCase(
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
      expect(useCase.useCaseName).toBe("GetOrganization");
      expect(useCase.useCaseDescription).toBe("获取组织用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["organization:read"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功获取组织信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toEqual(existingOrganization.id);
      expect(result.data?.name).toBe("测试组织");
      expect(result.data?.type).toBe(OrganizationType.DEPARTMENT);
      expect(result.data?.tenantId).toEqual(existingOrganization.tenantId);
      expect(result.data?.createdAt).toBeDefined();
    });

    it("应该从缓存获取组织信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织信息放入缓存
      const cacheKey = `organization:${existingOrganization.id.toString()}`;
      const cachedOrganization = {
        organizationId: existingOrganization.id,
        name: "缓存组织",
        type: OrganizationType.DEPARTMENT,
        description: "缓存组织描述",
        isActive: true,
        tenantId: existingOrganization.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedOrganization);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toEqual(existingOrganization.id);
    });

    it("应该过滤敏感信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果不包含敏感信息
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).not.toHaveProperty("internalNotes");
      expect(result.data).not.toHaveProperty("confidentialData");
    });

    it("应该记录查询日志", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
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
    it("应该拒绝不存在的组织", async () => {
      // 准备测试数据
      const request = {
        organizationId: EntityId.fromString(
          "550e8400-e29b-41d4-a716-446655440999",
        ),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_NOT_FOUND");
    });

    it("应该拒绝空组织ID", async () => {
      // 准备测试数据
      const request = {
        organizationId: null as any,
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_ID_REQUIRED");
    });

    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        tenantId: null as any,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TENANT_ID_REQUIRED");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求组织读取权限", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户查看组织信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
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

    it("应该允许组织成员查看组织信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "member",
          email: "member@example.com",
          role: "USER" as any,
        },
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
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织信息放入缓存
      const cacheKey = `organization:${existingOrganization.id.toString()}`;
      const cachedOrganization = {
        organizationId: existingOrganization.id,
        name: "缓存组织",
        type: OrganizationType.DEPARTMENT,
        description: "缓存组织描述",
        isActive: true,
        tenantId: existingOrganization.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedOrganization);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果来自缓存
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("缓存组织");
    });

    it("应该处理缓存失效的情况", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例（不使用缓存）
      const result = await useCase.execute(request, context);

      // 验证结果来自数据库
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("测试组织");
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储查找失败", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储查找失败
      const originalFindById = mockOrganizationRepository.findById;
      mockOrganizationRepository.findById = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockOrganizationRepository.findById = originalFindById;
    });

    it("应该处理缓存服务失败", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
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
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
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
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        tenantId: existingOrganization.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将组织信息放入缓存
      const cacheKey = `organization:${existingOrganization.id.toString()}`;
      const cachedOrganization = {
        organizationId: existingOrganization.id,
        name: "缓存组织",
        type: OrganizationType.DEPARTMENT,
        description: "缓存组织描述",
        isActive: true,
        tenantId: existingOrganization.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedOrganization);

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
   * @param overrides - 覆盖默认值的属性
   * @returns 组织聚合根
   */
  async function createTestOrganization(
    overrides: { name?: string; type?: OrganizationType } = {},
  ): Promise<any> {
    const organizationAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getOrganization: () => ({
        id: TestDataFactory.createEntityId(),
        name: overrides.name || "测试组织",
        type: overrides.type || OrganizationType.DEPARTMENT,
        description: "测试组织描述",
        isActive: true,
        parentId: undefined,
        path: "/",
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockOrganizationRepository.save(organizationAggregate);
    return organizationAggregate;
  }
});
