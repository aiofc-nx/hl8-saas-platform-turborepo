/**
 * 更新用户用例单元测试
 *
 * @description 测试更新用户用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { UpdateUserUseCase } from "./update-user.use-case.js";
import { UserRole } from "../../../domain/value-objects/types/user-role.vo.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import { BusinessRuleViolationException } from "../../../common/exceptions/business.exceptions.js";
import {
  MockUserRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: MockUserRepository;
  let mockEventBus: MockEventBus;
  let mockTransactionManager: MockTransactionManager;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockUserRepository = new MockUserRepository();
    mockEventBus = new MockEventBus();
    mockTransactionManager = new MockTransactionManager();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new UpdateUserUseCase(
      mockUserRepository,
      mockEventBus,
      mockTransactionManager,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockUserRepository.clear();
    mockEventBus.clearEvents();
    mockTransactionManager.reset();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("UpdateUser");
      expect(useCase.useCaseDescription).toBe("更新用户用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["user:update"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功更新用户基本信息", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
        email: "newemail@example.com",
        phone: "13900139000",
        description: "新的用户描述",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(existingUser.id);
      expect(result.data?.displayName).toBe("新显示名称");
      expect(result.data?.email).toBe("newemail@example.com");
      expect(result.data?.phone).toBe("13900139000");
      expect(result.data?.description).toBe("新的用户描述");
    });

    it("应该更新用户角色", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        role: UserRole.ADMIN,
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.ADMIN);
    });

    it("应该更新用户状态", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        status: UserStatus.INACTIVE,
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(UserStatus.INACTIVE);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝不存在的用户", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        displayName: "新显示名称",
        updatedBy: "admin",
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
        displayName: "新显示名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ID_REQUIRED");
    });

    it("应该拒绝空更新者", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
        updatedBy: "",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UPDATED_BY_REQUIRED");
    });

    it("应该拒绝过长的显示名称", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: TestDataFactory.createLongDisplayName(),
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DISPLAY_NAME_TOO_LONG");
    });

    it("应该拒绝无效的邮箱格式", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        email: TestDataFactory.createInvalidEmail(),
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_EMAIL_FORMAT");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝重复的邮箱", async () => {
      // 准备测试数据 - 创建两个用户
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });

      const request = {
        userId: user2.id,
        email: "user1@example.com", // 使用user1的邮箱
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("EMAIL_DUPLICATE");
    });

    it("应该允许使用相同的邮箱（更新自己的邮箱）", async () => {
      // 准备测试数据 - 创建一个用户
      const existingUser = await createTestUser({ email: "user@example.com" });

      const request = {
        userId: existingUser.id,
        email: "user@example.com", // 使用相同的邮箱
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
    });

    it("应该拒绝非管理员更新其他用户的角色", async () => {
      // 准备测试数据 - 创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        role: UserRole.ADMIN,
        updatedBy: "user", // 非管理员
      };
      const context = TestDataFactory.createUserUseCaseContext(); // 普通用户上下文

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许管理员更新用户角色", async () => {
      // 准备测试数据 - 创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        role: UserRole.ADMIN,
        updatedBy: "admin",
      };
      const context = TestDataFactory.createAdminUseCaseContext(); // 管理员上下文

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.ADMIN);
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求用户更新权限", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
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

    it("应该允许有权限的用户更新用户", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["user:update"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 数据转换", () => {
    it("应该将邮箱转换为小写", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        email: "NEWEMAIL@EXAMPLE.COM",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证邮箱已转换为小写
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe("newemail@example.com");
    });

    it("应该去除显示名称的前后空格", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "  新显示名称  ",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe("新显示名称");
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储查找失败", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        displayName: "新显示名称",
        updatedBy: "admin",
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

    it("应该处理仓储保存失败", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
        updatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储保存失败
      const originalSave = mockUserRepository.save;
      mockUserRepository.save = async () => {
        throw new Error("数据库保存失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库保存失败");

      // 恢复原始方法
      mockUserRepository.save = originalSave;
    });
  });

  describe("execute - 性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        displayName: "新显示名称",
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
