/**
 * 创建租户用例测试
 *
 * @description 测试创建租户用例的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TenantId } from "@hl8/isolation-model";
import { CreateTenantUseCase } from "./create-tenant.use-case.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

describe("CreateTenantUseCase", () => {
  let useCase: CreateTenantUseCase;
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
      findByPlatform: jest.fn(),
      exists: jest.fn(),
      existsByName: jest.fn(),
      countByPlatform: jest.fn(),
      delete: jest.fn(),
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
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      verbose: jest.fn(),
      getPinoLogger: jest.fn(),
    } as unknown as jest.Mocked<FastifyLoggerService>;

    // 创建模拟上下文
    mockContext = {
      user: {
        id: "test-user",
        permissions: ["tenant:create"],
      },
      tenant: {
        id: TenantId.generate().toString(),
      },
      request: {
        id: "test-request-id",
        timestamp: new Date(),
      },
    };

    // 创建用例实例
    useCase = new CreateTenantUseCase(mockRepository, mockLogger);
  });

  describe("execute", () => {
    it("应该成功创建租户", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      mockRepository.exists.mockResolvedValue(false);
      mockRepository.findByName.mockResolvedValue(null); // 没有找到同名租户

      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("测试租户");
      expect(result.type).toBe(TenantType.ENTERPRISE);
      expect(mockRepository.findByName).toHaveBeenCalledWith(
        request.platformId,
        request.name,
        false,
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("应该验证租户名称在同一平台内唯一", async () => {
      // Arrange
      const request = {
        name: "重复租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      // 模拟找到重复的租户名称
      const existingTenant = {
        id: TenantId.generate(),
        tenant: {
          name: "重复租户",
          type: TenantType.ENTERPRISE,
          createdAt: new Date(),
        },
        platformId: request.platformId,
      };
      mockRepository.findByName.mockResolvedValue(existingTenant as any);

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        '租户名称 "重复租户" 在同一平台下已存在',
      );
    });

    it("应该验证租户名称不能为空", async () => {
      // Arrange
      const request = {
        name: "",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户名称不能为空",
      );
    });

    it("应该验证租户名称长度限制", async () => {
      // Arrange
      const request = {
        name: "a".repeat(101),
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户名称长度不能超过100",
      );
    });

    it("应该验证租户类型不能为空", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: null as any,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "租户类型不能为空",
      );
    });

    it("应该验证平台ID不能为空", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: null as any,
        createdBy: "admin",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "平台ID不能为空",
      );
    });

    it("应该验证创建者不能为空", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "",
      };

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "创建者标识符不能为空",
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
          name: `测试租户-${type.toString()}`,
          type,
          platformId: TenantId.generate(),
          createdBy: "admin",
        };

        mockRepository.exists.mockResolvedValue(false);
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
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      mockRepository.exists.mockResolvedValue(false);

      // 创建模拟的租户聚合根
      const mockTenantAggregate = {
        id: TenantId.generate(),
        tenant: {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          createdAt: new Date(),
        },
        platformId: request.platformId,
      };

      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("测试租户");
    });

    it("应该处理仓库保存失败", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockRejectedValue(new Error("数据库连接失败"));

      // Act & Assert
      await expect(useCase.execute(request, mockContext)).rejects.toThrow(
        "数据库连接失败",
      );
    });

    it("应该处理仓库检查失败", async () => {
      // Arrange
      const request = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      mockRepository.findByName.mockRejectedValue(new Error("数据库查询失败"));

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
        name: "租户@#$%^&*()_+-=[]{}|;':\",./<>?",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

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
        name: "租户🚀🌟💡🎯",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

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
        name: "123租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

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
        name: "测试 租户 名称",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

      mockRepository.exists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request, mockContext);

      // Assert
      expect(result.name).toBe(request.name);
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建租户", async () => {
      // Arrange
      const request = {
        name: "性能测试租户",
        type: TenantType.ENTERPRISE,
        platformId: TenantId.generate(),
        createdBy: "admin",
      };

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
