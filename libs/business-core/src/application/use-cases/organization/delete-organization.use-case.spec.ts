/**
 * 删除组织用例单元测试
 *
 * @description 测试删除组织用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { DeleteOrganizationUseCase } from "./delete-organization.use-case.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import {
  MockOrganizationRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("DeleteOrganizationUseCase", () => {
  let useCase: DeleteOrganizationUseCase;
  let mockOrganizationRepository: MockOrganizationRepository;
  let mockEventBus: MockEventBus;
  let mockTransactionManager: MockTransactionManager;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockOrganizationRepository = new MockOrganizationRepository();
    mockEventBus = new MockEventBus();
    mockTransactionManager = new MockTransactionManager();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new DeleteOrganizationUseCase(
      mockOrganizationRepository,
      mockEventBus,
      mockTransactionManager,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockOrganizationRepository.clear();
    mockEventBus.clearEvents();
    mockTransactionManager.reset();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("DeleteOrganization");
      expect(useCase.useCaseDescription).toBe("删除组织用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["organization:delete"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功删除组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toEqual(existingOrganization.id);
      expect(result.data?.deletedAt).toBeDefined();
    });

    it("应该处理软删除", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
        softDelete: true,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.softDelete).toBe(true);
    });

    it("应该处理硬删除", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
        softDelete: false,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.softDelete).toBe(false);
    });

    it("应该从仓储中删除组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证组织已删除
      const savedOrganizations =
        mockOrganizationRepository.getAllOrganizations();
      expect(savedOrganizations).toHaveLength(0);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选删除原因", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: undefined,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝不存在的组织", async () => {
      // 准备测试数据
      const request = {
        organizationId: EntityId.fromString(
          "550e8400-e29b-41d4-a716-446655440999",
        ),
        deletedBy: "admin",
        deleteReason: "组织重组",
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
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_ID_REQUIRED");
    });

    it("应该拒绝空删除者", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DELETED_BY_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝删除有下属部门的组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟有下属部门的情况
      const originalFindByParentId = mockOrganizationRepository.findByParentId;
      mockOrganizationRepository.findByParentId = async () => ({
        items: [{ id: EntityId.generate() }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_HAS_SUB_ORGANIZATIONS");

      // 恢复原始方法
      mockOrganizationRepository.findByParentId = originalFindByParentId;
    });

    it("应该允许删除没有下属部门的组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟没有下属部门的情况
      const originalFindByParentId = mockOrganizationRepository.findByParentId;
      mockOrganizationRepository.findByParentId = async () => ({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 恢复原始方法
      mockOrganizationRepository.findByParentId = originalFindByParentId;
    });

    it("应该检查组织是否已被删除", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟组织已被删除的情况
      const originalGetOrganization = existingOrganization.getOrganization;
      existingOrganization.getOrganization = () => ({
        ...originalGetOrganization(),
        isActive: false,
        deletedAt: new Date(),
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_ALREADY_DELETED");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求组织删除权限", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户删除组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["organization:delete"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储删除失败", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储删除失败
      const originalDelete = mockOrganizationRepository.delete;
      mockOrganizationRepository.delete = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockOrganizationRepository.delete = originalDelete;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟事件发布失败
      const originalPublishAll = mockEventBus.publishAll;
      mockEventBus.publishAll = async () => {
        throw new Error("事件总线连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("事件发布失败");

      // 恢复原始方法
      mockEventBus.publishAll = originalPublishAll;
    });
  });

  describe("execute - 性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        deletedBy: "admin",
        deleteReason: "组织重组",
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
  });

  /**
   * 创建测试组织
   *
   * @param name - 组织名称
   * @returns 组织聚合根
   */
  async function createTestOrganization(
    name: string = "测试组织",
  ): Promise<any> {
    const organizationAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getOrganization: () => ({
        id: TestDataFactory.createEntityId(),
        name,
        type: OrganizationType.DEPARTMENT,
        description: "测试组织描述",
        isActive: true,
        parentId: undefined,
        path: "/",
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockOrganizationRepository.save(organizationAggregate);
    return organizationAggregate;
  }
});
