/**
 * 连接相关类型定义
 *
 * @description 数据库连接的类型定义
 *
 * @since 1.0.0
 */

/**
 * 连接状态枚举
 *
 * @description 表示数据库连接的当前状态
 */
export enum ConnectionStatus {
  /** 未连接 */
  DISCONNECTED = "disconnected",

  /** 连接中 */
  CONNECTING = "connecting",

  /** 已连接 */
  CONNECTED = "connected",

  /** 连接失败 */
  FAILED = "failed",

  /** 重连中 */
  RECONNECTING = "reconnecting",
}

/**
 * 连接配置接口
 *
 * @description 数据库连接的配置参数
 */
export interface ConnectionConfig {
  /** 数据库类型 */
  type: "postgresql" | "mongodb";

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

  /** SSL 配置（可选） */
  ssl?: {
    enabled: boolean;
    rejectUnauthorized?: boolean;
    ca?: string;
    key?: string;
    cert?: string;
  };
}

/**
 * 连接池配置接口
 *
 * @description 连接池的行为配置
 */
export interface PoolConfig {
  /** 最小连接数 */
  min: number;

  /** 最大连接数 */
  max: number;

  /** 空闲超时（毫秒） */
  idleTimeoutMillis: number;

  /** 获取连接超时（毫秒） */
  acquireTimeoutMillis: number;

  /** 创建连接超时（毫秒） */
  createTimeoutMillis: number;
}

/**
 * 连接信息接口
 *
 * @description 连接的详细信息，用于监控和诊断
 */
export interface ConnectionInfo {
  /** 连接状态 */
  status: ConnectionStatus;

  /** 数据库类型 */
  type: string;

  /** 主机地址 */
  host: string;

  /** 端口号 */
  port: number;

  /** 数据库名称 */
  database: string;

  /** 连接建立时间 */
  connectedAt?: Date;

  /** 最后活动时间 */
  lastActivityAt?: Date;

  /** 连接池统计 */
  poolStats: PoolStats;
}

/**
 * 连接池统计接口
 *
 * @description 连接池的实时统计信息
 */
export interface PoolStats {
  /** 总连接数 */
  total: number;

  /** 活动连接数 */
  active: number;

  /** 空闲连接数 */
  idle: number;

  /** 等待中的请求数 */
  waiting: number;

  /** 最大连接数限制 */
  max: number;

  /** 最小连接数限制 */
  min: number;
}
