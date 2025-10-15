/**
 * 结构化日志实现
 *
 * @description 基于结构化数据的日志实现
 * 支持复杂的日志格式和序列化
 *
 * ## 业务规则
 *
 * ### 结构化输出规则
 * - 支持 JSON 格式输出
 * - 自动序列化复杂对象
 * - 支持日志级别过滤
 * - 包含时间戳和上下文信息
 *
 * ### 性能优化规则
 * - 延迟序列化，只在需要时执行
 * - 支持日志采样，减少输出量
 * - 内存使用优化
 *
 * @since 1.0.0
 */

import type {
  IPureLogger,
  LogContext,
  LogLevel,
} from "../interfaces/pure-logger.interface.js";
import { LogLevel as LogLevelEnum } from "../interfaces/pure-logger.interface.js";

/**
 * 结构化日志配置接口
 */
export interface StructuredLoggerConfig {
  /** 是否启用 JSON 格式输出 */
  json?: boolean;
  /** 是否包含颜色输出 */
  colors?: boolean;
  /** 日志采样率 (0-1) */
  sampling?: number;
  /** 最大字段长度 */
  maxFieldLength?: number;
}

/**
 * 结构化日志实现类
 */
export class StructuredLogger implements IPureLogger {
  private currentLevel: LogLevel;
  private defaultContext: LogContext;
  private config: Required<StructuredLoggerConfig>;

  /**
   * 构造函数
   *
   * @param initialLevel - 初始日志级别
   * @param defaultContext - 默认上下文信息
   * @param config - 结构化日志配置
   */
  constructor(
    initialLevel: LogLevel = LogLevelEnum.INFO,
    defaultContext: LogContext = {},
    config: StructuredLoggerConfig = {},
  ) {
    this.currentLevel = initialLevel;
    this.defaultContext = { ...defaultContext };
    this.config = {
      json: config.json ?? true,
      colors: config.colors ?? false,
      sampling: config.sampling ?? 1.0,
      maxFieldLength: config.maxFieldLength ?? 1000,
    };
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.DEBUG)) {
      this.log("debug", message, context);
    }
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log("info", message, context);
    }
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.WARN)) {
      this.log("warn", message, context);
    }
  }

  /**
   * 记录错误级别日志
   */
  error(message: string | Error, context?: LogContext): void {
    if (this.shouldLog(LogLevelEnum.ERROR)) {
      if (message instanceof Error) {
        this.logError("error", message, context);
      } else {
        this.log("error", message, context);
      }
    }
  }

  /**
   * 创建子日志器
   */
  child(context: LogContext): IPureLogger {
    const childContext = { ...this.defaultContext, ...context };
    return new StructuredLogger(this.currentLevel, childContext, this.config);
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

    // 检查日志级别
    if (levelPriority[level] < levelPriority[this.currentLevel]) {
      return false;
    }

    // 检查采样率
    if (this.config.sampling < 1.0) {
      return Math.random() < this.config.sampling;
    }

    return true;
  }

  /**
   * 输出结构化日志
   */
  private log(level: string, message: string, context?: LogContext): void {
    const logEntry = this.createLogEntry(level, message, context);

    if (this.config.json) {
      console.log(JSON.stringify(logEntry));
    } else {
      this.logFormatted(logEntry);
    }
  }

  /**
   * 输出错误日志
   */
  private logError(level: string, error: Error, context?: LogContext): void {
    const logEntry = this.createLogEntry(level, error.message, context);
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (this.config.json) {
      console.error(JSON.stringify(logEntry));
    } else {
      this.logFormatted(logEntry);
    }
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(
    level: string,
    message: string,
    context?: LogContext,
  ): Record<string, unknown> {
    const timestamp = new Date().toISOString();
    const contextData = this.mergeContext(context);

    return {
      timestamp,
      level,
      message,
      ...contextData,
    };
  }

  /**
   * 合并上下文信息
   */
  private mergeContext(context?: LogContext): LogContext {
    const merged = { ...this.defaultContext, ...context };
    return this.truncateFields(merged);
  }

  /**
   * 截断过长字段
   */
  private truncateFields(context: LogContext): LogContext {
    const result: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (
        typeof value === "string" &&
        value.length > this.config.maxFieldLength
      ) {
        result[key] = value.substring(0, this.config.maxFieldLength) + "...";
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 格式化输出日志
   */
  private logFormatted(logEntry: Record<string, unknown>): void {
    const { timestamp, level, message, ...context } = logEntry;

    let output = `[${timestamp}] ${String(level).toUpperCase()}: ${message}`;

    if (Object.keys(context).length > 0) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}=${this.formatValue(value)}`)
        .join(" ");
      output += ` | ${contextStr}`;
    }

    // 根据级别选择输出方法
    switch (level) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.info(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * 格式化值用于显示
   */
  private formatValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
}
