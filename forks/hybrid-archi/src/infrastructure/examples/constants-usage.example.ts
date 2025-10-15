/**
 * 基础设施层常量使用示例
 *
 * @description 展示如何在基础设施层中使用统一的常量管理
 * 包括缓存、数据库、消息队列、事件存储等各个模块的常量使用
 *
 * @example
 * ```typescript
 * import { INFRASTRUCTURE_CONSTANTS } from '../constants';
 *
 * // 使用缓存常量
 * const cacheConfig = {
 *   ttl: INFRASTRUCTURE_CONSTANTS.CACHE.DEFAULT_TTL,
 *   keyPrefix: INFRASTRUCTURE_CONSTANTS.CACHE.KEY_PREFIX,
 * };
 * ```
 *
 * @since 1.0.0
 */

import {
  INFRASTRUCTURE_CONSTANTS,
  INFRASTRUCTURE_ERROR_MESSAGES,
  INFRASTRUCTURE_DEFAULT_CONFIG,
} from "../constants";

/**
 * 缓存适配器常量使用示例
 */
export class CacheAdapterExample {
  /**
   * 创建缓存配置
   */
  static createCacheConfig() {
    return {
      ttl: INFRASTRUCTURE_CONSTANTS.CACHE.DEFAULT_TTL,
      memoryCacheSize: INFRASTRUCTURE_CONSTANTS.CACHE.DEFAULT_MEMORY_CACHE_SIZE,
      redisCacheSize: INFRASTRUCTURE_CONSTANTS.CACHE.DEFAULT_REDIS_CACHE_SIZE,
      keyPrefix: INFRASTRUCTURE_CONSTANTS.CACHE.KEY_PREFIX,
      cleanupInterval: INFRASTRUCTURE_CONSTANTS.CACHE.CLEANUP_INTERVAL,
    };
  }

  /**
   * 创建缓存键
   */
  static createCacheKey(key: string): string {
    return `${INFRASTRUCTURE_CONSTANTS.CACHE.KEY_PREFIX}:${key}`;
  }

  /**
   * 检查缓存命中率
   */
  static isHitRateAcceptable(hitRate: number): boolean {
    return hitRate >= INFRASTRUCTURE_CONSTANTS.CACHE.HIT_RATE_THRESHOLD;
  }
}

/**
 * 数据库适配器常量使用示例
 */
export class DatabaseAdapterExample {
  /**
   * 创建数据库配置
   */
  static createDatabaseConfig() {
    return {
      queryTimeout: INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_QUERY_TIMEOUT,
      connectionTimeout:
        INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_CONNECTION_TIMEOUT,
      transactionTimeout:
        INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_TRANSACTION_TIMEOUT,
      poolSize: INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_POOL_SIZE,
      retryCount: INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_RETRY_COUNT,
      retryDelay: INFRASTRUCTURE_CONSTANTS.DATABASE.DEFAULT_RETRY_DELAY,
    };
  }

  /**
   * 检查是否为慢查询
   */
  static isSlowQuery(executionTime: number): boolean {
    return (
      executionTime > INFRASTRUCTURE_CONSTANTS.DATABASE.SLOW_QUERY_THRESHOLD
    );
  }

  /**
   * 创建查询缓存键
   */
  static createQueryCacheKey(query: string, params: unknown[]): string {
    const queryHash = Buffer.from(query + JSON.stringify(params)).toString(
      "base64",
    );
    return `query:${queryHash}`;
  }
}

/**
 * 消息队列适配器常量使用示例
 */
export class MessageQueueAdapterExample {
  /**
   * 创建消息队列配置
   */
  static createMessageQueueConfig() {
    return {
      messageTtl: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.DEFAULT_MESSAGE_TTL,
      retryCount: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.DEFAULT_RETRY_COUNT,
      retryDelay: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.DEFAULT_RETRY_DELAY,
      queueSize: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.DEFAULT_QUEUE_SIZE,
      batchSize: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.DEFAULT_BATCH_SIZE,
    };
  }

  /**
   * 创建消息优先级
   */
  static createMessagePriority(
    priority: "low" | "normal" | "high" | "critical",
  ): number {
    const priorityMap = {
      low: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.PRIORITY.LOW,
      normal: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.PRIORITY.NORMAL,
      high: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.PRIORITY.HIGH,
      critical: INFRASTRUCTURE_CONSTANTS.MESSAGE_QUEUE.PRIORITY.CRITICAL,
    };
    return priorityMap[priority];
  }
}

/**
 * 事件存储适配器常量使用示例
 */
export class EventStoreAdapterExample {
  /**
   * 创建事件存储配置
   */
  static createEventStoreConfig() {
    return {
      eventTtl: INFRASTRUCTURE_CONSTANTS.EVENT_STORE.DEFAULT_EVENT_TTL,
      snapshotInterval:
        INFRASTRUCTURE_CONSTANTS.EVENT_STORE.DEFAULT_SNAPSHOT_INTERVAL,
      batchSize: INFRASTRUCTURE_CONSTANTS.EVENT_STORE.DEFAULT_BATCH_SIZE,
    };
  }

  /**
   * 检查事件是否过期
   */
  static isEventExpired(timestamp: number): boolean {
    const now = Date.now();
    return (
      now - timestamp > INFRASTRUCTURE_CONSTANTS.EVENT_STORE.DEFAULT_EVENT_TTL
    );
  }
}

/**
 * 端口适配器常量使用示例
 */
export class PortAdapterExample {
  /**
   * 创建端口适配器配置
   */
  static createPortAdapterConfig() {
    return {
      healthCheckInterval:
        INFRASTRUCTURE_CONSTANTS.PORT_ADAPTERS.DEFAULT_HEALTH_CHECK_INTERVAL,
      retryCount: INFRASTRUCTURE_CONSTANTS.PORT_ADAPTERS.DEFAULT_RETRY_COUNT,
      timeout: INFRASTRUCTURE_CONSTANTS.PORT_ADAPTERS.DEFAULT_TIMEOUT,
    };
  }

  /**
   * 检查适配器类型
   */
  static isValidAdapterType(type: string): boolean {
    return Object.values(INFRASTRUCTURE_CONSTANTS.PORT_ADAPTERS.TYPE).includes(
      type as any,
    );
  }
}

/**
 * 映射器常量使用示例
 */
export class MapperExample {
  /**
   * 创建映射器配置
   */
  static createMapperConfig() {
    return {
      cacheSize: INFRASTRUCTURE_CONSTANTS.MAPPERS.DEFAULT_CACHE_SIZE,
      ttl: INFRASTRUCTURE_CONSTANTS.MAPPERS.DEFAULT_TTL,
    };
  }

  /**
   * 检查映射器类型
   */
  static isValidMapperType(type: string): boolean {
    return Object.values(INFRASTRUCTURE_CONSTANTS.MAPPERS.TYPE).includes(
      type as any,
    );
  }
}

/**
 * 工厂常量使用示例
 */
export class FactoryExample {
  /**
   * 创建工厂配置
   */
  static createFactoryConfig() {
    return {
      serviceStartTimeout:
        INFRASTRUCTURE_CONSTANTS.FACTORIES.DEFAULT_SERVICE_START_TIMEOUT,
      serviceStopTimeout:
        INFRASTRUCTURE_CONSTANTS.FACTORIES.DEFAULT_SERVICE_STOP_TIMEOUT,
      healthCheckTimeout:
        INFRASTRUCTURE_CONSTANTS.FACTORIES.DEFAULT_HEALTH_CHECK_TIMEOUT,
    };
  }

  /**
   * 检查工厂类型
   */
  static isValidFactoryType(type: string): boolean {
    return Object.values(INFRASTRUCTURE_CONSTANTS.FACTORIES.TYPE).includes(
      type as any,
    );
  }
}

/**
 * 错误处理常量使用示例
 */
export class ErrorHandlingExample {
  /**
   * 获取错误消息
   */
  static getErrorMessage(errorCode: string): string {
    const errorMessages = INFRASTRUCTURE_ERROR_MESSAGES;

    // 根据错误码获取对应的错误消息
    if (errorCode.startsWith("CACHE_")) {
      const cacheError = errorCode.replace("CACHE_", "");
      return (
        errorMessages.CACHE[cacheError as keyof typeof errorMessages.CACHE] ||
        "未知缓存错误"
      );
    }

    if (errorCode.startsWith("DATABASE_")) {
      const dbError = errorCode.replace("DATABASE_", "");
      return (
        errorMessages.DATABASE[
          dbError as keyof typeof errorMessages.DATABASE
        ] || "未知数据库错误"
      );
    }

    if (errorCode.startsWith("MESSAGE_QUEUE_")) {
      const mqError = errorCode.replace("MESSAGE_QUEUE_", "");
      return (
        errorMessages.MESSAGE_QUEUE[
          mqError as keyof typeof errorMessages.MESSAGE_QUEUE
        ] || "未知消息队列错误"
      );
    }

    if (errorCode.startsWith("EVENT_STORE_")) {
      const esError = errorCode.replace("EVENT_STORE_", "");
      return (
        errorMessages.EVENT_STORE[
          esError as keyof typeof errorMessages.EVENT_STORE
        ] || "未知事件存储错误"
      );
    }

    return "未知错误";
  }
}

/**
 * 日志常量使用示例
 */
export class LoggingExample {
  /**
   * 创建日志上下文
   */
  static createLogContext(module: string): string {
    const contextMap: Record<string, string> = {
      cache: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.CACHE,
      database: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.DATABASE,
      messageQueue: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.MESSAGE_QUEUE,
      eventStore: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.EVENT_STORE,
      portAdapter: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.PORT_ADAPTER,
      mapper: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.MAPPER,
      factory: INFRASTRUCTURE_CONSTANTS.LOGGING.CONTEXT.FACTORY,
    };

    return contextMap[module] || "unknown";
  }

  /**
   * 检查日志级别
   */
  static isValidLogLevel(level: string): boolean {
    return Object.values(INFRASTRUCTURE_CONSTANTS.LOGGING.LEVEL).includes(
      level as any,
    );
  }
}

/**
 * 性能监控常量使用示例
 */
export class PerformanceMonitoringExample {
  /**
   * 创建性能监控配置
   */
  static createPerformanceConfig() {
    return {
      metricsInterval:
        INFRASTRUCTURE_CONSTANTS.PERFORMANCE.DEFAULT_METRICS_INTERVAL,
      performanceThreshold:
        INFRASTRUCTURE_CONSTANTS.PERFORMANCE.DEFAULT_PERFORMANCE_THRESHOLD,
    };
  }

  /**
   * 检查性能指标类型
   */
  static isValidMetricsType(type: string): boolean {
    return Object.values(
      INFRASTRUCTURE_CONSTANTS.PERFORMANCE.METRICS_TYPE,
    ).includes(type as any);
  }
}

/**
 * 配置常量使用示例
 */
export class ConfigExample {
  /**
   * 创建配置前缀
   */
  static createConfigPrefix(module: string): string {
    return `${
      INFRASTRUCTURE_CONSTANTS.CONFIG.DEFAULT_PREFIX
    }_${module.toUpperCase()}`;
  }

  /**
   * 检查环境类型
   */
  static isValidEnvironment(env: string): boolean {
    return Object.values(INFRASTRUCTURE_CONSTANTS.CONFIG.ENVIRONMENT).includes(
      env as any,
    );
  }
}

/**
 * 综合使用示例
 */
export class InfrastructureConstantsUsageExample {
  /**
   * 创建完整的基础设施配置
   */
  static createFullInfrastructureConfig() {
    return {
      cache: INFRASTRUCTURE_DEFAULT_CONFIG.CACHE,
      database: INFRASTRUCTURE_DEFAULT_CONFIG.DATABASE,
      messageQueue: INFRASTRUCTURE_DEFAULT_CONFIG.MESSAGE_QUEUE,
      eventStore: INFRASTRUCTURE_DEFAULT_CONFIG.EVENT_STORE,
      portAdapters: INFRASTRUCTURE_DEFAULT_CONFIG.PORT_ADAPTERS,
      mappers: INFRASTRUCTURE_DEFAULT_CONFIG.MAPPERS,
      factories: INFRASTRUCTURE_DEFAULT_CONFIG.FACTORIES,
    };
  }

  /**
   * 验证配置完整性
   */
  static validateConfig(config: Record<string, unknown>): boolean {
    // 检查必需的配置项
    const requiredKeys = ["cache", "database", "messageQueue", "eventStore"];
    return requiredKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(config, key),
    );
  }

  /**
   * 获取模块特定配置
   */
  static getModuleConfig(module: string): Record<string, unknown> {
    const configMap: Record<string, Record<string, unknown>> = {
      cache: INFRASTRUCTURE_DEFAULT_CONFIG.CACHE,
      database: INFRASTRUCTURE_DEFAULT_CONFIG.DATABASE,
      messageQueue: INFRASTRUCTURE_DEFAULT_CONFIG.MESSAGE_QUEUE,
      eventStore: INFRASTRUCTURE_DEFAULT_CONFIG.EVENT_STORE,
      portAdapters: INFRASTRUCTURE_DEFAULT_CONFIG.PORT_ADAPTERS,
      mappers: INFRASTRUCTURE_DEFAULT_CONFIG.MAPPERS,
      factories: INFRASTRUCTURE_DEFAULT_CONFIG.FACTORIES,
    };

    return configMap[module] || {};
  }
}
