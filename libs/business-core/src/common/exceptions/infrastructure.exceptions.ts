/**
 * 通用基础设施异常类
 *
 * @description 基础设施相关的通用异常类
 * @since 1.0.0
 */

import { ApplicationException } from "./application.exception.js";

/**
 * 基础设施异常
 *
 * @description 当基础设施服务不可用时抛出
 */
export class InfrastructureException extends ApplicationException {
  constructor(service: string, reason: string) {
    super(
      "INFRASTRUCTURE_UNAVAILABLE",
      "基础设施服务不可用",
      `基础设施服务不可用: ${service} - ${reason}`,
      503,
      {
        service,
        reason,
      },
    );
  }
}

/**
 * 数据库异常
 *
 * @description 当数据库操作失败时抛出
 */
export class DatabaseException extends ApplicationException {
  constructor(operation: string, reason: string) {
    super(
      "DATABASE_ERROR",
      "数据库操作失败",
      `数据库操作失败: ${operation} - ${reason}`,
      500,
      {
        operation,
        reason,
      },
    );
  }
}

/**
 * 缓存异常
 *
 * @description 当缓存操作失败时抛出
 */
export class CacheException extends ApplicationException {
  constructor(operation: string, reason: string) {
    super(
      "CACHE_ERROR",
      "缓存操作失败",
      `缓存操作失败: ${operation} - ${reason}`,
      500,
      {
        operation,
        reason,
      },
    );
  }
}

/**
 * 消息队列异常
 *
 * @description 当消息队列操作失败时抛出
 */
export class MessageQueueException extends ApplicationException {
  constructor(operation: string, reason: string) {
    super(
      "MESSAGE_QUEUE_ERROR",
      "消息队列操作失败",
      `消息队列操作失败: ${operation} - ${reason}`,
      500,
      {
        operation,
        reason,
      },
    );
  }
}

/**
 * 外部服务异常
 *
 * @description 当外部服务调用失败时抛出
 */
export class ExternalServiceException extends ApplicationException {
  constructor(service: string, operation: string, reason: string) {
    super(
      "EXTERNAL_SERVICE_ERROR",
      "外部服务调用失败",
      `外部服务调用失败: ${service}.${operation} - ${reason}`,
      502,
      {
        service,
        operation,
        reason,
      },
    );
  }
}
