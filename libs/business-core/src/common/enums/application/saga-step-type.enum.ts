/**
 * Saga 步骤类型枚举
 */
export enum SagaStepType {
  /**
   * 命令步骤
   */
  COMMAND = "COMMAND",

  /**
   * 事件步骤
   */
  EVENT = "EVENT",

  /**
   * 补偿步骤
   */
  COMPENSATION = "COMPENSATION",

  /**
   * 超时步骤
   */
  TIMEOUT = "TIMEOUT",

  /**
   * 条件步骤
   */
  CONDITION = "CONDITION",

  /**
   * 并行步骤
   */
  PARALLEL = "PARALLEL",

  /**
   * 顺序步骤
   */
  SEQUENTIAL = "SEQUENTIAL",
}
