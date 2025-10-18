/**
 * 应用层异常恢复策略枚举
 */
export enum ApplicationExceptionRecoveryStrategy {
  NONE = "none",
  RETRY = "retry",
  FALLBACK = "fallback",
  COMPENSATE = "compensate",
}
