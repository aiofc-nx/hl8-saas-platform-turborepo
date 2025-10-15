/**
 * 无效隔离上下文异常
 *
 * @since 0.2.0
 */

import { AbstractHttpException } from "./abstract-http.exception.js";

export class InvalidIsolationContextException extends AbstractHttpException {
  constructor(reason: string, data?: any) {
    super("INVALID_ISOLATION_CONTEXT", "无效的隔离上下文", reason, 400, data);
  }
}
