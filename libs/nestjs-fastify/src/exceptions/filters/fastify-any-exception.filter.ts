// prettier-ignore-file
/**
 * Fastify 全局异常过滤器
 *
 * @description 专门为 Fastify 适配器设计的全局异常过滤器，处理所有未捕获异常
 * 使用全局 FastifyLoggerService 记录所有异常
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
 * ### 日志记录规则
 * - 使用全局 FastifyLoggerService
 * - 所有异常都记录为 error 级别
 * - 自动包含隔离上下文
 *
 * @since 0.1.0
 */

import type { ILoggerService, ProblemDetails } from "@hl8/exceptions/index.js";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Optional,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

@Catch()
@Injectable()
export class FastifyAnyExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional() private readonly logger?: ILoggerService,
    private readonly isProduction: boolean = process.env.NODE_ENV ===
      "production",
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode = "INTERNAL_SERVER_ERROR";
    let title = "服务器内部错误";
    let detail = "服务器处理请求时发生了错误";

    // 如果是 HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
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
      instance: request.id || (request.headers["x-request-id"] as string),
    };

    // 记录未捕获异常（自动包含隔离上下文）
    if (this.logger) {
      const logMessage = `Unhandled Exception: ${title}`;
      const logContext = {
        errorCode,
        detail: this.getDetailedError(exception),
        url: request.url,
        method: request.method,
        // prettier-ignore
        err:
          exception instanceof Error
            ? {
              type: exception.constructor.name,
              message: exception.message,
              stack: exception.stack,
            }
            : undefined,
      };
      this.logger.error(logMessage, undefined, logContext);
    }

    // 使用 Fastify 的 .code() 方法
    // 注意：在某些特殊情况下（如中间件错误），response 可能还未完全初始化
    // 因此需要检查 code 方法是否存在
    if (typeof response.code === "function") {
      response
        .code(status)
        .header("Content-Type", "application/problem+json; charset=utf-8")
        .send(problemDetails);
    } else {
      // 如果 response 未完全初始化，记录错误并尝试写入响应
      if (this.logger) {
        this.logger.error(
          "Response object is not a FastifyReply, unable to send error response",
        );
      }
      // 尝试最基本的错误响应
      try {
        const res = response as any;
        if (res.raw && typeof res.raw.writeHead === "function") {
          res.raw.writeHead(status, {
            "Content-Type": "application/problem+json; charset=utf-8",
          });
          res.raw.end(JSON.stringify(problemDetails));
        }
      } catch (err) {
        // 最后的降级：至少记录错误
        if (this.logger) {
          this.logger.error(
            "Failed to send error response",
            err instanceof Error ? err.stack : undefined,
          );
        }
      }
    }
  }

  private getDetailedError(exception: unknown): string {
    if (exception instanceof Error) {
      return `${exception.message}\n\nStack:\n${exception.stack}`;
    }
    return String(exception);
  }
}
