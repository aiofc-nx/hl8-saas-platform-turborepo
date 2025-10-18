/**
 * CQRS相关常量定义
 *
 * @description 定义CQRS模式相关的常量
 * @since 1.0.0
 */

/**
 * CQRS总线常量
 */
export const CQRS_BUS_CONSTANTS = {
  /** 默认初始化超时（毫秒） */
  INITIALIZATION_TIMEOUT: 30000,
  /** 默认关闭超时（毫秒） */
  SHUTDOWN_TIMEOUT: 10000,
  /** 默认事件处理超时（毫秒） */
  EVENT_HANDLING_TIMEOUT: 5000,
  /** 默认命令处理超时（毫秒） */
  COMMAND_HANDLING_TIMEOUT: 10000,
  /** 默认查询处理超时（毫秒） */
  QUERY_HANDLING_TIMEOUT: 5000,
} as const;

/**
 * 命令总线常量
 */
export const COMMAND_BUS_CONSTANTS = {
  /** 默认命令队列大小 */
  DEFAULT_QUEUE_SIZE: 1000,
  /** 默认并发处理数 */
  DEFAULT_CONCURRENCY: 10,
  /** 默认重试次数 */
  DEFAULT_RETRY_ATTEMPTS: 3,
  /** 默认重试延迟（毫秒） */
  DEFAULT_RETRY_DELAY: 1000,
} as const;

/**
 * 查询总线常量
 */
export const QUERY_BUS_CONSTANTS = {
  /** 默认查询缓存TTL（秒） */
  DEFAULT_CACHE_TTL: 300,
  /** 默认查询超时（毫秒） */
  DEFAULT_QUERY_TIMEOUT: 5000,
  /** 默认最大结果数 */
  DEFAULT_MAX_RESULTS: 1000,
} as const;

/**
 * 事件总线常量
 */
export const EVENT_BUS_CONSTANTS = {
  /** 默认事件队列大小 */
  DEFAULT_QUEUE_SIZE: 5000,
  /** 默认并发处理数 */
  DEFAULT_CONCURRENCY: 20,
  /** 默认事件TTL（秒） */
  DEFAULT_EVENT_TTL: 3600,
  /** 默认批量处理大小 */
  DEFAULT_BATCH_SIZE: 100,
} as const;

/**
 * 事件存储常量
 */
export const EVENT_STORE_CONSTANTS = {
  /** 默认事件版本 */
  DEFAULT_VERSION: 0,
  /** 默认快照间隔 */
  DEFAULT_SNAPSHOT_INTERVAL: 100,
  /** 默认事件TTL（天） */
  DEFAULT_EVENT_TTL_DAYS: 365,
  /** 默认快照TTL（天） */
  DEFAULT_SNAPSHOT_TTL_DAYS: 30,
} as const;

/**
 * Saga常量
 */
export const SAGA_CONSTANTS = {
  /** 默认Saga超时（毫秒） */
  DEFAULT_SAGA_TIMEOUT: 300000,
  /** 默认补偿超时（毫秒） */
  DEFAULT_COMPENSATION_TIMEOUT: 60000,
  /** 默认重试次数 */
  DEFAULT_RETRY_ATTEMPTS: 3,
  /** 默认重试延迟（毫秒） */
  DEFAULT_RETRY_DELAY: 5000,
} as const;

/**
 * 事件投影常量
 */
export const PROJECTION_CONSTANTS = {
  /** 默认投影批处理大小 */
  DEFAULT_BATCH_SIZE: 1000,
  /** 默认投影超时（毫秒） */
  DEFAULT_PROJECTION_TIMEOUT: 30000,
  /** 默认投影重试次数 */
  DEFAULT_RETRY_ATTEMPTS: 5,
  /** 默认投影重试延迟（毫秒） */
  DEFAULT_RETRY_DELAY: 2000,
} as const;

/**
 * CQRS事件类型常量
 */
export const CQRS_EVENT_TYPES = {
  /** 命令处理开始 */
  COMMAND_HANDLING_STARTED: "command-handling-started",
  /** 命令处理完成 */
  COMMAND_HANDLING_COMPLETED: "command-handling-completed",
  /** 命令处理失败 */
  COMMAND_HANDLING_FAILED: "command-handling-failed",
  /** 查询处理开始 */
  QUERY_HANDLING_STARTED: "query-handling-started",
  /** 查询处理完成 */
  QUERY_HANDLING_COMPLETED: "query-handling-completed",
  /** 查询处理失败 */
  QUERY_HANDLING_FAILED: "query-handling-failed",
  /** 事件处理开始 */
  EVENT_HANDLING_STARTED: "event-handling-started",
  /** 事件处理完成 */
  EVENT_HANDLING_COMPLETED: "event-handling-completed",
  /** 事件处理失败 */
  EVENT_HANDLING_FAILED: "event-handling-failed",
  /** Saga开始 */
  SAGA_STARTED: "saga-started",
  /** Saga完成 */
  SAGA_COMPLETED: "saga-completed",
  /** Saga失败 */
  SAGA_FAILED: "saga-failed",
  /** Saga补偿 */
  SAGA_COMPENSATED: "saga-compensated",
} as const;

/**
 * CQRS错误代码常量
 */
export const CQRS_ERROR_CODES = {
  /** 命令处理失败 */
  COMMAND_HANDLING_FAILED: "COMMAND_HANDLING_FAILED",
  /** 查询处理失败 */
  QUERY_HANDLING_FAILED: "QUERY_HANDLING_FAILED",
  /** 事件处理失败 */
  EVENT_HANDLING_FAILED: "EVENT_HANDLING_FAILED",
  /** 处理器未找到 */
  HANDLER_NOT_FOUND: "HANDLER_NOT_FOUND",
  /** 处理器不支持 */
  HANDLER_NOT_SUPPORTED: "HANDLER_NOT_SUPPORTED",
  /** 总线未初始化 */
  BUS_NOT_INITIALIZED: "BUS_NOT_INITIALIZED",
  /** 总线已初始化 */
  BUS_ALREADY_INITIALIZED: "BUS_ALREADY_INITIALIZED",
  /** 事件存储失败 */
  EVENT_STORE_FAILED: "EVENT_STORE_FAILED",
  /** 并发冲突 */
  CONCURRENCY_CONFLICT: "CONCURRENCY_CONFLICT",
  /** Saga超时 */
  SAGA_TIMEOUT: "SAGA_TIMEOUT",
  /** Saga补偿失败 */
  SAGA_COMPENSATION_FAILED: "SAGA_COMPENSATION_FAILED",
} as const;
