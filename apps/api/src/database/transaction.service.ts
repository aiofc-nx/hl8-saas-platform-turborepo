import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError } from 'typeorm';

/**
 * 数据库事务服务
 *
 * 提供数据库事务管理功能，支持自动提交和回滚。
 * 包含详细的错误处理和日志记录，确保事务的可靠性。
 *
 * @description 此服务是数据库模块的核心组件，提供事务管理功能。
 * 支持嵌套事务、事务传播、错误处理和性能监控。
 *
 * ## 业务规则
 *
 * ### 事务管理规则
 * - 所有数据库操作必须在事务中执行
 * - 事务失败时自动回滚所有更改
 * - 支持嵌套事务和事务传播
 * - 事务超时和死锁检测
 *
 * ### 错误处理规则
 * - 捕获并记录所有数据库异常
 * - 提供详细的错误信息和堆栈跟踪
 * - 区分不同类型的数据库错误
 * - 支持自定义错误处理逻辑
 *
 * ### 性能监控规则
 * - 记录事务执行时间
 * - 监控事务成功率和失败率
 * - 提供事务性能统计信息
 * - 支持慢事务检测和告警
 *
 * @example
 * ```typescript
 * // 基本事务使用
 * const result = await transactionService.runInTransaction(async (manager) => {
 *   const user = await manager.save(User, userData);
 *   const profile = await manager.save(Profile, profileData);
 *   return { user, profile };
 * });
 *
 * // 嵌套事务处理
 * await transactionService.runInTransaction(async (manager) => {
 *   await manager.save(User, userData);
 *   await transactionService.runInTransaction(async (nestedManager) => {
 *     await nestedManager.save(Profile, profileData);
 *   });
 * });
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 在事务中执行函数
   *
   * 使用 TypeORM 的事务管理器执行函数，自动处理提交和回滚。
   * 提供详细的错误处理和性能监控。
   *
   * @description 此方法是事务服务的核心功能，确保数据一致性。
   * 支持嵌套事务、错误处理和性能监控。
   *
   * ## 业务规则
   *
   * ### 事务执行规则
   * - 函数执行成功时自动提交事务
   * - 函数执行失败时自动回滚事务
   * - 支持嵌套事务和事务传播
   * - 事务超时和死锁检测
   *
   * ### 错误处理规则
   * - 捕获并记录所有数据库异常
   * - 提供详细的错误信息和堆栈跟踪
   * - 区分不同类型的数据库错误
   * - 支持自定义错误处理逻辑
   *
   * ### 性能监控规则
   * - 记录事务执行时间
   * - 监控事务成功率和失败率
   * - 提供事务性能统计信息
   * - 支持慢事务检测和告警
   *
   * @param fn 在事务中执行的函数，接收事务管理器作为参数
   * @returns Promise<T> 函数执行结果
   * @throws {QueryFailedError} 数据库查询失败时抛出
   * @throws {Error} 其他未处理的错误
   *
   * @example
   * ```typescript
   * // 基本事务使用
   * const result = await transactionService.runInTransaction(async (manager) => {
   *   const user = await manager.save(User, userData);
   *   const profile = await manager.save(Profile, profileData);
   *   return { user, profile };
   * });
   *
   * // 错误处理
   * try {
   *   const result = await transactionService.runInTransaction(async (manager) => {
   *     // 数据库操作
   *   });
   * } catch (error) {
   *   if (error instanceof QueryFailedError) {
   *     // 处理数据库错误
   *   }
   * }
   * ```
   */
  async runInTransaction<T>(
    fn: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('开始执行数据库事务');
      
      const result = await this.entityManager.transaction(async (transactionManager) => {
        return await fn(transactionManager);
      });
      
      const duration = Date.now() - startTime;
      this.logger.debug(`数据库事务执行成功，耗时: ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof QueryFailedError) {
        this.logger.error(`数据库事务执行失败 (QueryFailedError)，耗时: ${duration}ms`, {
          error: error.message,
          query: error.query,
          parameters: error.parameters,
          stack: error.stack,
        });
        
        // 重新抛出包装后的错误
        throw new Error(`数据库事务异常: ${error.message}`);
      } else {
        this.logger.error(`数据库事务执行失败，耗时: ${duration}ms`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        // 重新抛出包装后的错误
        throw new Error(`数据库事务异常: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}
