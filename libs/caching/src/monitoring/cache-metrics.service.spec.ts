/**
 * CacheMetricsService 单元测试
 *
 * @description 测试缓存性能指标服务的功能
 */

import { CacheMetricsService } from './cache-metrics.service.js';

describe('CacheMetricsService', () => {
  let service: CacheMetricsService;

  beforeEach(() => {
    service = new CacheMetricsService();
  });

  describe('recordHit()', () => {
    it('应该增加命中次数', () => {
      service.recordHit(10);
      service.recordHit(20);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(2);
    });

    it('应该累加延迟', () => {
      service.recordHit(10);
      service.recordHit(20);

      const metrics = service.getMetrics();
      expect(metrics.averageLatency).toBe(15); // (10 + 20) / 2
    });
  });

  describe('recordMiss()', () => {
    it('应该增加未命中次数', () => {
      service.recordMiss(30);
      service.recordMiss(40);

      const metrics = service.getMetrics();
      expect(metrics.misses).toBe(2);
    });

    it('应该累加延迟', () => {
      service.recordMiss(30);
      service.recordMiss(40);

      const metrics = service.getMetrics();
      expect(metrics.averageLatency).toBe(35); // (30 + 40) / 2
    });
  });

  describe('recordError()', () => {
    it('应该增加错误次数', () => {
      service.recordError(50);
      service.recordError(60);

      const metrics = service.getMetrics();
      expect(metrics.errors).toBe(2);
    });

    it('应该累加延迟', () => {
      service.recordError(50);
      service.recordError(60);

      const metrics = service.getMetrics();
      expect(metrics.averageLatency).toBe(55); // (50 + 60) / 2
    });
  });

  describe('getHitRate()', () => {
    it('应该返回 0 当没有操作时', () => {
      const hitRate = service.getHitRate();
      expect(hitRate).toBe(0);
    });

    it('应该正确计算命中率', () => {
      service.recordHit(10);
      service.recordHit(10);
      service.recordHit(10);
      service.recordMiss(10);

      const hitRate = service.getHitRate();
      expect(hitRate).toBe(0.75); // 3 / 4
    });

    it('应该返回 1 当所有操作都命中时', () => {
      service.recordHit(10);
      service.recordHit(10);

      const hitRate = service.getHitRate();
      expect(hitRate).toBe(1);
    });

    it('应该返回 0 当所有操作都未命中时', () => {
      service.recordMiss(10);
      service.recordMiss(10);

      const hitRate = service.getHitRate();
      expect(hitRate).toBe(0);
    });

    it('不应该计入错误次数', () => {
      service.recordHit(10);
      service.recordMiss(10);
      service.recordError(10);

      const hitRate = service.getHitRate();
      expect(hitRate).toBe(0.5); // 1 / 2（错误不计入）
    });
  });

  describe('getAverageLatency()', () => {
    it('应该返回 0 当没有操作时', () => {
      const avgLatency = service.getAverageLatency();
      expect(avgLatency).toBe(0);
    });

    it('应该正确计算平均延迟', () => {
      service.recordHit(10);
      service.recordMiss(20);
      service.recordError(30);

      const avgLatency = service.getAverageLatency();
      expect(avgLatency).toBe(20); // (10 + 20 + 30) / 3
    });

    it('应该计入所有操作类型', () => {
      service.recordHit(5);
      service.recordMiss(15);
      service.recordError(25);
      service.recordHit(35);

      const avgLatency = service.getAverageLatency();
      expect(avgLatency).toBe(20); // (5 + 15 + 25 + 35) / 4
    });
  });

  describe('getMetrics()', () => {
    it('应该返回初始指标', () => {
      const metrics = service.getMetrics();

      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        errors: 0,
        hitRate: 0,
        averageLatency: 0,
        totalOperations: 0,
      });
    });

    it('应该返回完整的指标', () => {
      service.recordHit(10);
      service.recordHit(10);
      service.recordMiss(10);
      service.recordError(10);

      const metrics = service.getMetrics();

      expect(metrics).toEqual({
        hits: 2,
        misses: 1,
        errors: 1,
        hitRate: 0.6666666666666666, // 2 / 3
        averageLatency: 10,
        totalOperations: 4,
      });
    });

    it('应该正确计算总操作次数', () => {
      service.recordHit(10);
      service.recordMiss(10);
      service.recordError(10);

      const metrics = service.getMetrics();
      expect(metrics.totalOperations).toBe(3);
    });
  });

  describe('reset()', () => {
    it('应该清空所有指标', () => {
      service.recordHit(10);
      service.recordMiss(20);
      service.recordError(30);

      service.reset();

      const metrics = service.getMetrics();
      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        errors: 0,
        hitRate: 0,
        averageLatency: 0,
        totalOperations: 0,
      });
    });

    it('应该允许在重置后重新记录', () => {
      service.recordHit(10);
      service.reset();

      service.recordHit(20);
      service.recordMiss(30);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalOperations).toBe(2);
      expect(metrics.averageLatency).toBe(25); // (20 + 30) / 2
    });
  });

  describe('综合场景', () => {
    it('应该正确处理混合操作', () => {
      // 模拟实际使用场景
      service.recordHit(5); // 快速命中
      service.recordHit(8); // 快速命中
      service.recordHit(12); // 快速命中
      service.recordMiss(50); // 未命中，查询数据库
      service.recordMiss(60); // 未命中，查询数据库
      service.recordError(100); // 错误

      const metrics = service.getMetrics();

      expect(metrics.hits).toBe(3);
      expect(metrics.misses).toBe(2);
      expect(metrics.errors).toBe(1);
      expect(metrics.totalOperations).toBe(6);
      expect(metrics.hitRate).toBe(0.6); // 3 / 5（不计入错误）
      expect(metrics.averageLatency).toBeCloseTo(39.17, 1); // (5+8+12+50+60+100) / 6
    });
  });
});
