/**
 * 获取部门用例单元测试
 *
 * @description 测试获取部门用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { GetDepartmentUseCase } from "./get-department.use-case.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import {
  MockDepartmentRepository,
  MockCacheService,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("GetDepartmentUseCase", () => {
  let useCase: GetDepartmentUseCase;
  let mockDepartmentRepository: MockDepartmentRepository;
  let mockCacheService: MockCacheService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockDepartmentRepository = new MockDepartmentRepository();
    mockCacheService = new MockCacheService();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new GetDepartmentUseCase(
      mockDepartmentRepository,
      mockCacheService,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockDepartmentRepository.clear();
    mockCacheService.clear();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("GetDepartment");
      expect(useCase.useCaseDescription).toBe("获取部门用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["department:read"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功获取部门信息", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.department).toBeDefined();
      expect(result.department.id).toEqual(existingDepartment.id);
      expect(result.department.name).toBe("测试部门");
      expect(result.department.level).toBe(1);
      expect(result.department.tenantId).toEqual(existingDepartment.tenantId);
      expect(result.department.createdAt).toBeDefined();
    });

    it("应该从缓存获取部门信息", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 将部门信息放入缓存
      const cacheKey = `department:${existingDepartment.id.toString()}`;
      const cachedDepartment = {
        departmentId: existingDepartment.id,
        name: "缓存部门",
        level: DepartmentLevel.LEVEL_1,
        description: "缓存部门描述",
        isActive: true,
        tenantId: existingDepartment.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedDepartment);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.department.id).toEqual(existingDepartment.id);
    });

    it("应该过滤敏感信息", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果不包含敏感信息
      expect(result).toBeDefined();
      expect(result.department).not.toHaveProperty("internalNotes");
      expect(result.department).not.toHaveProperty("confidentialData");
    });

    it("应该记录查询日志", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例
      await useCase.execute(request, context);

      // 验证日志记录
      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝不存在的部门", async () => {
      // 准备测试数据
      const request = {
        departmentId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
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
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Validation Exception",
      );
    });

    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = {
        departmentId: TestDataFactory.createEntityId(),
        tenantId: null as any,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Validation Exception",
      );
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求部门读取权限", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "Unauthorized Operation Exception",
      );
    });

    it("应该允许有权限的用户查看部门信息", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [existingDepartment.id],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result).toBeDefined();
    });

    it("应该允许部门成员查看部门信息", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "member",
          email: "member@example.com",
          role: "USER",
          roles: ["DEPARTMENT_USER"],
          permissions: ["department:read"],
          departments: [existingDepartment.id],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result).toBeDefined();
    });
  });

  describe("execute - 缓存处理", () => {
    it("应该从缓存获取数据时跳过数据库查询", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 将部门信息放入缓存
      const cacheKey = `department:${existingDepartment.id.toString()}:${existingDepartment.tenantId.toString()}`;
      const cachedDepartment = {
        department: {
          id: existingDepartment.id,
          tenantId: existingDepartment.tenantId,
          name: "缓存部门",
          level: 1,
          parentDepartmentId: undefined,
          description: "缓存部门描述",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      await mockCacheService.set(cacheKey, cachedDepartment);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果来自缓存
      expect(result.department.name).toBe("缓存部门");
    });

    it("应该处理缓存失效的情况", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 执行用例（不使用缓存）
      const result = await useCase.execute(request, context);

      // 验证结果来自数据库
      expect(result.department.name).toBe("测试部门");
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储查找失败", async () => {
      // 准备测试数据
      const request = {
        departmentId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 模拟仓储查找失败
      const originalFindById = mockDepartmentRepository.findById;
      mockDepartmentRepository.findById = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      await expect(useCase.execute(request, context)).rejects.toThrow(
        "数据库连接失败",
      );

      // 恢复原始方法
      mockDepartmentRepository.findById = originalFindById;
    });

    it("应该处理缓存服务失败", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 模拟缓存服务失败
      const originalGet = mockCacheService.get;
      mockCacheService.get = async () => {
        throw new Error("缓存服务连接失败");
      };

      // 执行用例（应该回退到数据库查询）
      const result = await useCase.execute(request, context);

      // 验证成功（从数据库获取）
      expect(result).toBeDefined();

      // 恢复原始方法
      mockCacheService.get = originalGet;
    });
  });

  describe("execute - 性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
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
      expect(result.department).toBeDefined();

      // 验证执行时间（应该在1秒内完成）
      expect(executionTime).toBeLessThan(1000);
    });

    it("应该从缓存获取数据时更快", async () => {
      // 准备测试数据 - 先创建一个部门
      const existingDepartment = await createTestDepartment();
      const request = {
        departmentId: existingDepartment.id,
        tenantId: existingDepartment.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
          departments: [TestDataFactory.createEntityId()],
        },
      });

      // 将部门信息放入缓存
      const cacheKey = `department:${existingDepartment.id.toString()}`;
      const cachedDepartment = {
        departmentId: existingDepartment.id,
        name: "缓存部门",
        level: DepartmentLevel.LEVEL_1,
        description: "缓存部门描述",
        isActive: true,
        tenantId: existingDepartment.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedDepartment);

      // 记录开始时间
      const startTime = Date.now();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 记录结束时间
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证成功
      expect(result.department).toBeDefined();

      // 验证执行时间（缓存查询应该更快）
      expect(executionTime).toBeLessThan(100);
    });
  });

  /**
   * 创建测试部门
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 部门聚合根
   */
  async function createTestDepartment(
    overrides: { name?: string; level?: DepartmentLevel } = {},
  ): Promise<any> {
    const departmentAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getDepartment: () => ({
        id: TestDataFactory.createEntityId(),
        name: overrides.name || "测试部门",
        level: { value: overrides.level || DepartmentLevel.LEVEL_1 },
        description: "测试部门描述",
        isActive: true,
        parentId: undefined,
        path: "/",
        sortOrder: 0,
        managerId: undefined,
        code: "DEPT001",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockDepartmentRepository.save(departmentAggregate);
    return departmentAggregate;
  }
});
