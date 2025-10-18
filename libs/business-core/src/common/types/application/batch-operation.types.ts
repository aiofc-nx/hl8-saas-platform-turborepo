/**
 * 批量操作选项
 */
export interface BatchOperationOptions {
  /** 批次大小 */
  batchSize?: number;
  /** 并发数 */
  concurrency?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 是否继续执行（遇到错误时） */
  continueOnError?: boolean;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult<T> {
  /** 成功的结果 */
  successful: T[];
  /** 失败的结果 */
  failed: Array<{
    item: Record<string, unknown>;
    error: string;
    retryCount: number;
  }>;
  /** 总数 */
  total: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
  /** 执行时间（毫秒） */
  executionTime: number;
}

/**
 * 批量操作进度
 */
export interface BatchOperationProgress {
  /** 当前进度 */
  current: number;
  /** 总数 */
  total: number;
  /** 进度百分比 */
  percentage: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
}
