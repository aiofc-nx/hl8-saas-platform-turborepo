/**
 * 更新租户用例测试
 *
 * @description 测试更新租户用例的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TenantId } from "@hl8/isolation-model";
import { UpdateTenantUseCase } from "./update-tenant.use-case.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import { TenantAggregate } from "../../../domain/aggregates/tenant-aggregate.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

describe("UpdateTenantUseCase", () => {
  let useCase: UpdateTenantUseCase;
  let mockRepository: jest.Mocked<ITenantRepository>;
  let mockLogger: jest.Mocked<FastifyLoggerService>;
  let mockContext: IUseCaseContext;
  let mockTenantAggregate: jest.Mocked<TenantAggregate>;

  beforeEach(() => {
    // 创建模拟仓库
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByPlatformId: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findByPlatform: jest.fn(),
      existsByName: jest.fn(),
      countByPlatform: jest.fn(),
      softDelete: jest.fn(),
      deleteAll: jest.fn(),
      saveWithEvents: jest.fn(),
      loadAtVersion: jest.fn(),
      getEventHistory: jest.fn(),
      createSnapshot: jest.fn(),
      restoreFromSnapshot: jest.fn(),
      getSnapshot: jest.fn(),
      deleteSnapshot: jest.fn(),
      getSnapshots: jest.fn(),
      getLatestSnapshot: jest.fn(),
      getSnapshotCount: jest.fn(),
      getSnapshotVersions: jest.fn(),
      getSnapshotMetadata: jest.fn(),
      restore: jest.fn(),
      findMany: jest.fn(),
      rebuild: jest.fn(),
      saveAllWithEvents: jest.fn(),
      loadAllAtVersion: jest.fn(),
      getEventHistoryRange: jest.fn(),
      count: jest.fn(),
      findAll: jest.fn(),
      saveAll: jest.fn(),
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
        permissions: ["tenant:update"],
      },
      tenant: {
        id: TenantId.generate().toString(),
      },
    };

    // 创建模拟租户聚合根
    mockTenantAggregate = {
      id: TenantId.generate(),
      tenant: {
        name: "原始租户",
        type: TenantType.ENTERPRISE,
        updatedAt: new Date(),
      },
      platformId: TenantId.generate(),
      updateName: jest.fn().mockImplementation((name: string) => {
        mockTenantAggregate.tenant.name = name;
      }),
      updateType: jest
        .fn()
        .mockImplementation((type: TenantType, updatedBy: string) => {
          mockTenantAggregate.tenant.type = type;
        }),
      getStatus: jest.fn().mockReturnValue({
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as any;

    // 创建用例实例
    useCase = new UpdateTenantUseCase(mockRepository, mockLogger);
  });

  describe("execute", () => {
    it("应该成功更新租户名称", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("新租户名称");
      expect(mockTenantAggregate.updateName).toHaveBeenCalledWith(
        "新租户名称",
        "admin",
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("应该成功更新租户类型", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        type: TenantType.COMMUNITY,
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe(TenantType.COMMUNITY);
      expect(mockTenantAggregate.updateType).toHaveBeenCalledWith(
        TenantType.COMMUNITY,
        "admin",
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("应该成功同时更新租户名称和类型", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        type: TenantType.COMMUNITY,
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("新租户名称");
      expect(result.type).toBe(TenantType.COMMUNITY);
      expect(mockTenantAggregate.updateName).toHaveBeenCalledWith(
        "新租户名称",
        "admin",
      );
      expect(mockTenantAggregate.updateType).toHaveBeenCalledWith(
        TenantType.COMMUNITY,
        "admin",
      );
    });

    it("应该验证租户ID不能为空", async () => {
      // Arrange
      const request = {
        tenantId: null as any,
        name: "新租户名称",
        updatedBy: "admin",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户ID不能为空",
      );
    });

    it("应该验证租户不存在", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户不存在",
      );
    });

    it("应该验证租户名称在同一平台内唯一", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "重复租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.findByName.mockResolvedValue(mockTenantAggregate);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        '租户名称 "重复租户名称" 在同一平台下已存在',
      );
    });

    it("应该验证租户名称不能为空", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户名称不能为空",
      );
    });

    it("应该验证租户名称长度限制", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "a".repeat(101),
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户名称长度不能超过100",
      );
    });

    it("应该验证租户类型不能为空", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        type: null as any,
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户类型不能为空",
      );
    });

    it("应该验证更新者不能为空", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "更新者标识符不能为空",
      );
    });

    it("应该支持所有租户类型", async () => {
      // Arrange
      const tenantTypes = [
        TenantType.ENTERPRISE,
        TenantType.COMMUNITY,
        TenantType.TEAM,
        TenantType.PERSONAL,
      ];

      for (const type of tenantTypes) {
        const request = {
          tenantId: TenantId.generate(),
          type,
          updatedBy: "admin",
        };

        mockRepository.findById.mockResolvedValue(mockTenantAggregate);
        mockRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(request, mockContext);

        // Assert
        expect(result.type).toBe(type);
      }
    });

    it("应该记录操作日志", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      console.log("Test: calling useCase.execute");
      const result = await useCase.execute(request, mockContext);
      console.log("Test: useCase.execute completed, result:", result);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalled();
      // Check the actual call to debug the issue
      const debugCalls = mockLogger.debug.mock.calls;
      console.log("Debug calls:", debugCalls);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(
          "Use case completed successfully: UpdateTenant",
        ),
        expect.objectContaining({
          useCaseName: "UpdateTenant",
          useCaseVersion: "1.0.0",
          tenantId: mockContext.tenant?.id,
          userId: mockContext.user?.id,
          requestId: mockContext.request.id,
        }),
      );
    });

    it("应该处理仓库保存失败", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockRejectedValue(new Error("数据库连接失败"));

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "数据库连接失败",
      );
    });

    it("应该处理仓库查找失败", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "新租户名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockRejectedValue(new Error("数据库查询失败"));

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "数据库查询失败",
      );
    });
  });

  describe("边界条件", () => {
    it("应该处理特殊字符的租户名称", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "租户@#$%^&*()_+-=[]{}|;':\",./<>?",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result.name).toBe(request.name);
    });

    it("应该处理Unicode字符的租户名称", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "租户🚀🌟💡🎯",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result.name).toBe(request.name);
    });

    it("应该处理数字开头的租户名称", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "123租户",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result.name).toBe(request.name);
    });

    it("应该处理包含空格的租户名称", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "测试 租户 名称",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result.name).toBe(request.name);
    });
  });

  describe("性能测试", () => {
    it("应该能够快速更新租户", async () => {
      // Arrange
      const request = {
        tenantId: TenantId.generate(),
        name: "性能测试租户",
        updatedBy: "admin",
      };

      mockRepository.findById.mockResolvedValue(mockTenantAggregate);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      const startTime = Date.now();

      // Act
      await useCase.execute(request, mockContext);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
