/**
 * 日志服务
 *
 * @description 基于 Pino 的结构化日志服务，自动包含隔离上下文
 *
 * @since 0.2.0
 */

import { Injectable, Optional } from '@nestjs/common';
import * as pino from 'pino';
import { IsolationContextService } from '../isolation/services/isolation-context.service.js';

/**
 * 日志级别
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志选项
 */
export interface LoggerOptions {
  level?: LogLevel;
  prettyPrint?: boolean;
}

/**
 * 日志服务
 *
 * @description 提供结构化日志记录功能
 */
@Injectable()
export class LoggerService {
  private logger: pino.Logger;

  constructor(
    @Optional() private readonly isolationService?: IsolationContextService,
    @Optional() options?: LoggerOptions,
  ) {
    this.logger = pino({
      level: options?.level || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...(options?.prettyPrint && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }),
    });
  }

  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  log(message: string, context?: any): void {
    this.logger.info(this.enrichContext(context), message);
  }

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param trace - 错误堆栈
   * @param context - 额外上下文
   */
  error(message: string, trace?: string, context?: any): void {
    this.logger.error(
      this.enrichContext({ ...context, trace }),
      message,
    );
  }

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  warn(message: string, context?: any): void {
    this.logger.warn(this.enrichContext(context), message);
  }

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  debug(message: string, context?: any): void {
    this.logger.debug(this.enrichContext(context), message);
  }

  /**
   * 丰富上下文（自动添加隔离信息）
   *
   * @param context - 原始上下文
   * @returns 丰富后的上下文
   * @private
   */
  private enrichContext(context?: any): any {
    if (!this.isolationService) {
      return context || {};
    }

    const isolationContext = this.isolationService.getIsolationContext();
    
    return {
      ...context,
      isolation: isolationContext?.toPlainObject(),
    };
  }
}

