/**
 * 统一日志记录服务
 *
 * @description 提供结构化、可追踪的日志记录功能
 * 支持多级别日志、上下文信息、性能监控和审计追踪
 *
 * ## 日志记录原则
 *
 * ### 结构化日志
 * - 使用JSON格式记录日志
 * - 包含完整的上下文信息
 * - 支持日志查询和分析
 *
 * ### 分级记录
 * - 根据重要性和紧急程度分级
 * - 支持不同环境的日志级别配置
 * - 提供日志过滤和筛选功能
 *
 * ### 性能监控
 * - 记录操作执行时间
 * - 监控系统性能指标
 * - 支持性能分析和优化
 *
 * @class LoggingService
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { EntityId } from "@hl8/isolation-model";

/**
 * 日志级别枚举
 */
export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * 日志上下文信息
 */
export interface LogContext {
  /** 请求ID */
  requestId?: string;
  /** 租户ID */
  tenantId?: EntityId;
  /** 用户ID */
  userId?: string;
  /** 操作类型 */
  operation?: string;
  /** 模块名称 */
  module?: string;
  /** 组件名称 */
  component?: string;
  /** 执行时间（毫秒） */
  executionTime?: number;
  /** 内存使用量（字节） */
  memoryUsage?: number;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime: number;
  /** 执行时间（毫秒） */
  executionTime: number;
  /** 内存使用量（字节） */
  memoryUsage: number;
  /** CPU使用率 */
  cpuUsage?: number;
}

/**
 * 审计日志信息
 */
export interface AuditLogInfo {
  /** 操作者ID */
  actorId: string;
  /** 操作类型 */
  action: string;
  /** 目标资源 */
  resource: string;
  /** 操作结果 */
  result: "success" | "failure";
  /** 操作详情 */
  details?: Record<string, unknown>;
  /** IP地址 */
  ipAddress?: string;
  /** 用户代理 */
  userAgent?: string;
}

/**
 * 统一日志记录服务
 */
@Injectable()
export class LoggingService {
  constructor(private readonly logger: FastifyLoggerService) {}

  /**
   * 记录跟踪日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文
   */
  trace(message: string, context: LogContext = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文
   */
  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文
   */
  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文
   */
  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param error - 错误对象
   * @param context - 日志上下文
   */
  error(message: string, error?: Error, context: LogContext = {}): void {
    const errorContext = {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * 记录致命错误日志
   *
   * @param message - 日志消息
   * @param error - 错误对象
   * @param context - 日志上下文
   */
  fatal(message: string, error?: Error, context: LogContext = {}): void {
    const errorContext = {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
    this.log(LogLevel.FATAL, message, errorContext);
  }

  /**
   * 记录业务操作日志
   *
   * @param message - 日志消息
   * @param operation - 操作名称
   * @param context - 日志上下文
   */
  business(message: string, operation: string, context: LogContext = {}): void {
    this.info(message, {
      ...context,
      operation,
      module: "business",
    });
  }

  /**
   * 记录性能日志
   *
   * @param message - 日志消息
   * @param metrics - 性能指标
   * @param context - 日志上下文
   */
  performance(
    message: string,
    metrics: PerformanceMetrics,
    context: LogContext = {},
  ): void {
    this.info(message, {
      ...context,
      module: "performance",
      executionTime: metrics.executionTime,
      memoryUsage: metrics.memoryUsage,
      metadata: {
        ...context.metadata,
        startTime: metrics.startTime,
        endTime: metrics.endTime,
        cpuUsage: metrics.cpuUsage,
      },
    });
  }

  /**
   * 记录审计日志
   *
   * @param auditInfo - 审计信息
   * @param context - 日志上下文
   */
  audit(auditInfo: AuditLogInfo, context: LogContext = {}): void {
    this.info("审计日志", {
      ...context,
      module: "audit",
      operation: auditInfo.action,
      metadata: {
        ...context.metadata,
        actorId: auditInfo.actorId,
        resource: auditInfo.resource,
        result: auditInfo.result,
        details: auditInfo.details,
        ipAddress: auditInfo.ipAddress,
        userAgent: auditInfo.userAgent,
      },
    });
  }

  /**
   * 记录安全日志
   *
   * @param message - 日志消息
   * @param securityEvent - 安全事件类型
   * @param context - 日志上下文
   */
  security(
    message: string,
    securityEvent: string,
    context: LogContext = {},
  ): void {
    this.warn(message, {
      ...context,
      module: "security",
      operation: securityEvent,
    });
  }

  /**
   * 记录数据库操作日志
   *
   * @param message - 日志消息
   * @param operation - 数据库操作
   * @param context - 日志上下文
   */
  database(message: string, operation: string, context: LogContext = {}): void {
    this.debug(message, {
      ...context,
      module: "database",
      operation,
    });
  }

  /**
   * 记录API请求日志
   *
   * @param message - 日志消息
   * @param method - HTTP方法
   * @param url - 请求URL
   * @param context - 日志上下文
   */
  apiRequest(
    message: string,
    method: string,
    url: string,
    context: LogContext = {},
  ): void {
    this.info(message, {
      ...context,
      module: "api",
      operation: "request",
      metadata: {
        ...context.metadata,
        method,
        url,
      },
    });
  }

  /**
   * 记录API响应日志
   *
   * @param message - 日志消息
   * @param statusCode - HTTP状态码
   * @param context - 日志上下文
   */
  apiResponse(
    message: string,
    statusCode: number,
    context: LogContext = {},
  ): void {
    this.info(message, {
      ...context,
      module: "api",
      operation: "response",
      metadata: {
        ...context.metadata,
        statusCode,
      },
    });
  }

  /**
   * 创建性能监控器
   *
   * @param operation - 操作名称
   * @param context - 日志上下文
   * @returns 性能监控器
   */
  createPerformanceMonitor(
    operation: string,
    context: LogContext = {},
  ): PerformanceMonitor {
    return new PerformanceMonitor(this, operation, context);
  }

  /**
   * 记录结构化日志
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @param context - 日志上下文
   */
  private log(level: LogLevel, message: string, context: LogContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    switch (level) {
      case LogLevel.TRACE:
        this.logger.debug(logEntry.message, logEntry);
        break;
      case LogLevel.DEBUG:
        this.logger.debug(logEntry.message, logEntry);
        break;
      case LogLevel.INFO:
        this.logger.debug(logEntry.message, logEntry);
        break;
      case LogLevel.WARN:
        this.logger.warn(logEntry.message, logEntry);
        break;
      case LogLevel.ERROR:
        this.logger.error(logEntry.message, undefined, logEntry);
        break;
      case LogLevel.FATAL:
        this.logger.error(logEntry.message, undefined, logEntry);
        break;
    }
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private startTime: number;
  private startMemory: number;

  constructor(
    private readonly loggingService: LoggingService,
    private readonly operation: string,
    private readonly context: LogContext,
  ) {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage().heapUsed;
  }

  /**
   * 结束监控并记录性能日志
   *
   * @param message - 日志消息
   */
  end(message?: string): void {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const metrics: PerformanceMetrics = {
      startTime: this.startTime,
      endTime,
      executionTime: endTime - this.startTime,
      memoryUsage: endMemory - this.startMemory,
    };

    this.loggingService.performance(
      message || `操作完成: ${this.operation}`,
      metrics,
      this.context,
    );
  }

  /**
   * 记录中间检查点
   *
   * @param checkpoint - 检查点名称
   */
  checkpoint(checkpoint: string): void {
    const currentTime = Date.now();
    const currentMemory = process.memoryUsage().heapUsed;

    this.loggingService.debug(`检查点: ${checkpoint}`, {
      ...this.context,
      operation: `${this.operation}.${checkpoint}`,
      executionTime: currentTime - this.startTime,
      memoryUsage: currentMemory - this.startMemory,
    });
  }
}
