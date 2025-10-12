/**
 * InvalidIsolationContextException 单元测试
 */

import { InvalidIsolationContextException } from './invalid-isolation-context.exception.js';

describe('InvalidIsolationContextException', () => {
  it('应该创建无效隔离上下文异常', () => {
    const exception = new InvalidIsolationContextException('上下文无效');

    expect(exception).toBeInstanceOf(InvalidIsolationContextException);
    expect(exception.errorCode).toBe('INVALID_ISOLATION_CONTEXT');
    expect(exception.httpStatus).toBe(400);
  });

  it('应该支持详细信息', () => {
    const exception = new InvalidIsolationContextException(
      '层级关系不一致',
      { context: 'details' },
    );

    const rfc7807 = exception.toRFC7807();
    
    expect(rfc7807.title).toBe('无效的隔离上下文');
    expect(rfc7807.detail).toBe('层级关系不一致');
    expect(rfc7807.data).toEqual({ context: 'details' });
  });
});

