/**
 * 控制台日志实现
 *
 * @description 基于浏览器/Node.js 控制台的日志实现
 * 提供基本的日志输出功能，适合开发环境使用
 *
 * ## 业务规则
 *
 * ### 输出格式规则
 * - 自动添加时间戳
 * - 包含日志级别标识
 * - 支持结构化上下文输出
 * - 错误对象特殊处理
 *
 * ### 日志级别规则
 * - 支持动态设置日志级别
 * - 只输出大于等于当前级别的日志
 * - 默认级别为 INFO
 *
 * @since 1.0.0
 */

import type { IPureLogger, LogContext, LogLevel } from '../interfaces/pure-logger.interface.js';
import { LogLevel as LogLevelEnum } from '../interfaces/pure-logger.interface.js';

/**
 * 控制台日志实现类
 */
export class ConsoleLogger implements IPureLogger {
  private currentLevel: LogLevel;
  private defaultContext: LogContext;

  /**
   * 构造函数
   *
   * @param initialLevel - 初始日志级别，默认为 INFO
   * @param defaultContext - 默认上下文信息
   */
  constructor(initialLevel: LogLevel = LogLevelEnum.INFO, defaultContext: LogContext = {}) {
    this.currentLevel = initialLevel;
    this.defaultContext = { ...defaultContext };
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.DEBUG)) {
      this.log('DEBUG', message, context);
    }
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log('INFO', message, context);
    }
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.WARN)) {
      this.log('WARN', message, context);
    }
  }

  /**
   * 记录错误级别日志
   */
  error(message: string | Error, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.ERROR)) {
      if (message instanceof Error) {
        this.logError('ERROR', message, context);
      } else {
        this.log('ERROR', message, context);
      }
    }
  }

  /**
   * 创建子日志器
   */
  child(context: LogContext): IPureLogger {
    const childContext = { ...this.defaultContext, ...context };
    return new ConsoleLogger(this.currentLevel, childContext);
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 检查是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevelEnum.DEBUG]: 0,
      [LogLevelEnum.INFO]: 1,
      [LogLevelEnum.WARN]: 2,
      [LogLevelEnum.ERROR]: 3,
    };

    return levelPriority[level] >= levelPriority[this.currentLevel];
  }

  /**
   * 输出日志
   */
  private log(level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextData = { ...this.defaultContext, ...context };

    const logEntry = {
      timestamp,
      level,
      message,
      ...contextData,
    };

    // 根据级别选择不同的控制台方法
    switch (level) {
      case 'DEBUG':
        console.debug(logEntry);
        break;
      case 'INFO':
        console.info(logEntry);
        break;
      case 'WARN':
        console.warn(logEntry);
        break;
      case 'ERROR':
        console.error(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  }

  /**
   * 输出错误日志
   */
  private logError(level: string, error: Error, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextData = { ...this.defaultContext, ...context };

    const logEntry = {
      timestamp,
      level,
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...contextData,
    };

    console.error(logEntry);
  }
}
