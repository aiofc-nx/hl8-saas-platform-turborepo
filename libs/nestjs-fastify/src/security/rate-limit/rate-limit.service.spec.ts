/**
 * @fileoverview RateLimitService 单元测试
 */

import { RateLimitService } from './rate-limit.service';
import type { RateLimitOptions } from './types/rate-limit-options';

describe('RateLimitService', () => {
  let service: RateLimitService;
  const mockRequest = {
    ip: '192.168.1.1',
    headers: {},
    routerPath: '/api/users',
  };

  afterEach(() => {
    if (service) {
      service.clearMemoryStore();
    }
  });

  describe('基础功能', () => {
    it('应该正确创建服务实例', () => {
      const options: RateLimitOptions = {
        max: 100,
        timeWindow: 60000,
      };

      service = new RateLimitService(options);
      expect(service).toBeDefined();
    });
  });

  describe('IP 策略', () => {
    beforeEach(() => {
      service = new RateLimitService({
        max: 5,
        timeWindow: 60000,
        strategy: 'ip',
      });
    });

    it('应该生成正确的 IP 键', () => {
      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:ip:192.168.1.1');
    });

    it('应该允许未超限的请求', async () => {
      const status = await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(4);
      expect(status.total).toBe(5);
    });

    it('应该拒绝超限的请求', async () => {
      // 发送 6 个请求
      for (let i = 0; i < 6; i++) {
        await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      const status = await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(status.allowed).toBe(false);
      expect(status.remaining).toBe(0);
    });
  });

  describe('租户策略', () => {
    beforeEach(() => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
        strategy: 'tenant',
      });
    });

    it('应该生成正确的租户键', () => {
      const reqWithTenant = {
        ...mockRequest,
        headers: { 'x-tenant-id': 'tenant-123' },
      };

      const key = service.generateKey(reqWithTenant as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:tenant:tenant-123');
    });

    it('应该在缺少租户 ID 时降级为 IP 策略', () => {
      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:ip:192.168.1.1');
    });

    it('应该为不同租户分别计数', async () => {
      const tenant1 = {
        ...mockRequest,
        headers: { 'x-tenant-id': 'tenant-1' },
      };
      const tenant2 = {
        ...mockRequest,
        headers: { 'x-tenant-id': 'tenant-2' },
      };

      // 租户1 发送 3 个请求
      for (let i = 0; i < 3; i++) {
        await service.check(tenant1 as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      // 租户2 发送 2 个请求
      for (let i = 0; i < 2; i++) {
        await service.check(tenant2 as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      const status1 = await service.getStatus(tenant1 as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      const status2 = await service.getStatus(tenant2 as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      expect(status1.remaining).toBe(7); // 10 - 3
      expect(status2.remaining).toBe(8); // 10 - 2
    });
  });

  describe('用户策略', () => {
    beforeEach(() => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
        strategy: 'user',
      });
    });

    it('应该生成正确的用户键', () => {
      const reqWithUser = {
        ...mockRequest,
        headers: { 'x-user-id': 'user-456' },
      };

      const key = service.generateKey(reqWithUser as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:user:user-456');
    });

    it('应该在缺少用户 ID 时降级为租户策略', () => {
      const reqWithTenant = {
        ...mockRequest,
        headers: { 'x-tenant-id': 'tenant-123' },
      };

      const key = service.generateKey(reqWithTenant as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:tenant:tenant-123');
    });

    it('应该在缺少用户和租户 ID 时降级为 IP 策略', () => {
      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:ip:192.168.1.1');
    });
  });

  describe('自定义策略', () => {
    it('应该使用自定义键生成函数', () => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
        strategy: 'custom',
        keyGenerator: (req) => `custom:${req.ip}:${req.routerPath}`,
      });

      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:custom:custom:192.168.1.1:/api/users');
    });

    it('应该在缺少 keyGenerator 时降级为 IP 策略', () => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
        strategy: 'custom',
      });

      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:ip:192.168.1.1');
    });
  });

  describe('getStatus()', () => {
    beforeEach(() => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
      });
    });

    it('应该返回当前状态而不增加计数', async () => {
      // 发送 3 个请求
      for (let i = 0; i < 3; i++) {
        await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      // 获取状态（不增加计数）
      const status1 = await service.getStatus(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(status1.remaining).toBe(7);

      // 再次获取状态
      const status2 = await service.getStatus(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(status2.remaining).toBe(7); // 保持不变
    });

    it('应该返回新请求的初始状态', async () => {
      const status = await service.getStatus(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(10);
      expect(status.total).toBe(10);
    });
  });

  describe('内存存储', () => {
    beforeEach(() => {
      service = new RateLimitService({
        max: 5,
        timeWindow: 1000, // 1 秒
      });
    });

    it('应该在时间窗口过期后重置计数', async () => {
      // 发送 3 个请求
      for (let i = 0; i < 3; i++) {
        await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      const status1 = await service.getStatus(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(status1.remaining).toBe(2);

      // 等待时间窗口过期
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 新的时间窗口，计数重置
      const status2 = await service.check(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(status2.remaining).toBe(4); // 重置后剩余 5-1=4
    });
  });

  describe('错误处理', () => {
    it('应该在键生成错误时降级为 IP 策略', () => {
      service = new RateLimitService({
        max: 10,
        timeWindow: 60000,
        strategy: 'custom',
        keyGenerator: () => {
          throw new Error('键生成失败');
        },
      });

      const key = service.generateKey(mockRequest as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(key).toBe('ratelimit:ip:192.168.1.1');
    });
  });
});

