/**
 * 获取用户用例单元测试
 *
 * @description 测试获取用户用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { GetUserUseCase } from "./get-user.use-case.js";
import { UserRole } from "../../../domain/value-objects/types/user-role.vo.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import {
  MockUserRepository,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

/**
 * 模拟缓存服务
 */
class MockCacheService {
  private cache: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

describe("GetUserUseCase", () => {
  let useCase: GetUserUseCase;
  let mockUserRepository: MockUserRepository;
  let mockCacheService: MockCacheService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockUserRepository = new MockUserRepository();
    mockCacheService = new MockCacheService();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new GetUserUseCase(
      mockUserRepository,
      mockCacheService,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockUserRepository.clear();
    mockCacheService.clear();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("GetUser");
      expect(useCase.useCaseDescription).toBe("获取用户用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["user:read"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功获取用户信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(existingUser.id);
      expect(result.data?.username).toBe("testuser");
      expect(result.data?.email).toBe("test@example.com");
      expect(result.data?.displayName).toBe("测试用户");
      expect(result.data?.role).toBe(UserRole.USER);
      expect(result.data?.status).toBe(UserStatus.ACTIVE);
    });

    it("应该从缓存获取用户信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将用户信息放入缓存
      const cacheKey = `user:${existingUser.id.toString()}`;
      const cachedUser = {
        userId: existingUser.id,
        username: "testuser",
        email: "test@example.com",
        displayName: "测试用户",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        tenantId: existingUser.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedUser);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(existingUser.id);
    });

    it("应该过滤敏感信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果不包含敏感信息
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).not.toHaveProperty("password");
      expect(result.data).not.toHaveProperty("salt");
      expect(result.data).not.toHaveProperty("hashedPassword");
    });

    it("应该记录查询日志", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
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
    it("应该拒绝不存在的用户", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_NOT_FOUND");
    });

    it("应该拒绝空用户ID", async () => {
      // 准备测试数据
      const request = {
        userId: null as any,
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ID_REQUIRED");
    });

    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
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
    it("应该要求用户读取权限", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户查看用户信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["user:read"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该允许用户查看自己的信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext({
        user: {
          id: existingUser.id, // 查看自己的信息
          username: "testuser",
          email: "test@example.com",
          role: UserRole.USER,
        },
        permissions: ["user:read"],
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
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将用户信息放入缓存
      const cacheKey = `user:${existingUser.id.toString()}`;
      const cachedUser = {
        userId: existingUser.id,
        username: "cacheduser",
        email: "cached@example.com",
        displayName: "缓存用户",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        tenantId: existingUser.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedUser);

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果来自缓存
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe("cacheduser");
      expect(result.data?.email).toBe("cached@example.com");
    });

    it("应该处理缓存失效的情况", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例（不使用缓存）
      const result = await useCase.execute(request, context);

      // 验证结果来自数据库
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe("testuser");
      expect(result.data?.email).toBe("test@example.com");
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储查找失败", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储查找失败
      const originalFindById = mockUserRepository.findById;
      mockUserRepository.findById = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockUserRepository.findById = originalFindById;
    });

    it("应该处理缓存服务失败", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
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
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
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
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        tenantId: existingUser.tenantId,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 将用户信息放入缓存
      const cacheKey = `user:${existingUser.id.toString()}`;
      const cachedUser = {
        userId: existingUser.id,
        username: "cacheduser",
        email: "cached@example.com",
        displayName: "缓存用户",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        tenantId: existingUser.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mockCacheService.set(cacheKey, cachedUser);

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
   * 创建测试用户
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 用户聚合根
   */
  async function createTestUser(
    overrides: { email?: string; username?: string } = {},
  ): Promise<any> {
    const userAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getUser: () => ({
        id: TestDataFactory.createEntityId(),
        username: overrides.username || "testuser",
        email: overrides.email || "test@example.com",
        displayName: "测试用户",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        phone: "13800138000",
        description: "测试用户描述",
        isActive: true,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockUserRepository.save(userAggregate);
    return userAggregate;
  }
});
