/**
 * Saga 步骤状态枚举
 */
export enum SagaStepStatus {
  /**
   * 待执行
   */
  PENDING = "PENDING",

  /**
   * 执行中
   */
  EXECUTING = "EXECUTING",

  /**
   * 已完成
   */
  COMPLETED = "COMPLETED",

  /**
   * 已失败
   */
  FAILED = "FAILED",

  /**
   * 已跳过
   */
  SKIPPED = "SKIPPED",

  /**
   * 补偿中
   */
  COMPENSATING = "COMPENSATING",

  /**
   * 已补偿
   */
  COMPENSATED = "COMPENSATED",
}
