/**
 * 创建角色用例单元测试
 *
 * @description 测试创建角色用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { CreateRoleUseCase } from "./create-role.use-case.js";
import { RoleType } from "../../../domain/value-objects/types/role-type.vo.js";
import { PermissionType } from "../../../domain/value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../../domain/value-objects/types/permission-action.vo.js";
import {
  MockRoleRepository,
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";

describe("CreateRoleUseCase", () => {
  let useCase: CreateRoleUseCase;
  let mockRoleRepository: MockRoleRepository;
  let mockEventBus: MockEventBus;
  let mockTransactionManager: MockTransactionManager;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockRoleRepository = new MockRoleRepository();
    mockEventBus = new MockEventBus();
    mockTransactionManager = new MockTransactionManager();
    mockLogger = new MockLoggerService();

    // 创建用例实例
    useCase = new CreateRoleUseCase(
      mockRoleRepository,
      mockEventBus,
      mockTransactionManager,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockRoleRepository.clear();
    mockEventBus.clearEvents();
    mockTransactionManager.reset();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化用例", () => {
      expect(useCase).toBeDefined();
      expect(useCase.useCaseName).toBe("CreateRole");
      expect(useCase.useCaseDescription).toBe("创建角色用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["role:create"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功创建角色", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.roleId).toBeDefined();
      expect(result.data?.name).toBe(request.name);
      expect(result.data?.type).toBe(request.type);
      expect(result.data?.tenantId).toEqual(request.tenantId);
      expect(result.data?.createdAt).toBeDefined();
    });

    it("应该创建具有权限的角色", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        permissionType: PermissionType.RESOURCE,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.permissionType).toBe(PermissionType.RESOURCE);
      expect(result.data?.actions).toEqual([
        PermissionAction.CREATE,
        PermissionAction.READ,
      ]);
    });

    it("应该创建系统角色", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        isSystemRole: true,
        isEditable: false,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.isSystemRole).toBe(true);
      expect(result.data?.isEditable).toBe(false);
    });

    it("应该保存角色到仓储", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证角色已保存
      const savedRoles = mockRoleRepository.getAllRoles();
      expect(savedRoles).toHaveLength(1);

      const savedRole = savedRoles[0];
      expect(savedRole.getRole().name).toBe(request.name);
    });

    it("应该发布领域事件", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents.length).toBeGreaterThan(0);
    });

    it("应该处理可选字段", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        description: "测试角色描述",
        isActive: true,
        priority: 1,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.description).toBe("测试角色描述");
      expect(result.data?.isActive).toBe(true);
      expect(result.data?.priority).toBe(1);
    });
  });

  describe("execute - 验证失败场景", () => {
    it("应该拒绝空角色名称", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        name: "",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ROLE_NAME_REQUIRED");
    });

    it("应该拒绝过长的角色名称", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        name: "这是一个非常长的角色名称，超过了系统允许的最大长度限制，应该被拒绝",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ROLE_NAME_TOO_LONG");
    });

    it("应该拒绝空租户ID", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        tenantId: null as any,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TENANT_ID_REQUIRED");
    });

    it("应该拒绝空角色类型", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        type: null as any,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ROLE_TYPE_REQUIRED");
    });

    it("应该拒绝空权限类型", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        permissionType: null as any,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_TYPE_REQUIRED");
    });

    it("应该拒绝空权限动作列表", async () => {
      // 准备测试数据
      const request = TestDataFactory.createInvalidCreateRoleRequest({
        actions: [],
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ACTIONS_REQUIRED");
    });
  });

  describe("execute - 业务规则验证", () => {
    it("应该拒绝重复的角色名称", async () => {
      // 准备测试数据 - 先创建一个角色
      const existingRole = await createTestRole();
      const request = TestDataFactory.createValidCreateRoleRequest({
        name: existingRole.getRole().name,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ROLE_NAME_DUPLICATE");
    });

    it("应该允许相同名称但不同租户的角色", async () => {
      // 准备测试数据 - 先创建一个角色
      const existingRole = await createTestRole();
      const request = TestDataFactory.createValidCreateRoleRequest({
        name: existingRole.getRole().name,
        tenantId: TestDataFactory.createTenantId(), // 不同的租户
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该验证权限动作的有效性", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        permissionType: PermissionType.RESOURCE,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该验证系统角色的约束", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        isSystemRole: true,
        isEditable: true, // 系统角色应该不可编辑
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SYSTEM_ROLE_NOT_EDITABLE");
    });
  });

  describe("execute - 权限验证", () => {
    it("应该要求角色创建权限", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: [], // 没有权限
      });

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("应该允许有权限的用户创建角色", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext({
        permissions: ["role:create"],
      });

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("execute - 数据转换", () => {
    it("应该去除角色名称的前后空格", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        name: "  测试角色  ",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证空格已去除
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("测试角色");
    });

    it("应该处理空描述", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        description: "",
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("应该设置默认值", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest({
        isActive: undefined,
        isSystemRole: undefined,
        isEditable: undefined,
        priority: undefined,
      });
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证默认值
      expect(result.success).toBe(true);
      expect(result.data?.isActive).toBe(true);
      expect(result.data?.isSystemRole).toBe(false);
      expect(result.data?.isEditable).toBe(true);
      expect(result.data?.priority).toBe(0);
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理仓储保存失败", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
      const context = TestDataFactory.createUseCaseContext();

      // 模拟仓储保存失败
      const originalSave = mockRoleRepository.save;
      mockRoleRepository.save = async () => {
        throw new Error("数据库连接失败");
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("数据库连接失败");

      // 恢复原始方法
      mockRoleRepository.save = originalSave;
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据
      const request = TestDataFactory.createValidCreateRoleRequest();
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
      const request = TestDataFactory.createValidCreateRoleRequest();
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
   * 创建测试角色
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 角色聚合根
   */
  async function createTestRole(
    overrides: { name?: string; tenantId?: TenantId } = {},
  ): Promise<any> {
    const roleAggregate = {
      id: TestDataFactory.createEntityId(),
      tenantId: overrides.tenantId || TestDataFactory.createTenantId(),
      getRole: () => ({
        id: TestDataFactory.createEntityId(),
        name: overrides.name || "测试角色",
        description: "测试角色描述",
        type: RoleType.ADMIN,
        permissionType: PermissionType.RESOURCE,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
        isActive: true,
        isSystemRole: false,
        isEditable: true,
        priority: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      getUncommittedEvents: () => [],
      markEventsAsCommitted: () => {},
    };

    await mockRoleRepository.save(roleAggregate);
    return roleAggregate;
  }
});
