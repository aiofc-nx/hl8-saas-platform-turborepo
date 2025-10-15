/**
 * @hl8/pure-logger 纯净日志库
 *
 * @description 专为领域层设计的纯净日志解决方案
 * 无任何框架依赖，遵循 Clean Architecture 原则
 *
 * ## 特性
 *
 * - 🎯 **纯净无依赖**: 无任何外部框架依赖
 * - 🏗️ **架构友好**: 专为领域层设计
 * - 🚀 **高性能**: 支持空操作日志器
 * - 🔧 **灵活配置**: 支持多种日志实现
 * - 📝 **结构化**: 支持结构化日志记录
 * - 🌍 **环境适配**: 自动适配不同环境
 *
 * ## 使用示例
 *
 * ```typescript
 * import { LoggerFactory, LogLevel } from '@hl8/pure-logger';
 *
 * // 创建日志器
 * const logger = LoggerFactory.create({
 *   level: LogLevel.INFO,
 *   defaultContext: { module: 'user-domain' }
 * });
 *
 * // 记录日志
 * logger.info('用户创建成功', { userId: '123', email: 'user@example.com' });
 *
 * // 创建子日志器
 * const childLogger = logger.child({ operation: 'validate' });
 * childLogger.debug('开始验证用户输入');
 * ```
 *
 * @since 1.0.0
 */

// 接口和类型导出
export type {
  IPureLogger,
  LogContext,
} from './interfaces/pure-logger.interface.js';

export {
  LogLevel,
} from './interfaces/pure-logger.interface.js';

// 实现类导出
export {
  ConsoleLogger,
} from './implementations/console-logger.js';

export {
  NoOpLogger,
} from './implementations/noop-logger.js';

export {
  StructuredLogger,
} from './implementations/structured-logger.js';

export type {
  StructuredLoggerConfig,
} from './implementations/structured-logger.js';

// 工厂类导出
export {
  LoggerFactory,
  LoggerType,
} from './factories/logger-factory.js';

export type {
  LoggerConfig,
} from './factories/logger-factory.js';

// 适配器导出
export {
  BaseLoggerAdapter,
  LoggerAdapterManager,
  loggerAdapterManager,
} from './adapters/logger-adapter.js';

export type {
  ILoggerAdapter,
} from './adapters/logger-adapter.js';

// 便捷方法导出
import { LoggerFactory, LoggerType } from './factories/logger-factory.js';
import { LogLevel } from './interfaces/pure-logger.interface.js';

/**
 * 创建默认日志器
 *
 * @param context - 默认上下文
 * @returns 日志器实例
 */
export function createLogger(context: Record<string, unknown> = {}): ReturnType<typeof LoggerFactory.create> {
  return LoggerFactory.create({
    defaultContext: context,
  });
}

/**
 * 创建领域日志器
 *
 * @param domain - 领域名称
 * @param level - 日志级别
 * @returns 日志器实例
 */
export function createDomainLogger(
  domain: string,
  level: LogLevel = LogLevel.INFO
): ReturnType<typeof LoggerFactory.create> {
  return LoggerFactory.create({
    type: LoggerType.CONSOLE,
    level,
    defaultContext: {
      domain,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * 创建生产环境日志器
 *
 * @param context - 默认上下文
 * @returns 日志器实例
 */
export function createProductionLogger(context: Record<string, unknown> = {}): ReturnType<typeof LoggerFactory.create> {
  return LoggerFactory.create({
    type: LoggerType.NOOP,
    level: LogLevel.ERROR,
    defaultContext: context,
  });
}
