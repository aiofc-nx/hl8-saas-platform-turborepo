/**
 * 创建组织用例单元测试
 *
 * @description 测试创建组织用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { CreateOrganizationUseCase } from "./create-organization.use-case.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import {
  MockOrganizationRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("CreateOrganizationUseCase", () => {
  let useCase: CreateOrganizationUseCase;
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
    useCase = new CreateOrganizationUseCase(
      mockOrganizationRepository,
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
      expect(useCase.useCaseName).toBe("CreateOrganization");
      expect(useCase.useCaseDescription).toBe("创建组织用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["organization:create"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功创建组织", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toBeDefined();
      expect(result.data?.name).toBe(request.name);
      expect(result.data?.type).toBe(request.type);
      expect(result.data?.tenantId).toEqual(context.tenant!.id);
      expect(result.data?.createdAt).toBeDefined();
    });

    it("应该保存组织到仓储", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证组织已保存
      const savedOrganizations =
        mockOrganizationRepository.getAllOrganizations();
      expect(savedOrganizations).toHaveLength(1);

      const savedOrganization = savedOrganizations[0];
      expect(savedOrganization.getOrganization().name).toBe(request.name);
      expect(savedOrganization.getOrganization().type).toBe(request.type);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选字段", async () => {
      // 准备测试数据（不包含可选字段）
      const request = TestDataFactory.createValidCreateOrganizationRequest({
        description: undefined,
        parentId: undefined,
        sortOrder: undefined,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该处理父组织", async () => {
      // 准备测试数据
      const parentId = TestDataFactory.createEntityId();
      const request = TestDataFactory.createValidCreateOrganizationRequest({
        parentId,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝空组织名称", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateOrganizationRequest("empty-name");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_NAME_REQUIRED");
    });

    it("应该拒绝过长的组织名称", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest({
        name: TestDataFactory.createLongOrganizationName(),
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_NAME_TOO_LONG");
    });

    it("应该拒绝空组织类型", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateOrganizationRequest("empty-type");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_TYPE_REQUIRED");
    });

    it("应该拒绝空创建者", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateOrganizationRequest(
          "empty-created-by",
        );
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CREATED_BY_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝重复的组织名称", async () => {
      // 准备测试数据 - 先创建一个组织
      const existingRequest =
        TestDataFactory.createValidCreateOrganizationRequest({
          name: "已存在组织",
        });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的组织到仓储
      const existingOrganizationAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getOrganization: () => ({
          name: "已存在组织",
          type: OrganizationType.DEPARTMENT,
          isActive: true,
        }),
      } as any;

      mockOrganizationRepository.save(existingOrganizationAggregate);

      // 尝试创建重复名称的组织
      const duplicateRequest =
        TestDataFactory.createDuplicateOrganizationNameRequest("已存在组织");

      // 执行用例并验证异常
      const result = await useCase.execute(duplicateRequest, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RESOURCE_ALREADY_EXISTS");
    });

    it("应该允许不同父组织下的同名组织", async () => {
      // 准备测试数据
      const parentId1 = TestDataFactory.createEntityId();
      const parentId2 = TestDataFactory.createEntityId();

      // 先创建一个组织
      const existingRequest =
        TestDataFactory.createValidCreateOrganizationRequest({
          name: "同名组织",
          parentId: parentId1,
        });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的组织到仓储
      const existingOrganizationAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getOrganization: () => ({
          name: "同名组织",
          type: OrganizationType.DEPARTMENT,
          isActive: true,
          parentId: parentId1,
        }),
      } as any;

      mockOrganizationRepository.save(existingOrganizationAggregate);

      // 尝试在不同父组织下创建同名组织
      const duplicateRequest =
        TestDataFactory.createValidCreateOrganizationRequest({
          name: "同名组织",
          parentId: parentId2,
        });

      // 执行用例
      const result = await useCase.execute(duplicateRequest, context);

      // 应该成功，因为父组织不同
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 数据转换", () => {
    it("应该去除组织名称的前后空格", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest({
        name: "  测试组织  ",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("测试组织");
    });

    it("应该处理空描述", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest({
        description: "",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求组织创建权限", async () => {
      // 准备测试数据 - 没有权限的上下文
      const request = TestDataFactory.createValidCreateOrganizationRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户创建组织", async () => {
      // 准备测试数据 - 有权限的上下文
      const request = TestDataFactory.createValidCreateOrganizationRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["organization:create"],
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
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
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
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
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
      // 准备测试数据
      const request = TestDataFactory.createValidCreateOrganizationRequest();
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
});
