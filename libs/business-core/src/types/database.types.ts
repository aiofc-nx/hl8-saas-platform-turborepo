/**
 * 数据库类型定义
 *
 * @description 定义数据库相关的类型和接口
 * @since 1.0.0
 */

/**
 * 数据库事务接口
 *
 * @description 定义数据库事务的通用接口
 */
export interface DatabaseTransaction {
  /** 提交事务 */
  commit(): Promise<void>;
  /** 回滚事务 */
  rollback(): Promise<void>;
  /** 释放连接 */
  release(): Promise<void>;
}

/**
 * 数据库查询结果接口
 *
 * @description 定义数据库查询结果的通用接口
 */
export interface DatabaseQueryResult<T = any> {
  /** 查询结果数据 */
  data: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页记录数 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrevious: boolean;
}

/**
 * 数据库连接配置接口
 *
 * @description 定义数据库连接的配置选项
 */
export interface DatabaseConnectionConfig {
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 连接池大小 */
  poolSize?: number;
  /** 连接超时时间（毫秒） */
  timeout?: number;
  /** 是否启用SSL */
  ssl?: boolean;
}
