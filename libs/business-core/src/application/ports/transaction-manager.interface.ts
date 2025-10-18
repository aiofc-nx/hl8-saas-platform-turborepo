/**
 * 事务管理器接口
 *
 * @description 定义事务管理的接口，支持事务的开始、提交、回滚等操作
 *
 * ## 业务规则
 *
 * ### 事务管理规则
 * - 事务应该是原子性的，要么全部成功，要么全部失败
 * - 事务应该有明确的边界，与用例边界对齐
 * - 事务失败时应该回滚所有变更
 * - 事务成功时应该提交所有变更
 *
 * ### 事务隔离规则
 * - 支持不同的事务隔离级别
 * - 支持并发事务处理
 * - 支持事务嵌套（可选）
 * - 支持分布式事务（可选）
 *
 * ### 事务生命周期规则
 * - 事务开始：开始数据库事务
 * - 事务执行：执行业务逻辑
 * - 事务提交：提交所有变更
 * - 事务回滚：回滚所有变更
 *
 * @example
 * ```typescript
 * // 在事务中执行操作
 * const result = await transactionManager.execute(async () => {
 *   const user = await this.createUser(userData);
 *   await this.userRepository.save(user);
 *   return user;
 * });
 *
 * // 手动事务管理
 * await transactionManager.begin();
 * try {
 *   await this.userRepository.save(user);
 *   await transactionManager.commit();
 * } catch (error) {
 *   await transactionManager.rollback();
 *   throw error;
 * }
 * ```
 *
 * @since 1.0.0
 */

/**
 * 事务管理器接口
 *
 * @description 定义事务管理的接口，支持事务的开始、提交、回滚等操作
 */
export interface ITransactionManager {
  /**
   * 在事务中执行操作
   *
   * @description 在事务中执行指定的操作，自动处理事务的开始、提交和回滚
   *
   * @param operation - 要执行的操作
   * @returns Promise<T> 操作结果
   *
   * @example
   * ```typescript
   * const result = await transactionManager.execute(async () => {
   *   const user = await this.createUser(userData);
   *   await this.userRepository.save(user);
   *   return user;
   * });
   * ```
   */
  execute<T>(operation: () => Promise<T>): Promise<T>;

  /**
   * 开始事务
   *
   * @description 开始数据库事务
   *
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await transactionManager.begin();
   * ```
   */
  begin(): Promise<void>;

  /**
   * 提交事务
   *
   * @description 提交数据库事务
   *
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await transactionManager.commit();
   * ```
   */
  commit(): Promise<void>;

  /**
   * 回滚事务
   *
   * @description 回滚数据库事务
   *
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await transactionManager.rollback();
   * ```
   */
  rollback(): Promise<void>;

  /**
   * 检查是否在事务中
   *
   * @description 检查当前是否在事务中
   *
   * @returns 是否在事务中
   *
   * @example
   * ```typescript
   * const inTransaction = transactionManager.isInTransaction();
   * ```
   */
  isInTransaction(): boolean;

  /**
   * 获取当前事务ID
   *
   * @description 获取当前事务的唯一标识符
   *
   * @returns 事务ID
   *
   * @example
   * ```typescript
   * const transactionId = transactionManager.getCurrentTransactionId();
   * ```
   */
  getCurrentTransactionId(): string | null;
}
