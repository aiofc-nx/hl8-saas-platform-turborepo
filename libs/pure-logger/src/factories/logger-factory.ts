/**
 * 日志工厂
 *
 * @description 提供创建不同类型日志器的工厂方法
 * 支持根据环境或配置选择合适的日志实现
 *
 * ## 业务规则
 *
 * ### 工厂模式规则
 * - 统一创建日志器实例
 * - 支持不同实现类型的切换
 * - 提供默认配置
 *
 * ### 环境适配规则
 * - 开发环境使用控制台日志
 * - 生产环境可选择空操作日志
 * - 支持自定义配置
 *
 * @since 1.0.0
 */

import type { IPureLogger, LogLevel } from '../interfaces/pure-logger.interface.js';
import { LogLevel as LogLevelEnum } from '../interfaces/pure-logger.interface.js';
import { ConsoleLogger } from '../implementations/console-logger.js';
import { NoOpLogger } from '../implementations/noop-logger.js';
import { StructuredLogger, type StructuredLoggerConfig } from '../implementations/structured-logger.js';

/**
 * 日志类型枚举
 */
export enum LoggerType {
  /** 控制台日志 */
  CONSOLE = 'console',
  /** 空操作日志 */
  NOOP = 'noop',
  /** 结构化日志 */
  STRUCTURED = 'structured',
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  /** 日志类型 */
  type?: LoggerType;
  /** 日志级别 */
  level?: LogLevel;
  /** 默认上下文 */
  defaultContext?: Record<string, unknown>;
  /** 是否启用时间戳 */
  enableTimestamp?: boolean;
  /** 结构化日志配置 */
  structuredConfig?: StructuredLoggerConfig;
}

/**
 * 日志工厂类
 */
export class LoggerFactory {
  /**
   * 创建日志器实例
   *
   * @param config - 日志配置
   * @returns 日志器实例
   */
  static create(config: LoggerConfig = {}): IPureLogger {
    const {
      type = this.getDefaultLoggerType(),
      level = LogLevelEnum.INFO,
      defaultContext = {},
    } = config;

    switch (type) {
      case LoggerType.CONSOLE:
        return new ConsoleLogger(level, defaultContext);
      case LoggerType.NOOP:
        return new NoOpLogger(level, defaultContext);
      case LoggerType.STRUCTURED:
        return new StructuredLogger(level, defaultContext, config.structuredConfig || {});
      default:
        throw new Error(`Unsupported logger type: ${type}`);
    }
  }

  /**
   * 创建控制台日志器
   *
   * @param level - 日志级别，默认为 INFO
   * @param defaultContext - 默认上下文
   * @returns 控制台日志器实例
   */
  static createConsoleLogger(level: LogLevel = LogLevelEnum.INFO, defaultContext: Record<string, unknown> = {}): IPureLogger {
    return new ConsoleLogger(level, defaultContext);
  }

  /**
   * 创建空操作日志器
   *
   * @param level - 日志级别，默认为 ERROR
   * @param defaultContext - 默认上下文
   * @returns 空操作日志器实例
   */
  static createNoOpLogger(level: LogLevel = LogLevelEnum.ERROR, defaultContext: Record<string, unknown> = {}): IPureLogger {
    return new NoOpLogger(level, defaultContext);
  }

  /**
   * 创建结构化日志器
   *
   * @param level - 日志级别，默认为 INFO
   * @param defaultContext - 默认上下文
   * @param config - 结构化日志配置
   * @returns 结构化日志器实例
   */
  static createStructuredLogger(
    level: LogLevel = LogLevelEnum.INFO,
    defaultContext: Record<string, unknown> = {},
    config: StructuredLoggerConfig = {}
  ): IPureLogger {
    return new StructuredLogger(level, defaultContext, config);
  }

  /**
   * 获取默认日志类型
   *
   * @returns 默认日志类型
   */
  private static getDefaultLoggerType(): LoggerType {
    // 可以根据环境变量或其他条件决定默认类型
    const env = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';
    
    switch (env) {
      case 'production':
      case 'test':
        return LoggerType.NOOP;
      case 'development':
      default:
        return LoggerType.CONSOLE;
    }
  }
}
