/**
 * AbstractHttpException 单元测试
 */

import { AbstractHttpException, ProblemDetails } from './abstract-http.exception.js';

/**
 * 测试用异常类
 */
class TestException extends AbstractHttpException {
  constructor(
    errorCode: string = 'TEST_ERROR',
    title: string = '测试错误',
    detail: string = '这是一个测试错误',
    status: number = 400,
    data?: any,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
}

describe('AbstractHttpException', () => {
  describe('构造函数', () => {
    it('应该创建基本异常实例', () => {
      // Arrange & Act
      const exception = new TestException();

      // Assert
      expect(exception).toBeInstanceOf(AbstractHttpException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.errorCode).toBe('TEST_ERROR');
      expect(exception.title).toBe('测试错误');
      expect(exception.detail).toBe('这是一个测试错误');
      expect(exception.httpStatus).toBe(400);
      expect(exception.name).toBe('TestException');
    });

    it('应该正确设置所有属性', () => {
      // Arrange
      const errorCode = 'CUSTOM_ERROR';
      const title = '自定义错误';
      const detail = '这是一个自定义错误详情';
      const status = 404;
      const data = { userId: 'user-123' };
      const type = 'https://example.com/errors#custom';
      const rootCause = new Error('根本原因');

      // Act
      const exception = new TestException(
        errorCode,
        title,
        detail,
        status,
        data,
        type,
        rootCause,
      );

      // Assert
      expect(exception.errorCode).toBe(errorCode);
      expect(exception.title).toBe(title);
      expect(exception.detail).toBe(detail);
      expect(exception.httpStatus).toBe(status);
      expect(exception.data).toBe(data);
      expect(exception.type).toBe(type);
      expect(exception.rootCause).toBe(rootCause);
    });

    it('应该允许可选参数为 undefined', () => {
      // Act
      const exception = new TestException('ERROR', '错误', '详情', 500);

      // Assert
      expect(exception.data).toBeUndefined();
      expect(exception.type).toBeUndefined();
      expect(exception.rootCause).toBeUndefined();
    });
  });

  describe('toRFC7807()', () => {
    it('应该转换为 RFC7807 格式', () => {
      // Arrange
      const exception = new TestException(
        'USER_NOT_FOUND',
        '用户未找到',
        'ID 为 "user-123" 的用户不存在',
        404,
        { userId: 'user-123' },
      );

      // Act
      const problemDetails: ProblemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: 'https://docs.hl8.com/errors#USER_NOT_FOUND',
        title: '用户未找到',
        detail: 'ID 为 "user-123" 的用户不存在',
        status: 404,
        errorCode: 'USER_NOT_FOUND',
        data: { userId: 'user-123' },
      });
    });

    it('应该使用默认 type', () => {
      // Arrange
      const exception = new TestException('DEFAULT_ERROR', '默认', '详情', 400);

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails.type).toBe(
        'https://docs.hl8.com/errors#DEFAULT_ERROR',
      );
    });

    it('应该使用自定义 type', () => {
      // Arrange
      const customType = 'https://custom.com/errors#custom';
      const exception = new TestException(
        'CUSTOM_ERROR',
        '自定义',
        '详情',
        400,
        undefined,
        customType,
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails.type).toBe(customType);
    });

    it('应该不包含 rootCause', () => {
      // Arrange
      const rootCause = new Error('根本原因');
      const exception = new TestException(
        'ERROR',
        '错误',
        '详情',
        500,
        undefined,
        undefined,
        rootCause,
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).not.toHaveProperty('rootCause');
    });

    it('应该处理无 data 的情况', () => {
      // Arrange
      const exception = new TestException('ERROR', '错误', '详情', 400);

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails.data).toBeUndefined();
    });
  });

  describe('NestJS HttpException 集成', () => {
    it('应该具有正确的 HTTP 状态码', () => {
      // Arrange & Act
      const exception = new TestException('ERROR', '错误', '详情', 418);

      // Assert
      expect(exception.getStatus()).toBe(418);
    });

    it('应该具有正确的响应对象', () => {
      // Arrange
      const errorCode = 'TEST_ERROR';
      const title = '测试';
      const detail = '详情';
      const status = 400;
      const data = { key: 'value' };

      // Act
      const exception = new TestException(errorCode, title, detail, status, data);

      // Assert
      const response = exception.getResponse();
      expect(response).toEqual({
        errorCode,
        title,
        detail,
        status,
        data,
      });
    });
  });

  describe('错误链追踪', () => {
    it('应该保留 rootCause', () => {
      // Arrange
      const originalError = new Error('原始错误');
      originalError.stack = '原始错误堆栈';

      // Act
      const exception = new TestException(
        'WRAPPED_ERROR',
        '包装错误',
        '详情',
        500,
        undefined,
        undefined,
        originalError,
      );

      // Assert
      expect(exception.rootCause).toBe(originalError);
      expect(exception.rootCause?.message).toBe('原始错误');
      expect(exception.rootCause?.stack).toBe('原始错误堆栈');
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      // Act
      const exception = new TestException('', '', '', 200);

      // Assert
      expect(exception.errorCode).toBe('');
      expect(exception.title).toBe('');
      expect(exception.detail).toBe('');
    });

    it('应该处理特殊 HTTP 状态码', () => {
      // 测试各种 HTTP 状态码
      const testCases = [200, 201, 301, 302, 400, 401, 403, 404, 500, 502, 503];

      testCases.forEach((status) => {
        const exception = new TestException('ERROR', '错误', '详情', status);
        expect(exception.httpStatus).toBe(status);
        expect(exception.getStatus()).toBe(status);
      });
    });

    it('应该处理复杂的 data 对象', () => {
      // Arrange
      const complexData = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        null: null,
        boolean: true,
      };

      // Act
      const exception = new TestException(
        'ERROR',
        '错误',
        '详情',
        400,
        complexData,
      );

      // Assert
      expect(exception.data).toEqual(complexData);
      expect(exception.toRFC7807().data).toEqual(complexData);
    });
  });
});

