/**
 * 获取租户用例测试
 *
 * @description 测试获取租户用例的业务逻辑和查询功能
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TenantId } from "@hl8/isolation-model";
import { GetTenantsUseCase } from "./get-tenants.use-case.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

describe("GetTenantsUseCase", () => {
  let useCase: GetTenantsUseCase;
  let mockRepository: jest.Mocked<ITenantRepository>;
  let mockLogger: jest.Mocked<FastifyLoggerService>;
  let mockContext: IUseCaseContext;

  beforeEach(() => {
    // 创建模拟仓库
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByPlatformId: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findMany: jest.fn(),
    } as jest.Mocked<ITenantRepository>;

    // 创建模拟日志记录器
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn(),
    } as unknown as jest.Mocked<FastifyLoggerService>;

    // 创建模拟上下文
    mockContext = {
      request: {
        id: "test-request-id",
        timestamp: new Date(),
      },
      user: {
        id: "test-user",
        permissions: ["tenant:read"],
      },
      tenant: {
        id: TenantId.generate().toString(),
      },
    };

    // 创建用例实例
    useCase = new GetTenantsUseCase(mockRepository, mockLogger);
  });

  describe("execute", () => {
    it("应该成功获取所有租户", async () => {
      // Arrange
      const mockTenants = [
        {
          id: TenantId.generate(),
          tenant: {
            name: "租户1",
            type: TenantType.ENTERPRISE,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          },
          platformId: TenantId.generate(),
        },
        {
          id: TenantId.generate(),
          tenant: {
            name: "租户2",
            type: TenantType.COMMUNITY,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          },
          platformId: TenantId.generate(),
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({}, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.tenants).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it("应该支持按平台ID过滤", async () => {
      // Arrange
      const platformId = TenantId.generate();
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "租户1",
          type: TenantType.ENTERPRISE,
          platformId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ platformId }, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(1);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ platformId }),
      );
    });

    it("应该支持按租户类型过滤", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "企业租户",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ type: TenantType.ENTERPRISE }, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(1);
      expect(result.tenants[0].type).toBe(TenantType.ENTERPRISE);
    });

    it("应该支持按租户名称过滤", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ name: "测试" }, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(1);
      expect(result.tenants[0].name).toBe("测试租户");
    });

    it("应该支持分页查询", async () => {
      // Arrange
      const mockTenants = Array.from({ length: 25 }, (_, i) => ({
        tenantId: TenantId.generate(),
        name: `租户${i + 1}`,
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }));

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ page: 2, limit: 10 }, mockContext);

      // Assert
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
    });

    it("应该支持排序", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "租户A",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          isDeleted: false,
        },
        {
          tenantId: TenantId.generate(),
          name: "租户B",
          type: TenantType.COMMUNITY,
          platformId: TenantId.generate(),
          createdAt: new Date("2023-01-02"),
          updatedAt: new Date("2023-01-02"),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ 
        sortBy: "name", 
        sortOrder: "asc" 
      }, mockContext);

      // Assert
      expect(result.tenants[0].name).toBe("租户A");
      expect(result.tenants[1].name).toBe("租户B");
    });

    it("应该支持包含已删除租户", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "活跃租户",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        {
          tenantId: TenantId.generate(),
          name: "已删除租户",
          type: TenantType.COMMUNITY,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: true,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ includeDeleted: true }, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(2);
      expect(result.tenants.some(t => t.isDeleted)).toBe(true);
    });

    it("应该验证分页参数", async () => {
      // Arrange
      const request = {
        page: 0, // 无效页码
        limit: 0, // 无效限制
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "页码必须大于0",
      );
    });

    it("应该验证限制参数", async () => {
      // Arrange
      const request = {
        page: 1,
        limit: 1001, // 超过最大限制
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "每页记录数必须在1-100之间",
      );
    });

    it("应该验证排序字段", async () => {
      // Arrange
      const request = {
        sortBy: "invalid" as any,
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "无效的排序字段",
      );
    });

    it("应该验证排序顺序", async () => {
      // Arrange
      const request = {
        sortOrder: "invalid" as any,
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "无效的排序顺序",
      );
    });

    it("应该处理空结果", async () => {
      // Arrange
      mockRepository.findMany.mockResolvedValue({
        tenants: [],
        total: 0,
      });

      // Act
      const result = await useCase.execute({}, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it("应该记录查询日志", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "租户1",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      await useCase.execute({}, mockContext);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("租户查询成功"),
        expect.objectContaining({
          total: 1,
          page: 1,
          limit: 10,
        }),
      );
    });

    it("应该处理仓库查询失败", async () => {
      // Arrange
      mockRepository.findMany.mockRejectedValue(new Error("数据库查询失败"));

      // Act & Assert
      await expect(useCase.execute({}, mockContext)).rejects.toThrow(
        "数据库查询失败",
      );
    });
  });

  describe("边界条件", () => {
    it("应该处理大量租户数据", async () => {
      // Arrange
      const mockTenants = Array.from({ length: 1000 }, (_, i) => ({
        tenantId: TenantId.generate(),
        name: `租户${i + 1}`,
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }));

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({ limit: 100 }, mockContext);

      // Assert
      expect(result.tenants).toHaveLength(100);
      expect(result.total).toBe(1000);
      expect(result.hasNext).toBe(true);
    });

    it("应该处理特殊字符的租户名称", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "租户@#$%^&*()_+-=[]{}|;':\",./<>?",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({}, mockContext);

      // Assert
      expect(result.tenants[0].name).toBe("租户@#$%^&*()_+-=[]{}|;':\",./<>?");
    });

    it("应该处理Unicode字符的租户名称", async () => {
      // Arrange
      const mockTenants = [
        {
          tenantId: TenantId.generate(),
          name: "租户🚀🌟💡🎯",
          type: TenantType.ENTERPRISE,
          platformId: TenantId.generate(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      // Act
      const result = await useCase.execute({}, mockContext);

      // Assert
      expect(result.tenants[0].name).toBe("租户🚀🌟💡🎯");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速查询租户", async () => {
      // Arrange
      const mockTenants = Array.from({ length: 100 }, (_, i) => ({
        tenantId: TenantId.generate(),
        name: `租户${i + 1}`,
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }));

      mockRepository.findMany.mockResolvedValue({
        tenants: mockTenants,
        total: mockTenants.length,
      });

      const startTime = Date.now();

      // Act
      await useCase.execute({}, mockContext);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
