/**
 * 数据库相关类型定义
 *
 * @description 定义数据库操作相关的类型，避免使用any类型
 * 提供类型安全的数据库操作接口
 *
 * @since 1.0.0
 */

/**
 * 数据库事务接口
 */
export interface DatabaseTransaction {
  /** 提交事务 */
  commit(): Promise<void>;
  /** 回滚事务 */
  rollback(): Promise<void>;
  /** 检查事务是否活跃 */
  isActive(): boolean;
}

/**
 * 数据库查询选项
 */
export interface DatabaseQueryOptions {
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
  /** 排序规则 */
  orderBy?: Record<string, "asc" | "desc">;
  /** 查询条件 */
  where?: Record<string, unknown>;
}

/**
 * 数据库更新选项
 */
export interface DatabaseUpdateOptions {
  /** 更新数据 */
  data: Record<string, unknown>;
  /** 更新条件 */
  where: Record<string, unknown>;
  /** 事务 */
  transaction?: DatabaseTransaction;
}

/**
 * 数据库删除选项
 */
export interface DatabaseDeleteOptions {
  /** 删除条件 */
  where: Record<string, unknown>;
  /** 事务 */
  transaction?: DatabaseTransaction;
}

/**
 * 数据库批量操作选项
 */
export interface DatabaseBatchOptions {
  /** 操作数据列表 */
  data: Record<string, unknown>[];
  /** 事务 */
  transaction?: DatabaseTransaction;
  /** 批量大小 */
  batchSize?: number;
}
