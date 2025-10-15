/**
 * 纯净日志接口
 *
 * @description 领域层专用的日志接口，无任何框架依赖
 * 遵循 Clean Architecture 原则，保持领域层纯净
 *
 * ## 设计原则
 *
 * ### 纯净性原则
 * - 无任何外部框架依赖
 * - 只使用 TypeScript 原生类型
 * - 保持接口简洁明了
 *
 * ### 领域层适配原则
 * - 专为领域层业务逻辑设计
 * - 支持结构化日志记录
 * - 支持上下文信息传递
 *
 * @since 1.0.0
 */

/**
 * 日志级别枚举
 *
 * @description 定义支持的日志级别，从低到高排列
 */
export enum LogLevel {
  /** 调试信息 - 详细的调试信息，通常只在诊断问题时使用 */
  DEBUG = 'debug',
  /** 一般信息 - 一般性的信息记录 */
  INFO = 'info',
  /** 警告信息 - 警告信息，表明可能的问题 */
  WARN = 'warn',
  /** 错误信息 - 错误信息，表明发生了错误 */
  ERROR = 'error',
}

/**
 * 日志上下文接口
 *
 * @description 用于传递结构化日志上下文信息
 */
export interface LogContext {
  /** 上下文数据 */
  [key: string]: unknown;
}

/**
 * 日志记录接口
 *
 * @description 定义日志记录的基本行为
 */
export interface IPureLogger {
  /**
   * 记录调试级别日志
   *
   * @param message - 日志消息
   * @param context - 可选的上下文信息
   */
  debug(message: string, context?: LogContext): void;

  /**
   * 记录信息级别日志
   *
   * @param message - 日志消息
   * @param context - 可选的上下文信息
   */
  info(message: string, context?: LogContext): void;

  /**
   * 记录警告级别日志
   *
   * @param message - 日志消息
   * @param context - 可选的上下文信息
   */
  warn(message: string, context?: LogContext): void;

  /**
   * 记录错误级别日志
   *
   * @param message - 日志消息
   * @param context - 可选的上下文信息
   */
  error(message: string, context?: LogContext): void;

  /**
   * 记录错误对象
   *
   * @param error - 错误对象
   * @param context - 可选的上下文信息
   */
  error(error: Error, context?: LogContext): void;

  /**
   * 创建子日志器
   *
   * @param context - 子日志器的默认上下文
   * @returns 子日志器实例
   */
  child(context: LogContext): IPureLogger;

  /**
   * 设置日志级别
   *
   * @param level - 日志级别
   */
  setLevel(level: LogLevel): void;

  /**
   * 获取当前日志级别
   *
   * @returns 当前日志级别
   */
  getLevel(): LogLevel;
}
