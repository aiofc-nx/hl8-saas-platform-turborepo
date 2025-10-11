/**
 * Fastify 全局异常过滤器
 *
 * @description 专门为 Fastify 适配器设计的全局异常过滤器，处理所有未捕获异常
 *
 * ## 业务规则
 *
 * ### 异常处理规则
 * - 捕获所有未被其他过滤器处理的异常
 * - 转换为 RFC7807 Problem Details 格式
 * - 生产环境隐藏敏感信息
 * - 开发环境返回详细堆栈
 *
 * ### Fastify API 使用规则
 * - 使用 .code() 设置状态码
 * - 使用 FastifyReply 类型
 *
 * @since 0.1.0
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ProblemDetails } from '@hl8/nestjs-infra';

@Catch()
@Injectable()
export class FastifyAnyExceptionFilter implements ExceptionFilter {
  constructor(private readonly isProduction: boolean = process.env.NODE_ENV === 'production') {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let title = '服务器内部错误';
    let detail = '服务器处理请求时发生了错误';

    // 如果是 HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        title = resp.error || resp.message || title;
        detail = resp.message || detail;
      } else {
        detail = exceptionResponse as string;
      }
    }

    const problemDetails: ProblemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title,
      detail: this.isProduction ? detail : this.getDetailedError(exception),
      status,
      errorCode,
      instance: request.id || (request.headers['x-request-id'] as string),
    };

    // 使用 Fastify 的 .code() 方法（带类型检查）
    const reply = response as any;
    if (typeof reply.code === 'function') {
      reply
        .code(status)
        .header('Content-Type', 'application/problem+json; charset=utf-8')
        .send(problemDetails);
    } else {
      // 降级处理：使用标准 HTTP 方法
      reply.status(status);
      reply.header('Content-Type', 'application/problem+json; charset=utf-8');
      reply.send(problemDetails);
    }
  }

  private getDetailedError(exception: unknown): string {
    if (exception instanceof Error) {
      return `${exception.message}\n\nStack:\n${exception.stack}`;
    }
    return String(exception);
  }
}

