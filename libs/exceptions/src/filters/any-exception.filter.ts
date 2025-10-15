/**
 * 全局异常过滤器
 *
 * @description 捕获所有未被其他过滤器处理的异常，防止敏感信息泄露
 *
 * ## 业务规则
 *
 * ### 异常捕获规则
 * - 捕获所有类型的异常（包括未知异常）
 * - AbstractHttpException 由 HttpExceptionFilter 优先处理
 * - NestJS 内置异常保留原有行为
 * - 所有其他异常统一转换为 500 错误
 *
 * ### 安全规则
 * - 生产环境不暴露错误堆栈
 * - 不暴露系统内部细节
 * - 敏感信息仅记录到日志，不返回给客户端
 * - 错误响应使用通用描述
 *
 * ### 日志记录规则
 * - 记录完整的错误堆栈到日志
 * - 记录请求上下文（URL、方法、IP等）
 * - 记录时间戳和请求 ID
 * - 日志级别为 error
 *
 * ### 响应规则
 * - HTTP 状态码：500
 * - 响应格式符合 RFC7807 标准
 * - 响应头包含 Content-Type: application/problem+json
 *
 * ## 使用场景
 *
 * 1. **未预期错误**：捕获所有开发者未显式处理的错误
 * 2. **第三方库错误**：捕获第三方库抛出的异常
 * 3. **运行时错误**：捕获 TypeError、ReferenceError 等运行时错误
 * 4. **兜底保护**：确保应用不会因未处理的异常而崩溃
 *
 * @example
 * ```typescript
 * // 在 main.ts 中注册过滤器
 * import { AnyExceptionFilter } from '@hl8/nestjs-infra';
 *
 * const app = await NestFactory.create(AppModule);
 * app.useGlobalFilters(new AnyExceptionFilter());
 * await app.listen(3000);
 *
 * // 或者通过模块注册
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useClass: AnyExceptionFilter,
 *     },
 *   ],
 * })
 * export class AppModule {}
 *
 * // 注意：AnyExceptionFilter 应该在 HttpExceptionFilter 之后注册
 * app.useGlobalFilters(
 *   new HttpExceptionFilter(),  // 优先处理已知异常
 *   new AnyExceptionFilter()    // 兜底处理未知异常
 * );
 * ```
 *
 * @since 0.1.0
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Optional,
} from "@nestjs/common";
import { ProblemDetails } from "../core/abstract-http.exception.js";
import type { ILoggerService } from "./http-exception.filter.js";

/**
 * 全局异常过滤器
 *
 * @description 捕获所有未被其他过滤器处理的异常
 */
@Injectable()
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  /**
   * 创建全局异常过滤器
   *
   * @param logger - 日志服务（可选）
   * @param isProduction - 是否为生产环境（可选，默认根据 NODE_ENV 判断）
   */
  constructor(
    @Optional() private readonly logger?: ILoggerService,
    @Optional() private readonly isProduction?: boolean,
  ) {
    // 如果未指定，根据环境变量判断
    if (this.isProduction === undefined) {
      this.isProduction = process.env.NODE_ENV === "production";
    }
  }

  /**
   * 捕获所有异常并处理
   *
   * @param exception - 异常实例（可能是任意类型）
   * @param host - ArgumentsHost 实例
   *
   * @description 将未知异常转换为 RFC7807 格式的 500 错误
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 确定状态码
    let status = 500;
    const errorCode = "INTERNAL_SERVER_ERROR";
    let title = "服务器内部错误";
    let detail = "处理请求时发生未预期的错误";

    // 如果是 NestJS 内置 HttpException，保留其状态码
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        title = resp.error || resp.message || title;
        detail = Array.isArray(resp.message)
          ? resp.message.join(", ")
          : resp.message || detail;
      } else if (typeof exceptionResponse === "string") {
        detail = exceptionResponse;
      }
    }

    // 构造 RFC7807 格式响应
    const problemDetails: ProblemDetails = {
      type: "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
      title,
      detail: this.isProduction ? detail : this.getDetailedError(exception),
      status,
      errorCode,
      instance: request.id || request.headers?.["x-request-id"],
    };

    // 记录日志
    this.logException(exception, problemDetails, request);

    // 发送响应（Fastify 使用 .code() 方法）
    response
      .code(status)
      .header("Content-Type", "application/problem+json; charset=utf-8")
      .send(problemDetails);
  }

  /**
   * 获取详细错误信息（仅开发环境）
   *
   * @param exception - 异常实例
   * @returns 详细的错误描述
   *
   * @private
   */
  private getDetailedError(exception: unknown): string {
    if (exception instanceof Error) {
      return `${exception.message}\n\n堆栈追踪:\n${exception.stack}`;
    }

    if (typeof exception === "string") {
      return exception;
    }

    try {
      return JSON.stringify(exception, null, 2);
    } catch {
      return String(exception);
    }
  }

  /**
   * 记录异常日志
   *
   * @param exception - 异常实例
   * @param problemDetails - RFC7807 格式的问题详情
   * @param request - 请求对象
   *
   * @private
   */
  private logException(
    exception: unknown,
    problemDetails: ProblemDetails,
    request: any,
  ): void {
    const logContext = {
      exception: problemDetails,
      request: {
        id: request.id || request.headers?.["x-request-id"],
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers?.["user-agent"],
      },
      exceptionType:
        exception instanceof Error
          ? exception.constructor.name
          : typeof exception,
      timestamp: new Date().toISOString(),
    };

    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    if (this.logger) {
      this.logger.error(
        `Unhandled Exception: ${errorMessage}`,
        errorStack,
        logContext,
      );
    }
    // 如果没有注入日志服务，静默处理（避免 console 污染）
  }
}
