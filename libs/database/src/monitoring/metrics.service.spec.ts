/**
 * 性能指标服务测试
 *
 * @description 测试 MetricsService 的性能监控功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { MetricsService } from './metrics.service.js';

describe('MetricsService', () => {
  let service: MetricsService;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: FastifyLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  describe('recordQuery', () => {
    it('应该记录普通查询', () => {
      service.recordQuery({
        duration: 500,
        query: 'SELECT * FROM users',
      });

      const slowQueries = service.getSlowQueries();
      expect(slowQueries).toHaveLength(0);
    });

    it('应该记录慢查询', () => {
      service.recordQuery({
        duration: 2000,
        query: 'SELECT * FROM users',
        executedAt: new Date(),
        isSlow: true,
      });

      const slowQueries = service.getSlowQueries();
      expect(slowQueries).toHaveLength(1);
      expect(slowQueries[0].duration).toBe(2000);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '检测到慢查询',
        expect.objectContaining({ duration: 2000 })
      );
    });

    it('应该维护慢查询队列大小上限', () => {
      // 记录超过队列大小的慢查询
      for (let i = 0; i < 150; i++) {
        service.recordQuery({
          duration: 2000,
          query: `Query ${i}`,
          executedAt: new Date(),
          isSlow: true,
        });
      }

      const slowQueries = service.getSlowQueries();
      expect(slowQueries.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getSlowQueries', () => {
    it('应该返回指定数量的慢查询', () => {
      for (let i = 0; i < 50; i++) {
        service.recordQuery({
          duration: 2000,
          query: `Query ${i}`,
          executedAt: new Date(),
          isSlow: true,
        });
      }

      const queries = service.getSlowQueries(10);
      expect(queries).toHaveLength(10);
    });

    it('应该返回所有慢查询', () => {
      for (let i = 0; i < 5; i++) {
        service.recordQuery({
          duration: 2000,
          query: `Query ${i}`,
          executedAt: new Date(),
          isSlow: true,
        });
      }

      const queries = service.getSlowQueries();
      expect(queries).toHaveLength(5);
    });
  });

  describe('getDatabaseMetrics', () => {
    it('应该返回数据库整体指标', () => {
      service.recordQuery({ duration: 100, executedAt: new Date(), isSlow: false });
      service.recordQuery({ duration: 200, executedAt: new Date(), isSlow: false });
      service.recordQuery({ duration: 2000, executedAt: new Date(), isSlow: true });

      const mockPoolStats = {
        total: 10,
        active: 3,
        idle: 7,
        waiting: 0,
        max: 20,
        min: 5,
      };

      const metrics = service.getDatabaseMetrics(mockPoolStats);

      expect(metrics.timestamp).toBeInstanceOf(Date);
      expect(metrics.pool).toEqual(mockPoolStats);
      expect(metrics.queries.total).toBe(3);
      expect(metrics.queries.slowCount).toBe(1);
    });
  });

  describe('事务统计', () => {
    it('应该正确记录事务提交', () => {
      service.recordTransactionCommit();
      service.recordTransactionCommit();

      const mockPoolStats = { total: 10, active: 3, idle: 7, waiting: 0, max: 20, min: 5 };
      const metrics = service.getDatabaseMetrics(mockPoolStats);

      expect(metrics.transactions.committed).toBe(2);
    });

    it('应该正确记录事务回滚', () => {
      service.recordTransactionRollback();

      const mockPoolStats = { total: 10, active: 3, idle: 7, waiting: 0, max: 20, min: 5 };
      const metrics = service.getDatabaseMetrics(mockPoolStats);

      expect(metrics.transactions.rolledBack).toBe(1);
    });
  });
});

