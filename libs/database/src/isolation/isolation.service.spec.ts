/**
 * 数据隔离服务测试
 *
 * @description 测试 DatabaseIsolationService 的隔离功能
 */

import { FastifyLoggerService } from "@hl8/hybrid-archi";
import { IsolationContextService } from "@hl8/hybrid-archi";
import { Test, TestingModule } from "@nestjs/testing";
import { IsolationContextMissingException } from "../exceptions/isolation-context-missing.exception.js";
import {
  DatabaseIsolationService,
  IsolationLevel,
} from "./isolation.service.js";

describe("DatabaseIsolationService", () => {
  let service: DatabaseIsolationService;
  let mockIsolationService: any;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockIsolationService = {
      context: undefined,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseIsolationService,
        {
          provide: IsolationContextService,
          useValue: mockIsolationService,
        },
        {
          provide: FastifyLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<DatabaseIsolationService>(DatabaseIsolationService);
  });

  describe("validateContext", () => {
    it("应该在缺少上下文时抛出异常", () => {
      expect(() => {
        service.validateContext(IsolationLevel.TENANT);
      }).toThrow(IsolationContextMissingException);
    });

    it("应该在租户级隔离时验证租户 ID", () => {
      mockIsolationService.context = {
        tenantId: { getValue: () => "tenant-123" },
      };

      expect(() => {
        service.validateContext(IsolationLevel.TENANT);
      }).not.toThrow();
    });

    it("应该在组织级隔离时验证租户和组织 ID", () => {
      mockIsolationService.context = {
        tenantId: { getValue: () => "tenant-123" },
        organizationId: { getValue: () => "org-456" },
      };

      expect(() => {
        service.validateContext(IsolationLevel.ORGANIZATION);
      }).not.toThrow();
    });
  });

  describe("buildIsolationFilter", () => {
    it("应该构建租户级过滤条件", () => {
      mockIsolationService.context = {
        tenantId: { getValue: () => "tenant-123" },
      };

      const filter = service.buildIsolationFilter(IsolationLevel.TENANT);
      expect(filter).toEqual({ tenantId: "tenant-123" });
    });

    it("应该构建组织级过滤条件", () => {
      mockIsolationService.context = {
        tenantId: { getValue: () => "tenant-123" },
        organizationId: { getValue: () => "org-456" },
      };

      const filter = service.buildIsolationFilter(IsolationLevel.ORGANIZATION);
      expect(filter).toEqual({
        tenantId: "tenant-123",
        organizationId: "org-456",
      });
    });
  });

  describe("getTenantId", () => {
    it("应该返回租户 ID", () => {
      mockIsolationService.context = {
        tenantId: { getValue: () => "tenant-123" },
      };

      expect(service.getTenantId()).toBe("tenant-123");
    });

    it("应该在无上下文时返回 undefined", () => {
      expect(service.getTenantId()).toBeUndefined();
    });
  });
});
