/**
 * 创建用户用例单元测试
 *
 * @description 测试创建用户用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { CreateUserUseCase } from "./create-user.use-case.js";
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

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
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
    useCase = new CreateUserUseCase(mockUserRepository, mockLogger);
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
      expect(useCase.useCaseName).toBe("CreateUser");
      expect(useCase.useCaseDescription).toBe("创建用户用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["user:create"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功创建用户", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBeDefined();
      expect(result.data?.username).toBe(request.username);
      expect(result.data?.email).toBe(request.email.toLowerCase());
      expect(result.data?.displayName).toBe(request.displayName);
      expect(result.data?.role).toBe(request.role);
      expect(result.data?.tenantId).toEqual(context.tenant!.id);
      expect(result.data?.createdAt).toBeDefined();
    });

    it("应该保存用户到仓储", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证用户已保存
      const savedUsers = mockUserRepository.getAllUsers();
      expect(savedUsers).toHaveLength(1);

      const savedUser = savedUsers[0];
      expect(savedUser.getUser().username).toBe(request.username);
      expect(savedUser.getUser().email).toBe(request.email.toLowerCase());
      expect(savedUser.getUser().displayName).toBe(request.displayName);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选字段", async () => {
      // 准备测试数据（不包含可选字段）
      const request = TestDataFactory.createValidCreateUserRequest({
        phone: undefined,
        description: undefined,
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
    it("应该拒绝空用户名", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateUserRequest("empty-username");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USERNAME_REQUIRED");
    });

    it("应该拒绝过长的用户名", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest({
        username: TestDataFactory.createLongUsername(),
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USERNAME_TOO_LONG");
    });

    it("应该拒绝空邮箱", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateUserRequest("empty-email");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("EMAIL_REQUIRED");
    });

    it("应该拒绝空显示名称", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateUserRequest("empty-display-name");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DISPLAY_NAME_REQUIRED");
    });

    it("应该拒绝过长的显示名称", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest({
        displayName: TestDataFactory.createLongDisplayName(),
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DISPLAY_NAME_TOO_LONG");
    });

    it("应该拒绝空角色", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateUserRequest("empty-role");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ROLE_REQUIRED");
    });

    it("应该拒绝空创建者", async () => {
      // 准备测试数据
      const request =
        TestDataFactory.createInvalidCreateUserRequest("empty-created-by");
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CREATED_BY_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝重复的用户名", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingRequest = TestDataFactory.createValidCreateUserRequest({
        username: "existinguser",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的用户到仓储
      const existingUserAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getUser: () => ({
          username: "existinguser",
          email: "existing@example.com",
          displayName: "已存在用户",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        }),
      } as any;

      mockUserRepository.save(existingUserAggregate);

      // 尝试创建重复用户名的用户
      const duplicateRequest =
        TestDataFactory.createDuplicateUsernameRequest("existinguser");

      // 执行用例并验证异常
      const result = await useCase.execute(duplicateRequest, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USERNAME_DUPLICATE");
    });

    it("应该拒绝重复的邮箱", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingRequest = TestDataFactory.createValidCreateUserRequest({
        email: "existing@example.com",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 手动添加一个已存在的用户到仓储
      const existingUserAggregate = {
        id: EntityId.fromString("550e8400-e29b-41d4-a716-446655440002"),
        tenantId: context.tenant!.id,
        getUser: () => ({
          username: "existinguser",
          email: "existing@example.com",
          displayName: "已存在用户",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        }),
      } as any;

      mockUserRepository.save(existingUserAggregate);

      // 尝试创建重复邮箱的用户
      const duplicateRequest = TestDataFactory.createDuplicateEmailRequest(
        "existing@example.com",
      );

      // 执行用例并验证异常
      const result = await useCase.execute(duplicateRequest, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("EMAIL_DUPLICATE");
    });
  });

  describe("execute - 数据转换", () => {
    it("应该将邮箱转换为小写", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest({
        email: "TEST@EXAMPLE.COM",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证邮箱已转换为小写
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe("test@example.com");
    });

    it("应该去除用户名和显示名称的前后空格", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest({
        username: "  testuser  ",
        displayName: "  测试用户  ",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe("testuser");
      expect(result.data?.displayName).toBe("测试用户");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求用户创建权限", async () => {
      // 准备测试数据 - 没有权限的上下文
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户创建用户", async () => {
      // 准备测试数据 - 有权限的上下文
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["user:create"],
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
      const request = TestDataFactory.createValidCreateUserRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储保存失败
      const originalSave = mockUserRepository.save;
      mockUserRepository.save = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockUserRepository.save = originalSave;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateUserRequest();
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
      const request = TestDataFactory.createValidCreateUserRequest();
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
