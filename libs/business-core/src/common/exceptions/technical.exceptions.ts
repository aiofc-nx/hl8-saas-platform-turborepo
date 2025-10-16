/**
 * 通用技术异常类
 *
 * @description 技术相关的通用异常类
 * @since 1.0.0
 */

import { ApplicationException } from "./application.exception.js";

/**
 * 并发冲突异常
 *
 * @description 当发生并发冲突时抛出
 */
export class ConcurrencyConflictException extends ApplicationException {
  constructor(
    aggregateId: string,
    expectedVersion: number,
    actualVersion: number,
  ) {
    super(
      "CONCURRENCY_CONFLICT",
      "并发冲突",
      `聚合 ${aggregateId} 版本冲突`,
      409,
      {
        aggregateId,
        expectedVersion,
        actualVersion,
      },
    );
  }
}

/**
 * 验证异常
 *
 * @description 当数据验证失败时抛出
 */
export class ValidationException extends ApplicationException {
  constructor(field: string, value: any, rule: string) {
    super(
      "VALIDATION_FAILED",
      "验证失败",
      `验证失败: ${field} = ${value} 违反规则 ${rule}`,
      400,
      {
        field,
        value,
        rule,
      },
    );
  }
}

/**
 * 序列化异常
 *
 * @description 当数据序列化失败时抛出
 */
export class SerializationException extends ApplicationException {
  constructor(dataType: string, reason: string) {
    super(
      "SERIALIZATION_FAILED",
      "序列化失败",
      `序列化失败: ${dataType} - ${reason}`,
      500,
      {
        dataType,
        reason,
      },
    );
  }
}

/**
 * 反序列化异常
 *
 * @description 当数据反序列化失败时抛出
 */
export class DeserializationException extends ApplicationException {
  constructor(dataType: string, reason: string) {
    super(
      "DESERIALIZATION_FAILED",
      "反序列化失败",
      `反序列化失败: ${dataType} - ${reason}`,
      500,
      {
        dataType,
        reason,
      },
    );
  }
}

/**
 * 超时异常
 *
 * @description 当操作超时时抛出
 */
export class TimeoutException extends ApplicationException {
  constructor(operation: string, timeoutMs: number) {
    super(
      "OPERATION_TIMEOUT",
      "操作超时",
      `操作超时: ${operation} (${timeoutMs}ms)`,
      408,
      {
        operation,
        timeoutMs,
      },
    );
  }
}
