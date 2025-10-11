/**
 * IsolationContextService 单元测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { IsolationContextService } from './isolation-context.service.js';
import { IsolationContext } from '../../shared/entities/isolation-context.entity.js';
import { IsolationLevel } from '../../shared/enums/isolation-level.enum.js';
import { TenantId } from '../../shared/value-objects/tenant-id.vo.js';

describe('IsolationContextService', () => {
  let service: IsolationContextService;
  let clsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    clsService = {
      set: jest.fn(),
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsolationContextService,
        {
          provide: ClsService,
          useValue: clsService,
        },
      ],
    }).compile();

    service = module.get<IsolationContextService>(IsolationContextService);
  });

  describe('setIsolationContext', () => {
    it('应该设置隔离上下文到 CLS', () => {
      const context = IsolationContext.createPlatform();

      service.setIsolationContext(context);

      expect(clsService.set).toHaveBeenCalledWith('ISOLATION_CONTEXT', context);
    });
  });

  describe('getIsolationContext', () => {
    it('应该从 CLS 获取隔离上下文', () => {
      const context = IsolationContext.createPlatform();
      clsService.get.mockReturnValue(context);

      const result = service.getIsolationContext();

      expect(result).toBe(context);
      expect(clsService.get).toHaveBeenCalledWith('ISOLATION_CONTEXT');
    });

    it('上下文不存在时应该返回 undefined', () => {
      clsService.get.mockReturnValue(undefined);

      const result = service.getIsolationContext();

      expect(result).toBeUndefined();
    });
  });

  describe('getTenantId', () => {
    it('应该返回租户 ID', () => {
      const tenantId = TenantId.generate();
      const context = IsolationContext.createTenant(tenantId);
      clsService.get.mockReturnValue(context);

      const result = service.getTenantId();

      expect(result).toBe(tenantId);
    });

    it('上下文不存在时应该返回 undefined', () => {
      clsService.get.mockReturnValue(undefined);

      const result = service.getTenantId();

      expect(result).toBeUndefined();
    });
  });

  describe('getIsolationLevel', () => {
    it('平台级上下文应该返回 PLATFORM', () => {
      const context = IsolationContext.createPlatform();
      clsService.get.mockReturnValue(context);

      const result = service.getIsolationLevel();

      expect(result).toBe(IsolationLevel.PLATFORM);
    });

    it('租户级上下文应该返回 TENANT', () => {
      const tenantId = TenantId.generate();
      const context = IsolationContext.createTenant(tenantId);
      clsService.get.mockReturnValue(context);

      const result = service.getIsolationLevel();

      expect(result).toBe(IsolationLevel.TENANT);
    });

    it('上下文不存在时应该返回 PLATFORM', () => {
      clsService.get.mockReturnValue(undefined);

      const result = service.getIsolationLevel();

      expect(result).toBe(IsolationLevel.PLATFORM);
    });
  });

  describe('isPlatformLevel', () => {
    it('平台级上下文应该返回 true', () => {
      const context = IsolationContext.createPlatform();
      clsService.get.mockReturnValue(context);

      expect(service.isPlatformLevel()).toBe(true);
    });

    it('租户级上下文应该返回 false', () => {
      const tenantId = TenantId.generate();
      const context = IsolationContext.createTenant(tenantId);
      clsService.get.mockReturnValue(context);

      expect(service.isPlatformLevel()).toBe(false);
    });

    it('上下文不存在时应该返回 true', () => {
      clsService.get.mockReturnValue(undefined);

      expect(service.isPlatformLevel()).toBe(true);
    });
  });
});

