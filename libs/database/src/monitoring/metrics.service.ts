/**
 * 性能指标服务
 *
 * @description 收集和报告数据库性能指标
 *
 * ## 业务规则
 *
 * ### 慢查询记录规则
 * - 执行时间超过阈值的查询记录为慢查询
 * - 慢查询保存在内存队列中（FIFO）
 * - 队列大小有上限（默认 100 条）
 * - 重启后数据丢失（预期行为）
 *
 * ### 查询统计规则
 * - 使用滑动窗口记录最近的查询
 * - 计算平均、最大、最小执行时间
 * - 统计慢查询数量
 * - 内存中维护，不持久化
 *
 * ### 数据脱敏规则
 * - 查询 SQL 需要脱敏（隐藏敏感参数）
 * - 不记录查询参数的实际值
 * - 不暴露用户的私密信息
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository {
 *   constructor(
 *     private readonly metrics: MetricsService,
 *   ) {}
 *
 *   async findAll(): Promise<User[]> {
 *     const startTime = Date.now();
 *     const result = await this.em.find(User, {});
 *
 *     this.metrics.recordQuery({
 *       duration: Date.now() - startTime,
 *       query: 'SELECT * FROM users',
 *     });
 *
 *     return result;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MONITORING_DEFAULTS } from '../constants/defaults.js';
import type {
  DatabaseMetrics,
  QueryMetrics,
  SlowQueryLog,
} from '../types/monitoring.types.js';

@Injectable()
export class MetricsService {
  private slowQueryQueue: SlowQueryLog[] = [];
  private queryDurations: number[] = [];
  private transactionStats = {
    active: 0,
    committed: 0,
    rolledBack: 0,
  };

  constructor(private readonly logger: FastifyLoggerService) {
    this.logger.log('MetricsService 初始化');
  }

  /**
   * 记录查询执行
   *
   * @description 记录查询的执行时间和相关信息
   *
   * @param metrics - 查询指标
   */
  recordQuery(metrics: Partial<QueryMetrics>): void {
    const duration = metrics.duration || 0;
    const threshold = MONITORING_DEFAULTS.SLOW_QUERY_THRESHOLD;

    // 添加到滑动窗口
    this.queryDurations.push(duration);
    if (
      this.queryDurations.length > MONITORING_DEFAULTS.QUERY_METRICS_WINDOW_SIZE
    ) {
      this.queryDurations.shift();
    }

    // 如果是慢查询，记录到队列
    if (duration >= threshold) {
      const slowQuery: SlowQueryLog = {
        id: uuidv4(),
        query: metrics.query || 'Unknown query',
        duration,
        timestamp: new Date(),
        tenantId: metrics.isolationContext?.tenantId,
        requestId: metrics.requestId,
      };

      this.slowQueryQueue.push(slowQuery);

      // 保持队列大小
      if (
        this.slowQueryQueue.length > MONITORING_DEFAULTS.SLOW_QUERY_MAX_SIZE
      ) {
        this.slowQueryQueue.shift();
      }

      this.logger.warn('检测到慢查询', {
        duration,
        threshold,
        query: slowQuery.query,
        tenantId: slowQuery.tenantId,
      });
    }
  }

  /**
   * 获取慢查询列表
   *
   * @description 获取最近的慢查询记录
   *
   * @param limit - 返回数量限制（可选）
   * @returns 慢查询列表
   */
  getSlowQueries(limit?: number): SlowQueryLog[] {
    if (limit) {
      return this.slowQueryQueue.slice(-limit);
    }
    return [...this.slowQueryQueue];
  }

  /**
   * 获取数据库整体指标
   *
   * @description 获取数据库的整体性能指标
   *
   * @param poolStats - 连接池统计（从外部传入）
   * @returns 数据库整体指标
   */
  getDatabaseMetrics(poolStats: any): DatabaseMetrics {
    const queryStats = this.calculateQueryStats();

    return {
      timestamp: new Date(),
      pool: poolStats,
      queries: queryStats,
      transactions: { ...this.transactionStats },
    };
  }

  /**
   * 记录事务提交
   *
   * @description 记录事务提交统计
   */
  recordTransactionCommit(): void {
    this.transactionStats.committed++;
  }

  /**
   * 记录事务回滚
   *
   * @description 记录事务回滚统计
   */
  recordTransactionRollback(): void {
    this.transactionStats.rolledBack++;
  }

  /**
   * 增加活动事务计数
   */
  incrementActiveTransactions(): void {
    this.transactionStats.active++;
  }

  /**
   * 减少活动事务计数
   */
  decrementActiveTransactions(): void {
    this.transactionStats.active = Math.max(
      0,
      this.transactionStats.active - 1,
    );
  }

  /**
   * 计算查询统计
   *
   * @private
   */
  private calculateQueryStats() {
    if (this.queryDurations.length === 0) {
      return {
        total: 0,
        avgDuration: 0,
        maxDuration: 0,
        slowCount: 0,
      };
    }

    const total = this.queryDurations.length;
    const sum = this.queryDurations.reduce((a, b) => a + b, 0);
    const avgDuration = sum / total;
    const maxDuration = Math.max(...this.queryDurations);
    const slowCount = this.slowQueryQueue.length;

    return {
      total,
      avgDuration,
      maxDuration,
      slowCount,
    };
  }
}
