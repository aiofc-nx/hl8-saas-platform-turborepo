/**
 * 监控控制器
 * 
 * @description 提供缓存性能指标和健康检查端点
 */

import { Controller, Get } from '@nestjs/common';
import { CacheMetricsService } from '@hl8/nestjs-caching';

@Controller()
export class MetricsController {
  constructor(
    private readonly cacheMetrics: CacheMetricsService,
  ) {}

  /**
   * 获取缓存性能指标
   */
  @Get('metrics')
  getMetrics() {
    const metrics = this.cacheMetrics.getMetrics();
    
    return {
      cache: {
        hits: metrics.hits,
        misses: metrics.misses,
        errors: metrics.errors,
        hitRate: `${(metrics.hitRate * 100).toFixed(2)}%`,
        averageLatency: `${metrics.averageLatency.toFixed(2)}ms`,
        totalOperations: metrics.totalOperations,
      },
      status: metrics.hitRate > 0.8 ? 'excellent' : metrics.hitRate > 0.5 ? 'good' : 'needs-improvement',
    };
  }

  /**
   * 健康检查
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
    };
  }
}

