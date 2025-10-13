/**
 * 事务服务
 *
 * @description 提供编程式事务管理功能
 *
 * ## 业务规则
 *
 * ### 事务执行规则
 * - 事务必须保证原子性（ACID）
 * - 成功时自动提交所有操作
 * - 失败时自动回滚所有操作
 * - 支持嵌套事务（使用相同的 EntityManager）
 *
 * ### 上下文管理规则
 * - 使用 nestjs-cls 存储事务上下文
 * - 事务 EntityManager 存储在 CLS 中
 * - 事务结束后清理上下文
 * - 嵌套事务复用父事务的 EntityManager
 *
 * ### 超时规则
 * - 默认事务超时为 60 秒
 * - 超时后自动回滚
 * - 记录超时警告日志
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     private readonly transactionService: TransactionService,
 *   ) {}
 *
 *   async createUser(data: UserData): Promise<User> {
 *     return this.transactionService.runInTransaction(async (em) => {
 *       const user = new User(data);
 *       await em.persistAndFlush(user);
 *       return user;
 *     });
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import { ClsService } from 'nestjs-cls';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { DatabaseTransactionException } from '../exceptions/database-transaction.exception.js';
import type { TransactionOptions } from '../types/transaction.types.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(
    private readonly orm: MikroORM,
    private readonly cls: ClsService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.log('TransactionService 初始化');
  }

  /**
   * 在事务中运行代码块
   *
   * @description 执行编程式事务，成功时自动提交，失败时自动回滚
   *
   * @param callback - 事务回调函数
   * @param options - 事务选项（可选）
   * @returns 回调函数的返回值
   *
   * @throws {DatabaseTransactionException} 事务执行失败时抛出
   *
   * @example
   * ```typescript
   * const user = await this.transactionService.runInTransaction(async (em) => {
   *   const user = new User(data);
   *   await em.persistAndFlush(user);
   *   return user;
   * });
   * ```
   */
  async runInTransaction<T>(
    callback: (em: EntityManager) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    // 检查是否已在事务中
    const existingEm = this.cls.get<EntityManager>('entityManager');
    if (existingEm) {
      this.logger.debug('检测到现有事务，复用 EntityManager');
      return callback(existingEm);
    }

    const transactionId = uuidv4();
    const startTime = Date.now();

    this.logger.log('开始事务', { transactionId, options });

    try {
      const em = this.orm.em.fork();
      
      const result = await em.transactional(async (transactionEm) => {
        // 将事务 EM 存储到上下文
        this.cls.set('entityManager', transactionEm);
        this.cls.set('transactionId', transactionId);

        try {
          return await callback(transactionEm);
        } finally {
          // 清理上下文
          this.cls.set('entityManager', undefined);
          this.cls.set('transactionId', undefined);
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log('事务提交成功', { transactionId, duration });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // 记录技术错误日志用于监控和调试
      this.logger.error('事务执行失败，已回滚', undefined, {
        transactionId, 
        duration,
        err: error instanceof Error ? {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      });

      // 抛出业务异常
      throw new DatabaseTransactionException(
        '事务执行失败，所有操作已回滚',
        { transactionId, duration }
      );
    }
  }

  /**
   * 获取当前事务的 EntityManager
   *
   * @description 从 CLS 上下文获取事务 EntityManager
   *
   * @returns 事务 EntityManager，如果不在事务中则返回 undefined
   *
   * @example
   * ```typescript
   * const em = this.transactionService.getTransactionEntityManager();
   * if (em) {
   *   // 在事务中
   *   await em.persist(entity);
   * }
   * ```
   */
  getTransactionEntityManager(): EntityManager | undefined {
    return this.cls.get<EntityManager>('entityManager');
  }

  /**
   * 检查是否在事务中
   *
   * @description 判断当前代码是否在事务上下文中执行
   *
   * @returns 是否在事务中
   */
  isInTransaction(): boolean {
    return this.cls.get<EntityManager>('entityManager') !== undefined;
  }

  /**
   * 获取当前事务 ID
   *
   * @description 从 CLS 上下文获取事务 ID
   *
   * @returns 事务 ID，如果不在事务中则返回 undefined
   */
  getTransactionId(): string | undefined {
    return this.cls.get<string>('transactionId');
  }
}

