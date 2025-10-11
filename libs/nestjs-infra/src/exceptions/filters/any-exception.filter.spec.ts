/**
 * AnyExceptionFilter 单元测试
 */

import { AnyExceptionFilter } from './any-exception.filter';
import { ILoggerService } from './http-exception.filter';
import { ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';

describe('AnyExceptionFilter', () => {
  let filter: AnyExceptionFilter;
  let mockLogger: jest.Mocked<ILoggerService>;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockResponse: any;
  let mockRequest: any;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // 保存原始 NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // 创建 Mock 对象
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRequest = {
      id: 'req-456',
      method: 'POST',
      url: '/api/test',
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Test Agent',
        'x-request-id': 'req-456',
      },
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  afterEach(() => {
    // 恢复原始 NODE_ENV
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('基本功能', () => {
    it('应该创建过滤器实例', () => {
      // Act
      filter = new AnyExceptionFilter();

      // Assert
      expect(filter).toBeInstanceOf(AnyExceptionFilter);
    });

    it('应该使用注入的日志服务', () => {
      // Act
      filter = new AnyExceptionFilter(mockLogger);

      // Assert
      expect(filter).toBeDefined();
    });

    it('应该根据 NODE_ENV 判断生产环境', () => {
      // Arrange
      process.env.NODE_ENV = 'production';

      // Act
      filter = new AnyExceptionFilter(mockLogger);

      // Assert
      expect(filter).toBeDefined();
    });

    it('应该允许手动指定生产环境', () => {
      // Act
      filter = new AnyExceptionFilter(mockLogger, true);

      // Assert
      expect(filter).toBeDefined();
    });
  });

  describe('catch() - Error 实例', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      filter = new AnyExceptionFilter(mockLogger, true);
    });

    it('应该捕获 Error 实例', () => {
      // Arrange
      const error = new Error('测试错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/problem+json; charset=utf-8',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR',
          status: 500,
          errorCode: 'INTERNAL_SERVER_ERROR',
          instance: 'req-456',
        }),
      );
    });

    it('应该捕获 TypeError', () => {
      // Arrange
      const error = new TypeError('类型错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该捕获 ReferenceError', () => {
      // Arrange
      const error = new ReferenceError('引用错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('catch() - HttpException', () => {
    beforeEach(() => {
      filter = new AnyExceptionFilter(mockLogger);
    });

    it('应该捕获 HttpException 并保留状态码', () => {
      // Arrange
      const exception = new HttpException('Forbidden', 403);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('应该捕获 BadRequestException', () => {
      // Arrange
      const exception = new BadRequestException('参数错误');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
        }),
      );
    });

    it('应该处理 HttpException 的对象响应', () => {
      // Arrange
      const exception = new HttpException(
        {
          error: 'Validation Error',
          message: ['field1 is required', 'field2 is invalid'],
        },
        400,
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'field1 is required, field2 is invalid',
        }),
      );
    });

    it('应该处理 HttpException 的字符串响应', () => {
      // Arrange
      const exception = new HttpException('Simple error message', 400);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Simple error message',
        }),
      );
    });
  });

  describe('catch() - 其他类型异常', () => {
    beforeEach(() => {
      filter = new AnyExceptionFilter(mockLogger);
    });

    it('应该捕获字符串异常', () => {
      // Arrange
      const exception = '字符串错误';

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该捕获数字异常', () => {
      // Arrange
      const exception = 12345;

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该捕获对象异常', () => {
      // Arrange
      const exception = { code: 'ERR_001', message: '自定义错误' };

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该捕获 null', () => {
      // Arrange
      const exception = null;

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该捕获 undefined', () => {
      // Arrange
      const exception = undefined;

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('生产环境 vs 开发环境', () => {
    it('生产环境不应暴露错误堆栈', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      filter = new AnyExceptionFilter(mockLogger, true);
      const error = new Error('敏感错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: '处理请求时发生未预期的错误',
        }),
      );
    });

    it('开发环境应包含详细错误信息', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      filter = new AnyExceptionFilter(mockLogger, false);
      const error = new Error('开发错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      const sendCall = mockResponse.send.mock.calls[0][0];
      expect(sendCall.detail).toContain('开发错误');
      expect(sendCall.detail).toContain('堆栈追踪');
    });
  });

  describe('日志记录', () => {
    beforeEach(() => {
      filter = new AnyExceptionFilter(mockLogger);
    });

    it('应该记录完整的错误信息', () => {
      // Arrange
      const error = new Error('测试错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unhandled Exception: 测试错误',
        expect.stringContaining('Error: 测试错误'),
        expect.objectContaining({
          request: expect.objectContaining({
            id: 'req-456',
            method: 'POST',
            url: '/api/test',
          }),
          exceptionType: 'Error',
          timestamp: expect.any(String),
        }),
      );
    });

    it('应该记录异常类型', () => {
      // Arrange
      const error = new TypeError('类型错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          exceptionType: 'TypeError',
        }),
      );
    });

    it('应该记录非 Error 类型的异常', () => {
      // Arrange
      const exception = '字符串异常';

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unhandled Exception: 字符串异常',
        undefined, // 非 Error 类型没有 stack
        expect.objectContaining({
          exceptionType: 'string',
        }),
      );
    });

    it('应该在没有日志服务时使用 console', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      filter = new AnyExceptionFilter(); // 不注入日志服务
      const error = new Error('测试错误');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unhandled Exception:',
        expect.objectContaining({
          message: '测试错误',
        }),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('边界情况', () => {
    beforeEach(() => {
      filter = new AnyExceptionFilter(mockLogger);
    });

    it('应该处理循环引用的对象', () => {
      // Arrange
      const obj: any = { name: 'test' };
      obj.self = obj; // 创建循环引用

      // Act
      filter.catch(obj, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('应该处理没有 request.id 的情况', () => {
      // Arrange
      mockRequest.id = undefined;
      const error = new Error('测试');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: 'req-456', // 应该使用 x-request-id header
        }),
      );
    });
  });
});

