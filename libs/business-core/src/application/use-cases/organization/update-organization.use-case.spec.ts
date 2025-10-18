/**
 * 更新组织用例单元测试
 *
 * @description 测试更新组织用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { UpdateOrganizationUseCase } from "./update-organization.use-case.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import {
  MockOrganizationRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("UpdateOrganizationUseCase", () => {
  let useCase: UpdateOrganizationUseCase;
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
    useCase = new UpdateOrganizationUseCase(
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
      expect(useCase.useCaseName).toBe("UpdateOrganization");
      expect(useCase.useCaseDescription).toBe("更新组织用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["organization:update"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功更新组织信息", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        description: "更新后的组织描述",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toEqual(existingOrganization.id);
      expect(result.data?.name).toBe("更新后的组织名称");
      expect(result.data?.description).toBe("更新后的组织描述");
    });

    it("应该更新组织类型", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        type: OrganizationType.COMMITTEE,
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe(OrganizationType.COMMITTEE);
    });

    it("应该保存更新到仓储", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证组织已更新
      const savedOrganizations =
        mockOrganizationRepository.getAllOrganizations();
      expect(savedOrganizations).toHaveLength(1);

      const savedOrganization = savedOrganizations[0];
      expect(savedOrganization.getOrganization().name).toBe("更新后的组织名称");
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理部分更新", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "只更新名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("只更新名称");
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝不存在的组织", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        name: "更新后的组织名称",
        updatedBy: "admin",
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
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_ID_REQUIRED");
    });

    it("应该拒绝空更新者", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UPDATED_BY_REQUIRED");
    });

    it("应该拒绝过长的组织名称", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: TestDataFactory.createLongOrganizationName(),
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_NAME_TOO_LONG");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝重复的组织名称", async () => {
      // 准备测试数据 - 先创建两个组织
      const existingOrganization1 = await createTestOrganization("组织1");
      const existingOrganization2 = await createTestOrganization("组织2");

      // 尝试将组织2的名称改为组织1的名称
      const request = {
        organizationId: existingOrganization2.id,
        name: "组织1",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_NAME_DUPLICATE");
    });

    it("应该允许更新为相同名称", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization("测试组织");
      const request = {
        organizationId: existingOrganization.id,
        name: "测试组织", // 相同名称
        description: "更新描述",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该验证类型变更权限", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        type: OrganizationType.COMMITTEE,
        updatedBy: "user", // 普通用户
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["organization:update"], // 没有类型变更权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });
  });

  describe("execute - 数据转换", () => {
    it("应该去除组织名称的前后空格", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "  更新后的组织名称  ",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("更新后的组织名称");
    });

    it("应该处理空描述", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        description: "",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求组织更新权限", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户更新组织", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["organization:update"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储保存失败", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储保存失败
      const originalSave = mockOrganizationRepository.save;
      mockOrganizationRepository.save = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockOrganizationRepository.save = originalSave;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingOrganization = await createTestOrganization();
      const request = {
        organizationId: existingOrganization.id,
        name: "更新后的组织名称",
        updatedBy: "admin",
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
        name: "更新后的组织名称",
        updatedBy: "admin",
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
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockOrganizationRepository.save(organizationAggregate);
    return organizationAggregate;
  }
});
