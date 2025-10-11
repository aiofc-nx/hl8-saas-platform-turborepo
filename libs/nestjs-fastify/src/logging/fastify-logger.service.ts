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

import { Injectable, LoggerService as NestLoggerService, Scope, Optional } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';
import { IsolationContextService, ILoggerService } from '@hl8/nestjs-infra';

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

  log(message: any, ...optionalParams: any[]): void {
    const context = this.enrichContext(optionalParams[0]);
    this.pinoLogger.info(context, message);
  }

  error(message: any, ...optionalParams: any[]): void {
    const context = this.enrichContext(optionalParams[0]);
    this.pinoLogger.error(context, message);
  }

  warn(message: any, ...optionalParams: any[]): void {
    const context = this.enrichContext(optionalParams[0]);
    this.pinoLogger.warn(context, message);
  }

  debug(message: any, ...optionalParams: any[]): void {
    const context = this.enrichContext(optionalParams[0]);
    this.pinoLogger.debug(context, message);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    const context = this.enrichContext(optionalParams[0]);
    this.pinoLogger.trace(context, message);
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
  private enrichContext(context?: any): any {
    // 如果没有注入 IsolationContextService，直接返回原上下文
    if (!this.isolationService) {
      return context || {};
    }

    // 获取当前隔离上下文
    const isolationContext = this.isolationService.getIsolationContext();
    
    // 合并隔离信息到日志上下文
    return {
      ...context,
      isolation: isolationContext?.toPlainObject(),
    };
  }
}

