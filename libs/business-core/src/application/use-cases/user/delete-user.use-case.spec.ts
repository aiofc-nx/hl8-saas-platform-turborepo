/**
 * 删除用户用例单元测试
 *
 * @description 测试删除用户用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { DeleteUserUseCase } from "./delete-user.use-case.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import {
  MockUserRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("DeleteUserUseCase", () => {
  let useCase: DeleteUserUseCase;
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
    useCase = new DeleteUserUseCase(
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
      expect(useCase.useCaseName).toBe("DeleteUser");
      expect(useCase.useCaseDescription).toBe("删除用户用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["user:delete"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功删除用户", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(existingUser.id);
      expect(result.data?.deletedAt).toBeDefined();
    });

    it("应该处理软删除", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
        softDelete: true,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.softDelete).toBe(true);
    });

    it("应该处理硬删除", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
        softDelete: false,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.softDelete).toBe(false);
    });

    it("应该从仓储中删除用户", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证用户已删除
      const savedUsers = mockUserRepository.getAllUsers();
      expect(savedUsers).toHaveLength(0);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选删除原因", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: undefined,
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
        deletedBy: "admin",
        deleteReason: "用户申请删除",
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
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ID_REQUIRED");
    });

    it("应该拒绝空删除者", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DELETED_BY_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝删除已删除的用户", async () => {
      // 准备测试数据 - 先创建一个已删除的用户
      const existingUser = await createTestUser(UserStatus.DELETED);
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ALREADY_DELETED");
    });

    it("应该检查用户是否有活跃会话", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用户有活跃会话的情况
      const originalGetUser = existingUser.getUser;
      existingUser.getUser = () => ({
        ...originalGetUser(),
        hasActiveSessions: true, // 有活跃会话
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_HAS_ACTIVE_SESSIONS");
    });

    it("应该检查用户是否有未完成的任务", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用户有未完成任务的情况
      const originalGetUser = existingUser.getUser;
      existingUser.getUser = () => ({
        ...originalGetUser(),
        hasPendingTasks: true, // 有未完成任务
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_HAS_PENDING_TASKS");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求用户删除权限", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户删除用户", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["user:delete"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储删除失败", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储删除失败
      const originalDelete = mockUserRepository.delete;
      mockUserRepository.delete = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockUserRepository.delete = originalDelete;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
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
      // 准备测试数据 - 先创建一个用户
      const existingUser = await createTestUser();
      const request = {
        userId: existingUser.id,
        deletedBy: "admin",
        deleteReason: "用户申请删除",
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
        hasActiveSessions: false,
        hasPendingTasks: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockUserRepository.save(userAggregate);
    return userAggregate;
  }
});
