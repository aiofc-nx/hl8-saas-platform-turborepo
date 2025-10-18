/**
 * 删除部门用例单元测试
 *
 * @description 测试删除部门用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { DeleteDepartmentUseCase } from "./delete-department.use-case.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import {
  MockDepartmentRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("DeleteDepartmentUseCase", () => {
  let useCase: DeleteDepartmentUseCase;
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
    useCase = new DeleteDepartmentUseCase(
      mockDepartmentRepository,
      mockEventBus,
      mockTransactionManager,
      mockLogger,
    );
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
      expect(useCase.useCaseName).toBe("DeleteDepartment");
      expect(useCase.useCaseDescription).toBe("删除部门用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["department:delete"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功删除部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.departmentId).toEqual(existingDepartment.id);
      expect(result.deletedAt).toBeDefined();
    });

    it("应该处理软删除", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
        softDelete: true,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.softDelete).toBe(true);
    });

    it("应该处理硬删除", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
        softDelete: false,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.softDelete).toBe(false);
    });

    it("应该从仓储中删除部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      await useCase.execute(request, context);

      // 验证部门已删除（软删除，部门仍然存在但被标记为已删除）
      const savedDepartments = mockDepartmentRepository.getAllDepartments();
      expect(savedDepartments).toHaveLength(1);
      expect(savedDepartments[0].isDeleted()).toBe(true);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选删除原因", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: undefined,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝不存在的部门", async () => {
      // 准备测试数据
      const request = {
        departmentId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Resource Not Found Exception",
      );
    });

    it("应该拒绝空部门ID", async () => {
      // 准备测试数据
      const request = {
        departmentId: null as any,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Validation Exception",
      );
    });

    it("应该拒绝空删除者", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Validation Exception",
      );
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝删除有下属部门的部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 模拟有下属部门的情况 - 创建一个特殊的部门对象
      const departmentWithSubDepartments = {
        ...existingDepartment,
        hasSubDepartments: () => true,
      };

      // 模拟仓储返回有下属部门的部门
      const originalFindById = mockDepartmentRepository.findById;
      mockDepartmentRepository.findById = async () =>
        departmentWithSubDepartments;

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Business Rule Violation Exception",
      );

      // 恢复原始方法
      mockDepartmentRepository.findById = originalFindById;
    });

    it("应该允许删除没有下属部门的部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 模拟没有下属部门的情况
      const originalFindByParentId = mockDepartmentRepository.findByParentId;
      mockDepartmentRepository.findByParentId = async () => ({
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
      expect(result).toBeDefined();

      // 恢复原始方法
      mockDepartmentRepository.findByParentId = originalFindByParentId;
    });

    it("应该检查部门是否已被删除", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 模拟部门已被删除的情况 - 创建一个特殊的部门对象
      const deletedDepartment = {
        ...existingDepartment,
        getDepartment: () => ({
          ...existingDepartment.getDepartment(),
          status: "DELETED",
        }),
      };

      // 模拟仓储返回已删除的部门
      const originalFindById = mockDepartmentRepository.findById;
      mockDepartmentRepository.findById = async () => deletedDepartment;

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Business Rule Violation Exception",
      );

      // 恢复原始方法
      mockDepartmentRepository.findById = originalFindById;
    });

    it("应该允许删除没有成员的部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result).toBeDefined();
      expect(result.departmentId).toBeDefined();
      expect(result.deletedBy).toBe("admin");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求部门删除权限", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Unauthorized Operation Exception",
      );
    });

    it("应该允许有权限的用户删除部门", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result).toBeDefined();
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储删除失败", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 模拟仓储保存失败
      const originalSave = mockDepartmentRepository.save;
      mockDepartmentRepository.save = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "数据库连接失败",
      );

      // 恢复原始方法
      mockDepartmentRepository.save = originalSave;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 模拟事件发布失败
      const originalPublishAll = mockEventBus.publishAll;
      mockEventBus.publishAll = async () => {
        throw new Error("事件总线连接失败");
      };

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Business Rule Violation Exception",
      );

      // 恢复原始方法
      mockEventBus.publishAll = originalPublishAll;
    });
  });

  describe("execute - 性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
        deletedBy: "admin",
        deleteReason: "部门重组",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "TENANT_ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:delete"],
        },
      });

      // 记录开始时间
      const startTime = Date.now();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 记录结束时间
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证成功
      expect(result).toBeDefined();

      // 验证执行时间（应该在1秒内完成）
      expect(executionTime).toBeLessThan(1000);
    });
  });

  /**
   * 创建测试部门
   *
   * @param name - 部门名称
   * @returns 部门聚合根
   */
  async function createTestDepartment(name: string = "测试部门"): Promise<any> {
    const departmentAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getDepartment: () => ({
        id: TestDataFactory.createEntityId(),
        name,
        level: DepartmentLevel.LEVEL_1,
        description: "测试部门描述",
        isActive: true,
        parentId: undefined,
        path: "/",
        sortOrder: 0,
        managerId: undefined,
        code: "DEPT001",
        memberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      }),
      getUncommittedEvents: () => [
        {
          type: "DepartmentDeleted",
          departmentId: departmentAggregate.id,
          tenantId: departmentAggregate.tenantId,
          deletedBy: "admin",
          deletedAt: new Date(),
        },
      ],
      markEventsAsCommitted: () => {},
      hasSubDepartments: () => false,
      hasMembers: () => false,
      isDeleted: () => true,
      deleteDepartment: (_deletedBy: string, _deleteReason?: string) => {
        // 模拟删除部门操作
        return true;
      },
    };

    await mockDepartmentRepository.save(departmentAggregate);
    return departmentAggregate;
  }
});
