/**
 * MultiLevelIsolationService 单元测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MultiLevelIsolationService, DataAccessContext } from './multi-level-isolation.service.js';
import { IsolationContextService } from './isolation-context.service.js';
import { IsolationContext } from '@hl8/platform';
import { IsolationLevel } from '@hl8/platform';
import { DataSharingLevel } from '@hl8/platform';
import { TenantId } from '@hl8/platform';
import { OrganizationId } from '@hl8/platform';
import { UserId } from '@hl8/platform';

describe('MultiLevelIsolationService', () => {
  let service: MultiLevelIsolationService;
  let contextService: jest.Mocked<IsolationContextService>;

  beforeEach(async () => {
    contextService = {
      getIsolationLevel: jest.fn(),
      getIsolationContext: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiLevelIsolationService,
        {
          provide: IsolationContextService,
          useValue: contextService,
        },
      ],
    }).compile();

    service = module.get<MultiLevelIsolationService>(MultiLevelIsolationService);
  });

  describe('validateIsolation', () => {
    it('平台级应该满足所有隔离要求', () => {
      contextService.getIsolationLevel.mockReturnValue(IsolationLevel.PLATFORM);

      expect(service.validateIsolation(IsolationLevel.PLATFORM)).toBe(true);
      expect(service.validateIsolation(IsolationLevel.TENANT)).toBe(true);
      expect(service.validateIsolation(IsolationLevel.USER)).toBe(true);
    });

    it('租户级应该满足租户及以下隔离要求', () => {
      contextService.getIsolationLevel.mockReturnValue(IsolationLevel.TENANT);

      expect(service.validateIsolation(IsolationLevel.PLATFORM)).toBe(false);
      expect(service.validateIsolation(IsolationLevel.TENANT)).toBe(true);
      expect(service.validateIsolation(IsolationLevel.USER)).toBe(true);
    });

    it('用户级只满足用户级隔离要求', () => {
      contextService.getIsolationLevel.mockReturnValue(IsolationLevel.USER);

      expect(service.validateIsolation(IsolationLevel.PLATFORM)).toBe(false);
      expect(service.validateIsolation(IsolationLevel.TENANT)).toBe(false);
      expect(service.validateIsolation(IsolationLevel.USER)).toBe(true);
    });
  });

  describe('checkAccess', () => {
    it('平台级上下文可以访问所有数据', () => {
      const platformContext = IsolationContext.createPlatform();
      contextService.getIsolationContext.mockReturnValue(platformContext);

      const dataContext: DataAccessContext = {
        isShared: false,
        ownerId: 'user-123',
      };

      expect(service.checkAccess(dataContext)).toBe(true);
    });

    it('应该检查非共享数据的所有权', () => {
      const userId = UserId.generate();
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = UserId.generate();
      
      const userContext = IsolationContext.createUser(tenantId, orgId, deptId, userId);
      contextService.getIsolationContext.mockReturnValue(userContext);

      const dataContext: DataAccessContext = {
        isShared: false,
        ownerId: userId.value,
      };

      expect(service.checkAccess(dataContext)).toBe(true);
    });

    it('非所有者不能访问非共享数据', () => {
      const userId = UserId.generate();
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = UserId.generate();
      
      const userContext = IsolationContext.createUser(tenantId, orgId, deptId, userId);
      contextService.getIsolationContext.mockReturnValue(userContext);

      const dataContext: DataAccessContext = {
        isShared: false,
        ownerId: 'other-user',
      };

      expect(service.checkAccess(dataContext)).toBe(false);
    });

    it('应该允许访问平台级共享数据', () => {
      const userId = UserId.generate();
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = UserId.generate();
      
      const userContext = IsolationContext.createUser(tenantId, orgId, deptId, userId);
      contextService.getIsolationContext.mockReturnValue(userContext);

      const dataContext: DataAccessContext = {
        isShared: true,
        sharingLevel: DataSharingLevel.PLATFORM,
      };

      expect(service.checkAccess(dataContext)).toBe(true);
    });

    it('应该检查租户级共享数据访问权限', () => {
      const tenantId = TenantId.generate();
      const tenantContext = IsolationContext.createTenant(tenantId);
      contextService.getIsolationContext.mockReturnValue(tenantContext);

      const dataContext: DataAccessContext = {
        isShared: true,
        sharingLevel: DataSharingLevel.TENANT,
        sharedWith: [tenantId.value],
      };

      expect(service.checkAccess(dataContext)).toBe(true);
    });

    it('不在共享列表中应该无法访问', () => {
      const tenantId = TenantId.generate();
      const tenantContext = IsolationContext.createTenant(tenantId);
      contextService.getIsolationContext.mockReturnValue(tenantContext);

      const dataContext: DataAccessContext = {
        isShared: true,
        sharingLevel: DataSharingLevel.TENANT,
        sharedWith: ['other-tenant'],
      };

      expect(service.checkAccess(dataContext)).toBe(false);
    });

    it('私有共享级别应该检查所有权', () => {
      const userId = UserId.generate();
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = UserId.generate();
      
      const userContext = IsolationContext.createUser(tenantId, orgId, deptId, userId);
      contextService.getIsolationContext.mockReturnValue(userContext);

      const dataContext: DataAccessContext = {
        isShared: true,
        sharingLevel: DataSharingLevel.PRIVATE,
        ownerId: userId.value,
      };

      expect(service.checkAccess(dataContext)).toBe(true);
    });
  });
});

