import { AbstractHttpException } from "@hl8/exceptions";

/**
 * 业务核心应用层异常基类
 *
 * @description 业务核心模块的异常基类，继承自平台级异常基类
 * 提供业务核心模块特定的异常处理机制，遵循RFC7807标准
 * @since 1.0.0
 */
export abstract class ApplicationException extends AbstractHttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number = 500,
    data?: any,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
}
