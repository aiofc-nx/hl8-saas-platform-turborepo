/**
 * 日志服务
 *
 * @description 基于 Pino 的结构化日志服务，自动包含隔离上下文
 *
 * ## 设计原则
 *
 * ### Fastify 集成
 * - **优先复用 Fastify 的 Pino 实例**
 * - Fastify 默认集成 Pino，避免创建多个实例
 * - 统一配置，统一输出
 *
 * ### 独立使用
 * - 非 HTTP 场景可独立创建 Pino 实例
 * - 支持自定义配置
 *
 * @since 0.2.0
 */

import { Injectable, Optional } from '@nestjs/common';
import pino from 'pino';
import type { IsolationContextService } from '../isolation/services/isolation-context.service.js';

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

  /**
   * 创建日志服务
   *
   * @param isolationService - 隔离上下文服务（可选）
   * @param optionsOrLogger - 日志选项或外部 Pino 实例
   *
   * @description
   * - 如果传入 Pino 实例，直接使用（Fastify 集成场景）
   * - 如果传入选项，创建新的 Pino 实例（独立使用场景）
   */
  constructor(
    @Optional() private readonly isolationService?: IsolationContextService,
    @Optional() optionsOrLogger?: LoggerOptions | pino.Logger,
  ) {
    // 检查是否传入了 Pino 实例
    if (optionsOrLogger && typeof (optionsOrLogger as any).info === 'function') {
      // 复用外部 Pino 实例（Fastify 场景）
      this.logger = optionsOrLogger as pino.Logger;
    } else {
      // 创建新的 Pino 实例（独立使用场景）
      const options = (optionsOrLogger as LoggerOptions) || {};
      this.logger = pino({
        level: options.level || 'info',
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        ...(options.prettyPrint && {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }),
      });
    }
  }

  /**
   * 获取底层 Pino 实例
   *
   * @returns Pino Logger 实例
   *
   * @description 用于需要直接访问 Pino API 的场景
   */
  getPinoLogger(): pino.Logger {
    return this.logger;
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

