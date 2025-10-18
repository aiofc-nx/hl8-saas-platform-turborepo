/**
 * 停用用户用例单元测试
 *
 * @description 测试停用用户用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { DeactivateUserUseCase } from "./deactivate-user.use-case.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import {
  MockUserRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("DeactivateUserUseCase", () => {
  let useCase: DeactivateUserUseCase;
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
    useCase = new DeactivateUserUseCase(
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
      expect(useCase.useCaseName).toBe("DeactivateUser");
      expect(useCase.useCaseDescription).toBe("停用用户用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["user:deactivate"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功停用用户", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(existingUser.id);
      expect(result.data?.status).toBe(UserStatus.INACTIVE);
      expect(result.data?.deactivatedAt).toBeDefined();
    });

    it("应该保存用户状态到仓储", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证用户状态已更新
      const savedUsers = mockUserRepository.getAllUsers();
      expect(savedUsers).toHaveLength(1);

      const savedUser = savedUsers[0];
      expect(savedUser.getUser().status).toBe(UserStatus.INACTIVE);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理停用原因", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
        deactivationReason: "用户违规操作",
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
    it("应该拒绝不存在的用户", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        deactivatedBy: "admin",
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
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ID_REQUIRED");
    });

    it("应该拒绝空停用者", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deactivatedBy: "",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEACTIVATED_BY_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝停用已停用的用户", async () => {
      // 准备测试数据 - 先创建一个已停用的用户
      const existingUser = await createTestUser(UserStatus.INACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ALREADY_INACTIVE");
    });

    it("应该拒绝停用已删除的用户", async () => {
      // 准备测试数据 - 先创建一个已删除的用户
      const existingUser = await createTestUser(UserStatus.DELETED);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ALREADY_DELETED");
    });

    it("应该允许停用暂停的用户", async () => {
      // 准备测试数据 - 先创建一个暂停的用户
      const existingUser = await createTestUser(UserStatus.SUSPENDED);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(UserStatus.INACTIVE);
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求用户停用权限", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户停用用户", async () => {
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["user:deactivate"],
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
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
      };
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
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
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
      // 准备测试数据 - 先创建一个活跃的用户
      const existingUser = await createTestUser(UserStatus.ACTIVE);
      const request = {
        userId: existingUser.id,
        deactivatedBy: "admin",
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
   * @param status - 用户状态
   * @returns 用户聚合根
   */
  async function createTestUser(
    status: UserStatus = UserStatus.ACTIVE,
  ): Promise<any> {
    const userAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: TestDataFactory.createTenantId(),
      getUser: () => ({
        id: TestDataFactory.createEntityId(),
        username: "testuser",
        email: "test@example.com",
        status,
        role: "USER" as any,
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
