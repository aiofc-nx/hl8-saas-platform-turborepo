/**
 * 健康检查服务测试
 *
 * @description 测试 HealthCheckService 的健康检查功能
 */

import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManager } from '../connection/connection.manager.js';
import { HealthCheckService } from './health-check.service.js';

describe('HealthCheckService', () => {
  let service: HealthCheckService;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as any;

    mockConnectionManager = {
      isConnected: jest.fn().mockResolvedValue(true),
      getPoolStats: jest.fn().mockResolvedValue({
        total: 10,
        active: 3,
        idle: 7,
        waiting: 0,
        max: 20,
        min: 5,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: ConnectionManager,
          useValue: mockConnectionManager,
        },
        {
          provide: FastifyLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  describe('check', () => {
    it('应该返回健康状态', async () => {
      const result = await service.check();

      expect(result.status).toBe('healthy');
      expect(result.connection.isConnected).toBe(true);
      expect(result.pool).toEqual({
        total: 10,
        active: 3,
        idle: 7,
        waiting: 0,
        max: 20,
        min: 5,
      });
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('应该在连接失败时返回不健康状态', async () => {
      mockConnectionManager.isConnected.mockResolvedValue(false);

      const result = await service.check();

      expect(result.status).toBe('unhealthy');
      expect(result.connection.isConnected).toBe(false);
    });

    it('应该在连接池接近上限时返回降级状态', async () => {
      mockConnectionManager.getPoolStats.mockResolvedValue({
        total: 19,
        active: 18,
        idle: 1,
        waiting: 0,
        max: 20,
        min: 5,
      });

      const result = await service.check();

      expect(result.status).toBe('degraded');
    });

    it('应该处理检查异常', async () => {
      mockConnectionManager.isConnected.mockRejectedValue(
        new Error('Check failed'),
      );

      const result = await service.check();

      expect(result.status).toBe('unhealthy');
      expect(result.connection.error).toBe('Check failed');
    });
  });

  describe('getPoolStats', () => {
    it('应该返回连接池统计', async () => {
      const stats = await service.getPoolStats();

      expect(stats).toEqual({
        total: 10,
        active: 3,
        idle: 7,
        waiting: 0,
        max: 20,
        min: 5,
      });
    });
  });
});
