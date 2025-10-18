/**
 * 用户应用服务单元测试
 *
 * @description 测试用户应用服务的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { UserApplicationService } from "./user-application.service.js";
import {
  MockUserUseCaseServices,
  MockTenantUseCaseServices,
  MockLoggerService,
  TestDataFactory,
} from "../__tests__/test-utils/index.js";

describe("UserApplicationService", () => {
  let service: UserApplicationService;
  let mockUserUseCaseServices: MockUserUseCaseServices;
  let mockTenantUseCaseServices: MockTenantUseCaseServices;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockUserUseCaseServices = new MockUserUseCaseServices();
    mockTenantUseCaseServices = new MockTenantUseCaseServices();
    mockLogger = new MockLoggerService();

    // 创建服务实例
    service = new UserApplicationService(
      mockUserUseCaseServices,
      mockTenantUseCaseServices,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockUserUseCaseServices.clear();
    mockTenantUseCaseServices.clear();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化服务", () => {
      expect(service).toBeDefined();
      expect(service.serviceName).toBe("UserApplicationService");
      expect(service.serviceDescription).toBe("用户应用服务");
      expect(service.serviceVersion).toBe("1.0.0");
    });
  });

  describe("createUserWithTenant - 成功场景", () => {
    it("应该成功创建用户并分配租户", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.createUserWithTenant(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.user).toBeDefined();
      expect(result.data?.tenant).toBeDefined();
      expect(result.data?.user.email).toBe("test@example.com");
      expect(result.data?.tenant.name).toBe("企业租户");
    });

    it("应该协调用户创建和租户创建", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      await service.createUserWithTenant(request, context);

      // 验证用例服务被调用
      expect(mockUserUseCaseServices.getCreateUserCallCount()).toBe(1);
      expect(mockTenantUseCaseServices.getCreateTenantCallCount()).toBe(1);
    });

    it("应该处理用户创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用户创建失败
      mockUserUseCaseServices.setCreateUserResult({
        success: false,
        error: { code: "USER_CREATION_FAILED", message: "用户创建失败" },
      });

      // 执行服务并验证异常
      const result = await service.createUserWithTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_CREATION_FAILED");
    });

    it("应该处理租户创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟租户创建失败
      mockTenantUseCaseServices.setCreateTenantResult({
        success: false,
        error: { code: "TENANT_CREATION_FAILED", message: "租户创建失败" },
      });

      // 执行服务并验证异常
      const result = await service.createUserWithTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TENANT_CREATION_FAILED");
    });
  });

  describe("createUserWithTenant - 验证失败场景", () => {
    it("应该拒绝空的用户数据", async () => {
      // 准备测试数据
      const request = {
        userData: null as any,
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.createUserWithTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_DATA_REQUIRED");
    });

    it("应该拒绝空的租户数据", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: null as any,
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.createUserWithTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TENANT_DATA_REQUIRED");
    });
  });

  describe("bulkCreateUsers - 成功场景", () => {
    it("应该成功批量创建用户", async () => {
      // 准备测试数据
      const request = {
        users: [
          {
            email: "user1@example.com",
            username: "user1",
            password: "password123",
          },
          {
            email: "user2@example.com",
            username: "user2",
            password: "password123",
          },
        ],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.bulkCreateUsers(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.users).toBeDefined();
      expect(result.data?.users.length).toBe(2);
    });

    it("应该处理部分用户创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        users: [
          {
            email: "user1@example.com",
            username: "user1",
            password: "password123",
          },
          {
            email: "user2@example.com",
            username: "user2",
            password: "password123",
          },
        ],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟部分用户创建失败
      mockUserUseCaseServices.setCreateUserResult({
        success: false,
        error: { code: "USER_CREATION_FAILED", message: "用户创建失败" },
      });

      // 执行服务
      const result = await service.bulkCreateUsers(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.successCount).toBe(0);
      expect(result.data?.failureCount).toBe(2);
    });
  });

  describe("bulkCreateUsers - 验证失败场景", () => {
    it("应该拒绝空的用户列表", async () => {
      // 准备测试数据
      const request = {
        users: [],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.bulkCreateUsers(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USERS_REQUIRED");
    });

    it("应该拒绝过大的用户列表", async () => {
      // 准备测试数据
      const users = Array.from({ length: 1001 }, (_, i) => ({
        email: `user${i}@example.com`,
        username: `user${i}`,
        password: "password123",
      }));
      const request = {
        users,
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.bulkCreateUsers(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_MANY_USERS");
    });
  });

  describe("transferUserToTenant - 成功场景", () => {
    it("应该成功转移用户到新租户", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.transferUserToTenant(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toEqual(request.userId);
      expect(result.data?.targetTenantId).toEqual(request.targetTenantId);
    });

    it("应该协调用户更新和租户验证", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      await service.transferUserToTenant(request, context);

      // 验证用例服务被调用
      expect(mockUserUseCaseServices.getUpdateUserCallCount()).toBe(1);
      expect(mockTenantUseCaseServices.getGetTenantCallCount()).toBe(1);
    });
  });

  describe("transferUserToTenant - 验证失败场景", () => {
    it("应该拒绝空的用户ID", async () => {
      // 准备测试数据
      const request = {
        userId: null as any,
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.transferUserToTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("USER_ID_REQUIRED");
    });

    it("应该拒绝空的目标租户ID", async () => {
      // 准备测试数据
      const request = {
        userId: TestDataFactory.createEntityId(),
        targetTenantId: null as any,
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.transferUserToTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TARGET_TENANT_ID_REQUIRED");
    });
  });

  describe("错误处理", () => {
    it("应该处理用例服务异常", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用例服务异常
      mockUserUseCaseServices.setCreateUserResult({
        success: false,
        error: { code: "UNKNOWN_ERROR", message: "未知错误" },
      });

      // 执行服务并验证异常
      const result = await service.createUserWithTenant(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN_ERROR");
    });

    it("应该记录错误日志", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用例服务异常
      mockUserUseCaseServices.setCreateUserResult({
        success: false,
        error: { code: "UNKNOWN_ERROR", message: "未知错误" },
      });

      // 执行服务
      await service.createUserWithTenant(request, context);

      // 验证错误日志
      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据
      const request = {
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "password123",
        },
        tenantData: {
          name: "企业租户",
          type: "ENTERPRISE" as any,
        },
      };
      const context = TestDataFactory.createUseCaseContext();

      // 记录开始时间
      const startTime = Date.now();

      // 执行服务
      const result = await service.createUserWithTenant(request, context);

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
