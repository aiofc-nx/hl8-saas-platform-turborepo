/**
 * 健康检查服务
 *
 * @description 提供数据库健康检查功能
 *
 * ## 业务规则
 *
 * ### 健康状态规则
 * - healthy: 连接正常，连接池健康
 * - degraded: 连接正常，但连接池接近上限
 * - unhealthy: 连接失败或不可用
 *
 * ### 检查规则
 * - 检查数据库连通性
 * - 检查连接池状态
 * - 检查响应时间
 * - 记录检查结果
 *
 * @example
 * ```typescript
 * @Controller('health')
 * export class HealthController {
 *   constructor(
 *     private readonly healthCheck: HealthCheckService,
 *   ) {}
 *
 *   @Get('database')
 *   async checkDatabase() {
 *     return this.healthCheck.check();
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { Injectable } from '@nestjs/common';
import { ConnectionManager } from '../connection/connection.manager.js';
import { HealthCheckException } from '../exceptions/health-check.exception.js';
import type { PoolStats } from '../types/connection.types.js';
import type { HealthCheckResult } from '../types/monitoring.types.js';

@Injectable()
export class HealthCheckService {
  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.log('HealthCheckService 初始化');
  }

  /**
   * 执行健康检查
   *
   * @description 检查数据库连接和连接池状态
   *
   * @returns 健康检查结果
   */
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // 检查连接状态
      const isConnected = await this.connectionManager.isConnected();
      const poolStats = await this.connectionManager.getPoolStats();

      const responseTime = Date.now() - startTime;

      // 判断健康状态
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

      if (!isConnected) {
        status = 'unhealthy';
      } else if (poolStats.idle < 2 && poolStats.total >= poolStats.max * 0.9) {
        // 连接池接近上限
        status = 'degraded';
      }

      const result: HealthCheckResult = {
        status,
        checkedAt: new Date(),
        responseTime,
        connection: {
          isConnected,
        },
        pool: poolStats,
      };

      if (status !== 'healthy') {
        // 记录监控日志
        this.logger.warn('数据库健康检查异常', result as any);
        // 抛出业务异常
        throw new HealthCheckException(
          `数据库健康检查失败: ${status}`,
          status,
          result,
        );
      } else {
        // 记录成功日志用于监控
        this.logger.debug('数据库健康检查通过', result as any);
      }

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.error('健康检查失败', (error as Error).stack);

      return {
        status: 'unhealthy',
        checkedAt: new Date(),
        responseTime,
        connection: {
          isConnected: false,
          error: (error as Error).message,
        },
        pool: {
          total: 0,
          active: 0,
          idle: 0,
          waiting: 0,
          max: 0,
          min: 0,
        },
      };
    }
  }

  /**
   * 获取连接池统计
   *
   * @description 获取连接池的实时统计信息
   *
   * @returns 连接池统计
   */
  async getPoolStats(): Promise<PoolStats> {
    return this.connectionManager.getPoolStats();
  }
}
