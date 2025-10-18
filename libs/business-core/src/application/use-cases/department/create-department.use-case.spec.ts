/**
 * 创建部门用例单元测试
 *
 * @description 测试创建部门用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId } from "@hl8/isolation-model";
import { CreateDepartmentUseCase } from "./create-department.use-case.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import {
  MockDepartmentRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("CreateDepartmentUseCase", () => {
  let useCase: CreateDepartmentUseCase;
  let mockDepartmentRepository: MockDepartmentRepository;
  let mockEventBus: MockEventBus;
  let mockTransactionManager: MockTransactionManager;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockDepartmentRepository = new MockDepartmentRepository();
    mockEventBus = new MockEventBus();
    mockTransactionManager = new MockTransactionManager();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new CreateDepartmentUseCase(mockDepartmentRepository, mockLogger);
  });

  afterEach(() => {
    // 清理测试数据
    mockDepartmentRepository.clear();
    mockEventBus.clearEvents();
    mockTransactionManager.reset();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("CreateDepartment");
      expect(useCase.useCaseDescription).toBe("创建部门用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["department:create"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功创建部门", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.departmentId).toBeDefined();
      expect(result.data?.name).toBe(request.name);
      expect(result.data?.level).toBe(request.level);
      expect(result.data?.tenantId).toEqual(context.tenant!.id);
      expect(result.data?.createdAt).toBeDefined();
    });

    it("应该保存部门到仓储", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证部门已保存
      const savedDepartments = mockDepartmentRepository.getAllDepartments();
      expect(savedDepartments).toHaveLength(1);

      const savedDepartment = savedDepartments[0];
      expect(savedDepartment.getDepartment().name).toBe(request.name);
      expect(savedDepartment.getDepartment().level).toBe(request.level);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选字段", async () => {
      // 准备测试数据（不包含可选字段）
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        description: undefined,
        parentId: undefined,
        sortOrder: undefined,
        managerId: undefined,
        code: undefined,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该处理父部门", async () => {
      // 准备测试数据
      const parentId = TestDataFactory.createEntityId();
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        parentId,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该处理部门负责人", async () => {
      // 准备测试数据
      const managerId = TestDataFactory.createEntityId();
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        managerId,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该处理部门编码", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        code: "DEPT001",
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
    it("应该拒绝空部门名称", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateDepartmentRequest("empty-name");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPARTMENT_NAME_REQUIRED");
    });

    it("应该拒绝过长的部门名称", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        name: TestDataFactory.createLongDepartmentName(),
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPARTMENT_NAME_TOO_LONG");
    });

    it("应该拒绝空部门层级", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateDepartmentRequest("empty-level");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPARTMENT_LEVEL_REQUIRED");
    });

    it("应该拒绝空创建者", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateDepartmentRequest(
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
    it("应该拒绝重复的部门名称", async () => {
      // 准备测试数据 - 先创建一个部门
      const _existingRequest =
        TestDataFactory.createValidCreateDepartmentRequest({
          name: "已存在部门",
        });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的部门到仓储
      const existingDepartmentAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getDepartment: () => ({
          name: "已存在部门",
          level: DepartmentLevel.LEVEL_1,
          isActive: true,
        }),
      } as any;

      mockDepartmentRepository.save(existingDepartmentAggregate);

      // 尝试创建重复名称的部门
      const duplicateRequest =
        TestDataFactory.createDuplicateDepartmentNameRequest("已存在部门");

      // 执行用例并验证异常
      const result = await useCase.execute(duplicateRequest, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RESOURCE_ALREADY_EXISTS");
    });

    it("应该允许不同父部门下的同名部门", async () => {
      // 准备测试数据
      const parentId1 = TestDataFactory.createEntityId();
      const parentId2 = TestDataFactory.createEntityId();

      // 先创建一个部门
      const _existingRequest =
        TestDataFactory.createValidCreateDepartmentRequest({
          name: "同名部门",
          parentId: parentId1,
        });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的部门到仓储
      const existingDepartmentAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getDepartment: () => ({
          name: "同名部门",
          level: DepartmentLevel.LEVEL_1,
          isActive: true,
          parentId: parentId1,
        }),
      } as any;

      mockDepartmentRepository.save(existingDepartmentAggregate);

      // 尝试在不同父部门下创建同名部门
      const duplicateRequest =
        TestDataFactory.createValidCreateDepartmentRequest({
          name: "同名部门",
          parentId: parentId2,
        });

      // 执行用例
      const result = await useCase.execute(duplicateRequest, context);

      // 应该成功，因为父部门不同
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 数据转换", () => {
    it("应该去除部门名称的前后空格", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        name: "  测试部门  ",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("测试部门");
    });

    it("应该处理空描述", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        description: "",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该处理空部门编码", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest({
        code: "",
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
    it("应该要求部门创建权限", async () => {
      // 准备测试数据 - 没有权限的上下文
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户创建部门", async () => {
      // 准备测试数据 - 有权限的上下文
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["department:create"],
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
      const request = TestDataFactory.createValidCreateDepartmentRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储保存失败
      const originalSave = mockDepartmentRepository.save;
      mockDepartmentRepository.save = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockDepartmentRepository.save = originalSave;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateDepartmentRequest();
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
      const request = TestDataFactory.createValidCreateDepartmentRequest();
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
