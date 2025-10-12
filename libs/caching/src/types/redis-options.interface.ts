/**
 * Redis 配置接口
 * 
 * @description 定义 Redis 连接配置选项
 * 
 * @since 1.0.0
 */

/**
 * Redis 配置选项
 */
export interface RedisOptions {
  /**
   * Redis 主机地址
   * 
   * @default 'localhost'
   */
  host: string;
  
  /**
   * Redis 端口
   * 
   * @default 6379
   */
  port: number;
  
  /**
   * Redis 密码
   * 
   * @optional
   */
  password?: string;
  
  /**
   * Redis 数据库编号
   * 
   * @default 0
   */
  db?: number;
  
  /**
   * 连接超时时间（毫秒）
   * 
   * @default 10000
   */
  connectTimeout?: number;
  
  /**
   * 最大重试次数
   * 
   * @default 10
   */
  maxRetriesPerRequest?: number;
  
  /**
   * 是否启用离线队列
   * 
   * @default true
   */
  enableOfflineQueue?: boolean;
  
  /**
   * 重试策略
   */
  retryStrategy?: (times: number) => number | void | null;
}

