/**
 * 隔离上下文缺失异常测试
 *
 * @description 测试 IsolationContextMissingException 异常类
 */

import { IsolationContextMissingException } from "./isolation-context-missing.exception.js";

describe("IsolationContextMissingException", () => {
  it("应该创建异常实例", () => {
    const exception = new IsolationContextMissingException("缺少租户 ID");
    expect(exception).toBeInstanceOf(IsolationContextMissingException);
  });

  it("应该包含正确的错误代码和状态码", () => {
    const exception = new IsolationContextMissingException("缺少租户 ID");
    const response = exception.getResponse() as any;

    expect(response.errorCode).toBe("ISOLATION_CONTEXT_MISSING");
    expect(response.status).toBe(400);
    expect(response.title).toBe("隔离上下文缺失");
  });

  it("应该包含所需隔离级别信息", () => {
    const exception = new IsolationContextMissingException("缺少租户 ID", {
      requiredLevel: "TENANT",
    });

    const response = exception.getResponse() as any;
    expect(response.data.requiredLevel).toBe("TENANT");
  });
});
