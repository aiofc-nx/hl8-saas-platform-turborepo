/**
 * HTTP 异常过滤器
 *
 * @description 捕获 AbstractHttpException 异常并转换为 RFC7807 格式响应
 *
 * ## 业务规则
 *
 * ### 异常捕获规则
 * - 只捕获 AbstractHttpException 及其子类
 * - 未知异常由 AnyExceptionFilter 处理
 * - 异常响应必须符合 RFC7807 标准
 *
 * ### 日志记录规则
 * - 所有异常都会记录到日志
 * - 日志级别根据 HTTP 状态码自动确定
 * - 日志包含完整的请求上下文
 * - 4xx 错误记录为 warn 级别
 * - 5xx 错误记录为 error 级别
 *
 * ### 响应规则
 * - 响应头包含 Content-Type: application/problem+json
 * - 响应体为 RFC7807 格式
 * - instance 字段填充为 request.id
 *
 * ### 消息提供者规则
 * - 如果配置了消息提供者，优先使用提供者的消息
 * - 消息提供者不存在时，使用异常自身的消息
 * - 支持消息参数替换
 *
 * ## 使用场景
 *
 * 1. **业务异常转换**：将业务异常转换为 RFC7807 响应
 * 2. **错误日志记录**：自动记录异常详情和请求上下文
 * 3. **错误消息国际化**：通过消息提供者支持多语言
 *
 * @example
 * ```typescript
 * // 在 main.ts 中注册过滤器
 * import { HttpExceptionFilter } from '@hl8/nestjs-infra';
 *
 * const app = await NestFactory.create(AppModule);
 * app.useGlobalFilters(new HttpExceptionFilter());
 * await app.listen(3000);
 *
 * // 或者通过模块注册
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useClass: HttpExceptionFilter,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @since 0.1.0
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
  Optional,
} from '@nestjs/common';
import {
  AbstractHttpException,
  ProblemDetails,
} from '../core/abstract-http.exception.js';

/**
 * 日志服务接口
 *
 * @description 定义日志服务的基本方法
 */
export interface ILoggerService {
  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  log(message: string, context?: any): void;

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param stack - 错误堆栈（可选）
   * @param context - 日志上下文（可选）
   */
  error(message: string, stack?: string, context?: any): void;

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 日志上下文（可选）
   */
  warn(message: string, context?: any): void;
}

/**
 * 异常消息提供者接口
 *
 * @description 用于提供自定义的异常消息（支持国际化）
 */
export interface IExceptionMessageProvider {
  /**
   * 获取消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型（title 或 detail）
   * @param params - 消息参数（用于替换占位符）
   * @returns 消息字符串，如果不存在则返回 undefined
   */
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, any>,
  ): string | undefined;

  /**
   * 检查是否有消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型
   * @returns 如果有消息则返回 true
   */
  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean;
}

/**
 * HTTP 异常过滤器
 *
 * @description 捕获并处理 AbstractHttpException 异常
 */
@Injectable()
@Catch(AbstractHttpException)
export class HttpExceptionFilter
  implements ExceptionFilter<AbstractHttpException>
{
  /**
   * 创建 HTTP 异常过滤器
   *
   * @param logger - 日志服务（可选）
   * @param messageProvider - 消息提供者（可选）
   */
  constructor(
    @Optional() private readonly logger?: ILoggerService,
    @Optional() private readonly messageProvider?: IExceptionMessageProvider,
  ) {}

  /**
   * 捕获异常并处理
   *
   * @param exception - 异常实例
   * @param host - ArgumentsHost 实例
   *
   * @description 将异常转换为 RFC7807 格式并发送响应
   */
  catch(exception: AbstractHttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 转换为 RFC7807 格式
    let problemDetails = exception.toRFC7807();

    // 如果有消息提供者，尝试使用自定义消息
    if (this.messageProvider) {
      const customTitle = this.messageProvider.getMessage(
        exception.errorCode,
        'title',
        exception.data,
      );
      const customDetail = this.messageProvider.getMessage(
        exception.errorCode,
        'detail',
        exception.data,
      );

      problemDetails = {
        ...problemDetails,
        title: customTitle || problemDetails.title,
        detail: customDetail || problemDetails.detail,
      };
    }

    // 填充 instance 字段（请求 ID）
    problemDetails.instance = request.id || request.headers?.['x-request-id'];

    // 记录日志
    this.logException(exception, problemDetails, request);

    // 设置响应头并发送响应（Fastify 使用 .code() 方法）
    response
      .code(problemDetails.status)
      .header('Content-Type', 'application/problem+json; charset=utf-8')
      .send(problemDetails);
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
    exception: AbstractHttpException,
    problemDetails: ProblemDetails,
    request: any,
  ): void {
    const logContext = {
      exception: problemDetails,
      request: {
        id: request.id || request.headers?.['x-request-id'],
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers?.['user-agent'],
      },
      rootCause: exception.rootCause?.message,
    };

    // 根据状态码选择日志级别
    if (this.logger) {
      if (problemDetails.status >= 500) {
        this.logger.error(
          `HTTP ${problemDetails.status}: ${problemDetails.title}`,
          exception.stack,
          logContext,
        );
      } else {
        this.logger.warn(
          `HTTP ${problemDetails.status}: ${problemDetails.title}`,
          logContext,
        );
      }
    }
    // 如果没有注入日志服务，静默处理（避免 console 污染）
  }
}
