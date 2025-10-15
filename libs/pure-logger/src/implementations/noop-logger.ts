/**
 * 空操作日志实现
 *
 * @description 不执行任何操作的日志实现
 * 用于生产环境或需要禁用日志的场景
 *
 * ## 业务规则
 *
 * ### 性能优化规则
 * - 所有方法都是空操作，零开销
 * - 适合高性能要求的场景
 * - 保持接口一致性
 *
 * ### 配置灵活性规则
 * - 支持动态切换到其他日志实现
 * - 保持接口兼容性
 * - 支持子日志器创建
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
 * 空操作日志实现类
 */
export class NoOpLogger implements IPureLogger {
  private currentLevel: LogLevel;
  private defaultContext: LogContext;

  /**
   * 构造函数
   *
   * @param initialLevel - 初始日志级别，默认为 ERROR
   * @param defaultContext - 默认上下文信息
   */
  constructor(
    initialLevel: LogLevel = LogLevelEnum.ERROR,
    defaultContext: LogContext = {},
  ) {
    this.currentLevel = initialLevel;
    this.defaultContext = { ...defaultContext };
  }

  /**
   * 空操作的调试日志
   */
  debug(_message: string, _context?: LogContext): void {
    // 空操作
  }

  /**
   * 空操作的信息日志
   */
  info(_message: string, _context?: LogContext): void {
    // 空操作
  }

  /**
   * 空操作的警告日志
   */
  warn(_message: string, _context?: LogContext): void {
    // 空操作
  }

  /**
   * 空操作的错误日志
   */
  error(_message: string | Error, _context?: LogContext): void {
    // 空操作
  }

  /**
   * 创建子日志器
   */
  child(context: LogContext): IPureLogger {
    const childContext = { ...this.defaultContext, ...context };
    return new NoOpLogger(this.currentLevel, childContext);
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
}
