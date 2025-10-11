/**
 * Fastify 日志服务
 *
 * @description 直接使用 Fastify 内置的 Pino 日志实例，零配置高性能
 *
 * ## 业务规则
 *
 * ### 日志记录规则
 * - 直接使用 Fastify 的 Pino 实例（零开销）
 * - 自动包含请求上下文
 * - 支持结构化日志
 * - 开发环境美化输出
 *
 * @since 0.1.0
 */

import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class FastifyLoggerService implements NestLoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {}

  log(message: any, ...optionalParams: any[]): void {
    this.pinoLogger.info(optionalParams[0] || {}, message);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.pinoLogger.error(optionalParams[0] || {}, message);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.pinoLogger.warn(optionalParams[0] || {}, message);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.pinoLogger.debug(optionalParams[0] || {}, message);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.pinoLogger.trace(optionalParams[0] || {}, message);
  }

  /**
   * 获取底层 Pino 实例
   */
  getPinoLogger(): PinoLogger {
    return this.pinoLogger;
  }
}

