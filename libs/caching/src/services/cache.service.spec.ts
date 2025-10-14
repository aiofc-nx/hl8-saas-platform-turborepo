/**
 * CacheService 单元测试
 *
 * @description 测试缓存服务的基础功能（不依赖真实 Redis）
 *
 * @group services
 */

import { IsolationContext, TenantId } from '@hl8/isolation-model';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { CACHE_OPTIONS, CacheService } from './cache.service.js';
import { RedisService } from './redis.service.js';

// 创建 mock 对象的工厂函数
const createMockRedisClient = () => ({
  get: () => Promise.resolve(null),
  set: () => Promise.resolve('OK'),
  setex: () => Promise.resolve('OK'),
  del: () => Promise.resolve(0),
  exists: () => Promise.resolve(0),
  scan: () => Promise.resolve(['0', []]),
});

const createMockRedisService = () => ({
  getClient: () => createMockRedisClient(),
  healthCheck: () => Promise.resolve(true),
  isClientConnected: () => true,
});

const createMockClsService = () => ({
  get: () => IsolationContext.platform(),
  set: () => {},
});

describe('CacheService', () => {
  let service: CacheService;
  let mockRedisService: any;
  let mockClsService: any;
  let mockRedisClient: any;

  const testOptions = {
    ttl: 3600,
    keyPrefix: 'hl8:cache:',
  };

  beforeEach(async () => {
    mockRedisClient = createMockRedisClient();
    mockRedisService = createMockRedisService();
    mockRedisService.getClient = () => mockRedisClient;
    mockClsService = createMockClsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
        {
          provide: CACHE_OPTIONS,
          useValue: testOptions,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('服务初始化', () => {
    it('应该正确创建服务', () => {
      expect(service).toBeDefined();
    });
  });

  describe('get()', () => {
    it('应该在缓存不存在时返回 undefined', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.get = () => Promise.resolve(null);

      const result = await service.get('user', 'list');

      expect(result).toBeUndefined();
    });

    it('应该返回反序列化的值', async () => {
      mockClsService.get = () => IsolationContext.platform();
      const testValue = { id: 'u999', name: '张三' };
      mockRedisClient.get = () => Promise.resolve(JSON.stringify(testValue));

      const result = await service.get('user', 'profile');

      expect(result).toEqual(testValue);
    });

    it('应该在发生错误时返回 undefined', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.get = () => Promise.reject(new Error('Redis error'));

      const result = await service.get('user', 'list');

      expect(result).toBeUndefined();
    });
  });

  describe('set()', () => {
    it('应该设置缓存（使用默认 TTL）', async () => {
      mockClsService.get = () => IsolationContext.platform();
      const testValue = { test: 'value' };
      let setexCalled = false;
      mockRedisClient.setex = () => {
        setexCalled = true;
        return Promise.resolve('OK');
      };

      await service.set('user', 'profile', testValue);

      expect(setexCalled).toBe(true);
    });

    it('应该在 TTL 为 0 时使用 SET 而非 SETEX', async () => {
      mockClsService.get = () => IsolationContext.platform();
      const testValue = { test: 'value' };
      let setCalled = false;
      let setexCalled = false;

      mockRedisClient.set = () => {
        setCalled = true;
        return Promise.resolve('OK');
      };
      mockRedisClient.setex = () => {
        setexCalled = true;
        return Promise.resolve('OK');
      };

      await service.set('user', 'profile', testValue, 0);

      expect(setCalled).toBe(true);
      expect(setexCalled).toBe(false);
    });
  });

  describe('del()', () => {
    it('应该删除缓存', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.del = () => Promise.resolve(1);

      const result = await service.del('user', 'profile');

      expect(result).toBe(true);
    });

    it('应该在键不存在时返回 false', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.del = () => Promise.resolve(0);

      const result = await service.del('user', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('exists()', () => {
    it('应该检查缓存是否存在', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.exists = () => Promise.resolve(1);

      const result = await service.exists('user', 'profile');

      expect(result).toBe(true);
    });

    it('应该在键不存在时返回 false', async () => {
      mockClsService.get = () => IsolationContext.platform();
      mockRedisClient.exists = () => Promise.resolve(0);

      const result = await service.exists('user', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('自动隔离', () => {
    it('应该使用租户隔离上下文生成键', async () => {
      const UUID_TENANT = '550e8400-e29b-41d4-a716-446655440000';
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      mockClsService.get = () => context;

      let capturedKey: string | undefined;
      mockRedisClient.get = (key: string) => {
        capturedKey = key;
        return Promise.resolve(JSON.stringify({ test: 'value' }));
      };

      await service.get('user', 'list');

      // 检查生成的键包含租户 ID
      expect(capturedKey).toContain('tenant');
      expect(capturedKey).toContain(UUID_TENANT);
    });
  });
});
