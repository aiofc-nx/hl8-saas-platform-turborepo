/**
 * Saga 状态枚举
 */
export enum SagaStatus {
  /**
   * 未开始
   */
  NOT_STARTED = "NOT_STARTED",

  /**
   * 运行中
   */
  RUNNING = "RUNNING",

  /**
   * 已完成
   */
  COMPLETED = "COMPLETED",

  /**
   * 已失败
   */
  FAILED = "FAILED",

  /**
   * 已取消
   */
  CANCELLED = "CANCELLED",

  /**
   * 补偿中
   */
  COMPENSATING = "COMPENSATING",

  /**
   * 已补偿
   */
  COMPENSATED = "COMPENSATED",

  /**
   * 超时
   */
  TIMEOUT = "TIMEOUT",
}
