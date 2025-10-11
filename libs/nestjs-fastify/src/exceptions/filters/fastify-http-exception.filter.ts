/**
 * Fastify HTTP 异常过滤器
 *
 * @description 专门为 Fastify 适配器设计的异常过滤器，处理 AbstractHttpException
 *
 * ## 业务规则
 *
 * ### Fastify API 使用规则
 * - 使用 .code() 设置状态码（而不是 .status()）
 * - 使用 FastifyReply 类型（而不是 Response）
 * - 返回 RFC7807 Problem Details 格式
 *
 * @since 0.1.0
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
} from '@nestjs/common';
import { AbstractHttpException } from '@hl8/nestjs-infra';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Catch(AbstractHttpException)
@Injectable()
export class FastifyHttpExceptionFilter implements ExceptionFilter {
  catch(exception: AbstractHttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const problemDetails = exception.toRFC7807();
    problemDetails.instance = request.id || (request.headers['x-request-id'] as string);

    // Fastify 使用 .code() 方法设置状态码
    response
      .code(problemDetails.status)
      .header('Content-Type', 'application/problem+json; charset=utf-8')
      .send(problemDetails);
  }
}

