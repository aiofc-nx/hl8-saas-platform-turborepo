/**
 * 获取部门列表用例单元测试
 *
 * @description 测试获取部门列表用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { GetDepartmentsUseCase } from "./get-departments.use-case.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import {
  MockDepartmentRepository,
  MockCacheService,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("GetDepartmentsUseCase", () => {
  let useCase: GetDepartmentsUseCase;
  let mockDepartmentRepository: MockDepartmentRepository;
  let mockCacheService: MockCacheService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockDepartmentRepository = new MockDepartmentRepository();
    mockCacheService = new MockCacheService();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new GetDepartmentsUseCase(
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
      expect(useCase.useCaseName).toBe("GetDepartments");
      expect(useCase.useCaseDescription).toBe("获取部门列表用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["department:read"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功获取部门列表", async () => {
      // 准备测试数据 - 创建多个部门
      await createTestDepartments(3);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.items).toBeDefined();
      expect(result.data?.items.length).toBeGreaterThan(0);
      expect(result.data?.total).toBeGreaterThan(0);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it("应该支持分页查询", async () => {
      // 准备测试数据 - 创建多个部门
      await createTestDepartments(5);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 2,
        limit: 2,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(2);
      expect(result.data?.hasNext).toBeDefined();
      expect(result.data?.hasPrevious).toBeDefined();
    });

    it("应该支持层级过滤", async () => {
      // 准备测试数据 - 创建不同层级的部门
      await createTestDepartments(2, DepartmentLevel.LEVEL_1);
      await createTestDepartments(2, DepartmentLevel.LEVEL_2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        filters: {
          level: DepartmentLevel.LEVEL_1,
        },
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.items.length).toBe(2);
      expect(
        result.data?.items.every(
          (dept) => dept.level === DepartmentLevel.LEVEL_1,
        ),
      ).toBe(true);
    });

    it("应该支持名称搜索", async () => {
      // 准备测试数据 - 创建不同名称的部门
      await createTestDepartments(1, DepartmentLevel.LEVEL_1, "搜索部门");
      await createTestDepartments(1, DepartmentLevel.LEVEL_1, "其他部门");
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        search: "搜索",
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.items.length).toBe(1);
      expect(result.data?.items[0].name).toBe("搜索部门");
    });

    it("应该支持排序", async () => {
      // 准备测试数据 - 创建多个部门
      await createTestDepartments(3);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
        sortBy: "name",
        sortOrder: "asc" as const,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.items).toBeDefined();
    });

    it("应该从缓存获取数据", async () => {
      // 准备测试数据
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 将部门列表放入缓存
      const cacheKey = `departments:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedDepartments = {
        items: [
          {
            departmentId: TestDataFactory.createEntityId(),
            name: "缓存部门1",
            level: DepartmentLevel.LEVEL_1,
            tenantId: request.tenantId,
            createdAt: new Date(),
          },
          {
            departmentId: TestDataFactory.createEntityId(),
            name: "缓存部门2",
            level: DepartmentLevel.LEVEL_2,
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
      await mockCacheService.set(cacheKey, cachedDepartments);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.data?.items.length).toBe(2);
    });

    it("应该记录查询日志", async () => {
      // 准备测试数据
      await createTestDepartments(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
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
    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = {
        tenantId: null as any,
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LIMIT_TOO_LARGE");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求部门读取权限", async () => {
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

    it("应该允许有权限的用户查看部门列表", async () => {
      // 准备测试数据
      await createTestDepartments(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["department:read"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result).toBeDefined();
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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 将部门列表放入缓存
      const cacheKey = `departments:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedDepartments = {
        items: [
          {
            departmentId: TestDataFactory.createEntityId(),
            name: "缓存部门",
            level: DepartmentLevel.LEVEL_1,
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
      await mockCacheService.set(cacheKey, cachedDepartments);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果来自缓存
      expect(result.success).toBe(true);
      expect(result.data?.items.length).toBe(1);
      expect(result.data?.items[0].name).toBe("缓存部门");
    });

    it("应该处理缓存失效的情况", async () => {
      // 准备测试数据
      await createTestDepartments(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 模拟仓储查找失败
      const originalFindByTenantId = mockDepartmentRepository.findByTenantId;
      mockDepartmentRepository.findByTenantId = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockDepartmentRepository.findByTenantId = originalFindByTenantId;
    });

    it("应该处理缓存服务失败", async () => {
      // 准备测试数据
      await createTestDepartments(2);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
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
      // 准备测试数据
      await createTestDepartments(10);
      const request = {
        tenantId: TestDataFactory.createTenantId(),
        page: 1,
        limit: 10,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
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
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: TestDataFactory.createEntityId(),
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
          permissions: ["department:read"],
        },
      });

      // 将部门列表放入缓存
      const cacheKey = `departments:${request.tenantId.toString()}:${request.page}:${request.limit}`;
      const cachedDepartments = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      await mockCacheService.set(cacheKey, cachedDepartments);

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
   * 创建测试部门
   *
   * @param count - 部门数量
   * @param level - 部门层级
   * @param namePrefix - 名称前缀
   * @returns Promise<void>
   */
  async function createTestDepartments(
    count: number,
    level: DepartmentLevel = DepartmentLevel.LEVEL_1,
    namePrefix: string = "测试部门",
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      const departmentAggregate = {
        id: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
        getDepartment: () => ({
          id: TestDataFactory.createEntityId(),
          name: `${namePrefix}${i + 1}`,
          level,
          description: `测试部门${i + 1}描述`,
          isActive: true,
          parentId: undefined,
          path: "/",
          sortOrder: i,
          managerId: undefined,
          code: `DEPT${i + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        getUncommittedEvents: () => [],
        markEventsAsCommitted: () => {},
      };

      await mockDepartmentRepository.save(departmentAggregate);
    }
  }
});
