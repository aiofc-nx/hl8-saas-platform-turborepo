/**
 * HTTP 异常抽象基类
 *
 * @description 提供符合 RFC7807 标准的异常处理基类
 *
 * ## 业务规则
 *
 * ### 异常创建规则
 * - 每个异常必须包含唯一的错误代码（errorCode）
 * - 错误代码应使用大写蛇形命名法（如：USER_NOT_FOUND）
 * - title 应简明扼要，描述错误类型
 * - detail 应提供具体的错误详情
 * - status 必须是有效的 HTTP 状态码
 *
 * ### RFC7807 规则
 * - type 字段默认为 `https://docs.hl8.com/errors#${errorCode}`
 * - 响应格式必须符合 RFC7807 标准
 * - instance 字段记录请求的唯一标识符
 *
 * ### 数据安全规则
 * - data 字段不应包含敏感信息
 * - 生产环境下 rootCause 不会暴露给客户端
 * - 错误堆栈信息仅记录到日志，不返回给客户端
 *
 * ### 日志记录规则
 * - 所有异常都会被自动记录到日志
 * - 日志包含完整的错误堆栈
 * - 日志包含请求上下文信息
 *
 * ## 使用场景
 *
 * 1. **业务异常**：继承此类创建特定的业务异常
 * 2. **API 错误响应**：通过 toRFC7807() 转换为标准响应
 * 3. **错误追踪**：通过 errorCode 追踪特定错误类型
 *
 * @example
 * ```typescript
 * // 创建自定义异常
 * export class UserNotFoundException extends AbstractHttpException {
 *   constructor(userId: string) {
 *     super(
 *       'USER_NOT_FOUND',
 *       '用户未找到',
 *       `ID 为 "${userId}" 的用户不存在`,
 *       404,
 *       { userId }
 *     );
 *   }
 * }
 *
 * // 使用
 * const user = await this.userRepo.findById(userId);
 * if (!user) {
 *   throw new UserNotFoundException(userId);
 * }
 *
 * // 转换为 RFC7807 格式
 * try {
 *   // ...
 * } catch (error) {
 *   if (error instanceof AbstractHttpException) {
 *     const problemDetails = error.toRFC7807();
 *     response.status(problemDetails.status).send(problemDetails);
 *   }
 * }
 * ```
 *
 * @since 0.1.0
 */

import { HttpException } from "@nestjs/common";

/**
 * RFC7807 问题详情接口
 *
 * @description 符合 RFC7807 标准的错误响应格式
 *
 * @see https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetails {
  /**
   * 错误类型的 URI 引用
   *
   * @description 用于识别错误类型的 URI，默认为文档链接
   */
  type: string;

  /**
   * 错误的简短摘要
   *
   * @description 简明扼要地描述错误类型
   */
  title: string;

  /**
   * 错误的详细说明
   *
   * @description 提供具体的错误详情，帮助开发者定位问题
   */
  detail: string;

  /**
   * HTTP 状态码
   *
   * @description 与响应的 HTTP 状态码一致
   */
  status: number;

  /**
   * 请求实例的唯一标识符
   *
   * @description 用于追踪特定的请求，通常为 Request ID
   */
  instance?: string;

  /**
   * 应用自定义的错误代码
   *
   * @description 用于程序化处理错误的唯一标识符
   */
  errorCode: string;

  /**
   * 附加数据
   *
   * @description 提供与错误相关的额外信息，不应包含敏感数据
   */
  data?: any;
}

/**
 * HTTP 异常抽象基类
 *
 * @description 所有自定义 HTTP 异常的基类，提供 RFC7807 标准支持
 *
 * ## 业务规则
 *
 * ### 继承规则
 * - 所有业务异常必须继承此类
 * - 子类必须提供有意义的 errorCode 和 title
 * - 子类的 status 必须与 HTTP 语义一致
 *
 * ### 命名规则
 * - 异常类名应以 "Exception" 结尾
 * - 异常类名应清晰描述错误类型
 *
 * @abstract
 */
export abstract class AbstractHttpException extends HttpException {
  /**
   * 创建 HTTP 异常实例
   *
   * @param errorCode - 应用自定义的错误代码（大写蛇形命名法）
   * @param title - 错误的简短摘要
   * @param detail - 错误的详细说明
   * @param status - HTTP 状态码
   * @param data - 附加数据（可选，不应包含敏感信息）
   * @param type - 错误类型的 URI（可选，默认为文档链接）
   * @param rootCause - 根本原因（可选，用于错误链追踪）
   *
   * @example
   * ```typescript
   * class CustomException extends AbstractHttpException {
   *   constructor(message: string) {
   *     super('CUSTOM_ERROR', '自定义错误', message, 400);
   *   }
   * }
   * ```
   */
  public readonly errorCode: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly httpStatus: number;
  public readonly data?: any;
  public readonly type?: string;
  public readonly rootCause?: Error;

  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: any,
    type?: string,
    rootCause?: Error,
  ) {
    super({ errorCode, title, detail, status, data }, status);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.title = title;
    this.detail = detail;
    this.httpStatus = status;
    this.data = data;
    this.type = type;
    this.rootCause = rootCause;
  }

  /**
   * 转换为 RFC7807 格式
   *
   * @description 将异常转换为符合 RFC7807 标准的问题详情对象
   *
   * ## 业务规则
   *
   * ### 转换规则
   * - type 默认为 `https://docs.hl8.com/errors#${errorCode}`
   * - instance 默认为 undefined，由过滤器填充
   * - 不包含 rootCause，仅记录到日志
   *
   * @returns RFC7807 格式的问题详情对象
   *
   * @example
   * ```typescript
   * const exception = new UserNotFoundException('user-123');
   * const problemDetails = exception.toRFC7807();
   * // 结果：
   * // {
   * //   type: 'https://docs.hl8.com/errors#USER_NOT_FOUND',
   * //   title: '用户未找到',
   * //   detail: 'ID 为 "user-123" 的用户不存在',
   * //   status: 404,
   * //   errorCode: 'USER_NOT_FOUND',
   * //   data: { userId: 'user-123' }
   * // }
   * ```
   */
  toRFC7807(): ProblemDetails {
    return {
      type: this.type || `https://docs.hl8.com/errors#${this.errorCode}`,
      title: this.title,
      detail: this.detail,
      status: this.httpStatus,
      errorCode: this.errorCode,
      data: this.data,
    };
  }
}
