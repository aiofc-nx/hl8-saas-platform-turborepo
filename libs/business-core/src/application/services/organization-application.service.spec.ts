/**
 * 组织应用服务单元测试
 *
 * @description 测试组织应用服务的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import { OrganizationApplicationService } from "./organization-application.service.js";
import {
  MockOrganizationUseCaseServices,
  MockDepartmentUseCaseServices,
  MockLoggerService,
  TestDataFactory,
} from "../__tests__/test-utils/index.js";

describe("OrganizationApplicationService", () => {
  let service: OrganizationApplicationService;
  let mockOrganizationUseCaseServices: MockOrganizationUseCaseServices;
  let mockDepartmentUseCaseServices: MockDepartmentUseCaseServices;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockOrganizationUseCaseServices = new MockOrganizationUseCaseServices();
    mockDepartmentUseCaseServices = new MockDepartmentUseCaseServices();
    mockLogger = new MockLoggerService();

    // 创建服务实例
    service = new OrganizationApplicationService(
      mockOrganizationUseCaseServices,
      mockDepartmentUseCaseServices,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockOrganizationUseCaseServices.clear();
    mockDepartmentUseCaseServices.clear();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化服务", () => {
      expect(service).toBeDefined();
      expect(service.serviceName).toBe("OrganizationApplicationService");
      expect(service.serviceDescription).toBe("组织应用服务");
      expect(service.serviceVersion).toBe("1.0.0");
    });
  });

  describe("createOrganizationWithDepartments - 成功场景", () => {
    it("应该成功创建组织并初始化部门", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
          {
            name: "市场部",
            level: 1,
            description: "市场部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organization).toBeDefined();
      expect(result.data?.departments).toBeDefined();
      expect(result.data?.departments.length).toBe(2);
    });

    it("应该协调组织创建和部门创建", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      await service.createOrganizationWithDepartments(request, context);

      // 验证用例服务被调用
      expect(
        mockOrganizationUseCaseServices.getCreateOrganizationCallCount(),
      ).toBe(1);
      expect(mockDepartmentUseCaseServices.getCreateDepartmentCallCount()).toBe(
        1,
      );
    });

    it("应该处理组织创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟组织创建失败
      mockOrganizationUseCaseServices.setCreateOrganizationResult({
        success: false,
        error: {
          code: "ORGANIZATION_CREATION_FAILED",
          message: "组织创建失败",
        },
      });

      // 执行服务并验证异常
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_CREATION_FAILED");
    });

    it("应该处理部门创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟部门创建失败
      mockDepartmentUseCaseServices.setCreateDepartmentResult({
        success: false,
        error: { code: "DEPARTMENT_CREATION_FAILED", message: "部门创建失败" },
      });

      // 执行服务并验证异常
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPARTMENT_CREATION_FAILED");
    });
  });

  describe("createOrganizationWithDepartments - 验证失败场景", () => {
    it("应该拒绝空的组织数据", async () => {
      // 准备测试数据
      const request = {
        organizationData: null as any,
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_DATA_REQUIRED");
    });

    it("应该拒绝空的部门列表", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPARTMENTS_REQUIRED");
    });
  });

  describe("bulkCreateOrganizations - 成功场景", () => {
    it("应该成功批量创建组织", async () => {
      // 准备测试数据
      const request = {
        organizations: [
          {
            name: "组织1",
            type: "ENTERPRISE" as any,
            description: "组织1描述",
          },
          {
            name: "组织2",
            type: "TEAM" as any,
            description: "组织2描述",
          },
        ],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.bulkCreateOrganizations(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizations).toBeDefined();
      expect(result.data?.organizations.length).toBe(2);
    });

    it("应该处理部分组织创建失败的情况", async () => {
      // 准备测试数据
      const request = {
        organizations: [
          {
            name: "组织1",
            type: "ENTERPRISE" as any,
            description: "组织1描述",
          },
          {
            name: "组织2",
            type: "TEAM" as any,
            description: "组织2描述",
          },
        ],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟部分组织创建失败
      mockOrganizationUseCaseServices.setCreateOrganizationResult({
        success: false,
        error: {
          code: "ORGANIZATION_CREATION_FAILED",
          message: "组织创建失败",
        },
      });

      // 执行服务
      const result = await service.bulkCreateOrganizations(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.successCount).toBe(0);
      expect(result.data?.failureCount).toBe(2);
    });
  });

  describe("bulkCreateOrganizations - 验证失败场景", () => {
    it("应该拒绝空的组织列表", async () => {
      // 准备测试数据
      const request = {
        organizations: [],
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.bulkCreateOrganizations(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATIONS_REQUIRED");
    });

    it("应该拒绝过大的组织列表", async () => {
      // 准备测试数据
      const organizations = Array.from({ length: 1001 }, (_, i) => ({
        name: `组织${i}`,
        type: "ENTERPRISE" as any,
        description: `组织${i}描述`,
      }));
      const request = {
        organizations,
        tenantId: TestDataFactory.createTenantId(),
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.bulkCreateOrganizations(request, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_MANY_ORGANIZATIONS");
    });
  });

  describe("transferOrganizationToTenant - 成功场景", () => {
    it("应该成功转移组织到新租户", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      const result = await service.transferOrganizationToTenant(
        request,
        context,
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationId).toEqual(request.organizationId);
      expect(result.data?.targetTenantId).toEqual(request.targetTenantId);
    });

    it("应该协调组织更新和租户验证", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务
      await service.transferOrganizationToTenant(request, context);

      // 验证用例服务被调用
      expect(
        mockOrganizationUseCaseServices.getUpdateOrganizationCallCount(),
      ).toBe(1);
    });
  });

  describe("transferOrganizationToTenant - 验证失败场景", () => {
    it("应该拒绝空的组织ID", async () => {
      // 准备测试数据
      const request = {
        organizationId: null as any,
        targetTenantId: TestDataFactory.createTenantId(),
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.transferOrganizationToTenant(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORGANIZATION_ID_REQUIRED");
    });

    it("应该拒绝空的目标租户ID", async () => {
      // 准备测试数据
      const request = {
        organizationId: TestDataFactory.createEntityId(),
        targetTenantId: null as any,
        transferredBy: "admin",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 执行服务并验证异常
      const result = await service.transferOrganizationToTenant(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TARGET_TENANT_ID_REQUIRED");
    });
  });

  describe("错误处理", () => {
    it("应该处理用例服务异常", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用例服务异常
      mockOrganizationUseCaseServices.setCreateOrganizationResult({
        success: false,
        error: { code: "UNKNOWN_ERROR", message: "未知错误" },
      });

      // 执行服务并验证异常
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN_ERROR");
    });

    it("应该记录错误日志", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟用例服务异常
      mockOrganizationUseCaseServices.setCreateOrganizationResult({
        success: false,
        error: { code: "UNKNOWN_ERROR", message: "未知错误" },
      });

      // 执行服务
      await service.createOrganizationWithDepartments(request, context);

      // 验证错误日志
      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据
      const request = {
        organizationData: {
          name: "测试组织",
          type: "ENTERPRISE" as any,
          description: "测试组织描述",
        },
        departments: [
          {
            name: "技术部",
            level: 1,
            description: "技术部门",
          },
        ],
      };
      const context = TestDataFactory.createUseCaseContext();

      // 记录开始时间
      const startTime = Date.now();

      // 执行服务
      const result = await service.createOrganizationWithDepartments(
        request,
        context,
      );

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
