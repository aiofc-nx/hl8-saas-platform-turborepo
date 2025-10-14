/**
 * Fastify 日志服务
 *
 * @description 直接使用 Fastify 内置的 Pino 日志实例，零配置高性能
 * 自动包含隔离上下文（租户、组织、部门、用户）
 *
 * ## 业务规则
 *
 * ### 日志记录规则
 * - 直接使用 Fastify 的 Pino 实例（零开销）
 * - 自动包含请求上下文
 * - 自动包含隔离上下文（多租户信息）
 * - 支持结构化日志
 * - 开发环境美化输出
 *
 * ### 隔离上下文规则
 * - 如果注入了 IsolationContextService，自动添加隔离信息
 * - 日志中包含 tenantId、organizationId、departmentId、userId
 * - 便于日志分析和审计追踪
 *
 * @since 0.1.0
 */

import type { ILoggerService } from '@hl8/exceptions/index.js';
import { IsolationContextService } from '@hl8/nestjs-isolation/index.js';
import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
  Scope,
} from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

/**
 * 日志上下文类型
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * 错误对象类型
 */
export interface ErrorObject {
  type: string;
  message: string;
  stack?: string;
}

/**
 * 增强的日志上下文（包含错误对象）
 */
export interface EnrichedLogContext extends LogContext {
  err?: ErrorObject;
}

/**
 * Fastify 日志服务
 *
 * @description 全局统一的日志服务，基于 Fastify 内置 Pino
 * - 复用 Fastify Pino 实例（零开销）
 * - 自动包含隔离上下文（租户/组织/部门/用户）
 * - 实现 NestJS 和内部日志接口
 * - 作为全局服务提供给所有模块
 */
@Injectable({ scope: Scope.TRANSIENT })
export class FastifyLoggerService implements NestLoggerService, ILoggerService {
  constructor(
    private readonly pinoLogger: PinoLogger,
    @Optional() private readonly isolationService?: IsolationContextService,
  ) {}

  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  log(message: string, context?: LogContext): void;
  log(message: Error, context?: LogContext): void;
  log(message: string | Error, context?: LogContext): void {
    const enrichedContext = this.enrichContext(context);

    // 处理 Error 对象的序列化问题
    if (message instanceof Error) {
      this.pinoLogger.info(
        {
          ...enrichedContext,
          err: {
            type: message.constructor.name,
            message: message.message,
            stack: message.stack,
          },
        },
        message.message,
      );
    } else {
      this.pinoLogger.info(enrichedContext, message);
    }
  }

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param stack - 错误堆栈（可选）
   * @param context - 日志上下文（可选）
   */
  error(message: string, stack?: string, context?: LogContext): void;
  error(message: Error, context?: LogContext): void;
  error(
    message: string | Error,
    stackOrContext?: string | LogContext,
    context?: LogContext,
  ): void {
    if (message instanceof Error) {
      // Error 对象的情况
      const enrichedContext = this.enrichContext(stackOrContext as LogContext);
      this.pinoLogger.error(
        {
          ...enrichedContext,
          err: {
            type: message.constructor.name,
            message: message.message,
            stack: message.stack,
          },
        },
        message.message,
      );
    } else {
      // 字符串消息的情况
      const enrichedContext = this.enrichContext(context);
      if (typeof stackOrContext === 'string') {
        // 有 stack 参数
        this.pinoLogger.error(
          {
            ...enrichedContext,
            err: {
              type: 'Error',
              message: message,
              stack: stackOrContext,
            },
          },
          message,
        );
      } else {
        // 没有 stack 参数，stackOrContext 是 context
        this.pinoLogger.error(enrichedContext, message);
      }
    }
  }

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  warn(message: string, context?: LogContext): void;
  warn(message: Error, context?: LogContext): void;
  warn(message: string | Error, context?: LogContext): void {
    const enrichedContext = this.enrichContext(context);

    // 处理 Error 对象的序列化问题
    if (message instanceof Error) {
      this.pinoLogger.warn(
        {
          ...enrichedContext,
          err: {
            type: message.constructor.name,
            message: message.message,
            stack: message.stack,
          },
        },
        message.message,
      );
    } else {
      this.pinoLogger.warn(enrichedContext, message);
    }
  }

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  debug(message: string, context?: LogContext): void;
  debug(message: Error, context?: LogContext): void;
  debug(message: string | Error, context?: LogContext): void {
    const enrichedContext = this.enrichContext(context);

    // 处理 Error 对象的序列化问题
    if (message instanceof Error) {
      this.pinoLogger.debug(
        {
          ...enrichedContext,
          err: {
            type: message.constructor.name,
            message: message.message,
            stack: message.stack,
          },
        },
        message.message,
      );
    } else {
      this.pinoLogger.debug(enrichedContext, message);
    }
  }

  /**
   * 记录详细日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  verbose(message: string, context?: LogContext): void;
  verbose(message: Error, context?: LogContext): void;
  verbose(message: string | Error, context?: LogContext): void {
    const enrichedContext = this.enrichContext(context);

    // 处理 Error 对象的序列化问题
    if (message instanceof Error) {
      this.pinoLogger.trace(
        {
          ...enrichedContext,
          err: {
            type: message.constructor.name,
            message: message.message,
            stack: message.stack,
          },
        },
        message.message,
      );
    } else {
      this.pinoLogger.trace(enrichedContext, message);
    }
  }

  /**
   * 获取底层 Pino 实例
   */
  getPinoLogger(): PinoLogger {
    return this.pinoLogger;
  }

  /**
   * 丰富日志上下文
   *
   * @description 自动添加隔离上下文（租户、组织、部门、用户）
   * @param context - 原始上下文
   * @returns 丰富后的上下文
   * @private
   */
  private enrichContext(context?: LogContext): EnrichedLogContext {
    // 如果没有注入 IsolationContextService，直接返回原上下文
    if (!this.isolationService) {
      return context || {};
    }

    // 获取当前隔离上下文
    const isolationContext = this.isolationService.getIsolationContext();

    // 合并隔离信息到日志上下文
    return {
      ...context,
      isolation: isolationContext
        ? {
            level: isolationContext.getIsolationLevel(),
            tenantId: isolationContext.tenantId?.getValue(),
            organizationId: isolationContext.organizationId?.getValue(),
            departmentId: isolationContext.departmentId?.getValue(),
            userId: isolationContext.userId?.getValue(),
          }
        : undefined,
    };
  }
}
