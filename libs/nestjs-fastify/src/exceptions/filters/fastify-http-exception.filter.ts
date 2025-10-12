/**
 * Fastify HTTP 异常过滤器
 *
 * @description 专门为 Fastify 适配器设计的异常过滤器，处理 AbstractHttpException
 * 使用全局 FastifyLoggerService 记录异常
 *
 * ## 业务规则
 *
 * ### Fastify API 使用规则
 * - 使用 .code() 设置状态码（而不是 .status()）
 * - 使用 FastifyReply 类型（而不是 Response）
 * - 返回 RFC7807 Problem Details 格式
 *
 * ### 日志记录规则
 * - 自动使用全局 FastifyLoggerService
 * - 日志自动包含隔离上下文
 * - 4xx 错误记录为 warn，5xx 错误记录为 error
 *
 * @since 0.1.0
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
  Optional,
} from '@nestjs/common';
import { AbstractHttpException } from '@hl8/exceptions';
import type { ILoggerService } from '@hl8/exceptions';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Catch(AbstractHttpException)
@Injectable()
export class FastifyHttpExceptionFilter implements ExceptionFilter {
  constructor(@Optional() private readonly logger?: ILoggerService) {}

  catch(exception: AbstractHttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const problemDetails = exception.toRFC7807();
    problemDetails.instance = request.id || (request.headers['x-request-id'] as string);

    // 记录异常日志（自动包含隔离上下文）
    if (this.logger) {
      const logMessage = `HTTP ${problemDetails.status}: ${problemDetails.title}`;
      const logContext = {
        errorCode: problemDetails.errorCode,
        detail: problemDetails.detail,
        url: request.url,
        method: request.method,
      };

      if (problemDetails.status >= 500) {
        this.logger.error(logMessage, exception.stack, logContext);
      } else {
        this.logger.warn(logMessage, logContext);
      }
    }

    // 使用 Fastify 的 .code() 方法
    // 注意：在某些特殊情况下（如中间件错误），response 可能还未完全初始化
    if (typeof response.code === 'function') {
      response
        .code(problemDetails.status)
        .header('Content-Type', 'application/problem+json; charset=utf-8')
        .send(problemDetails);
    } else {
      // 如果 response 未完全初始化，记录错误并尝试写入响应
      if (this.logger) {
        this.logger.error('Response object is not a FastifyReply, unable to send error response');
      }
      // 尝试最基本的错误响应
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 降级错误处理需要访问 raw HTTP 对象（宪章 IX 允许场景：第三方库集成）
        const res = response as any;
        if (res.raw && typeof res.raw.writeHead === 'function') {
          res.raw.writeHead(problemDetails.status, { 'Content-Type': 'application/problem+json; charset=utf-8' });
          res.raw.end(JSON.stringify(problemDetails));
        }
      } catch (err) {
        // 最后的降级：至少记录错误
        if (this.logger) {
          this.logger.error('Failed to send error response', err instanceof Error ? err.stack : undefined);
        }
      }
    }
  }
}

