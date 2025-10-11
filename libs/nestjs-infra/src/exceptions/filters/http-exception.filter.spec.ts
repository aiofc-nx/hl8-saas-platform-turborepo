/**
 * HttpExceptionFilter 单元测试
 */

import { HttpExceptionFilter, ILoggerService, IExceptionMessageProvider } from './http-exception.filter.js';
import { GeneralNotFoundException } from '../core/general-not-found.exception.js';
import { GeneralBadRequestException } from '../core/general-bad-request.exception.js';
import { GeneralInternalServerException } from '../core/general-internal-server.exception.js';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockLogger: jest.Mocked<ILoggerService>;
  let mockMessageProvider: jest.Mocked<IExceptionMessageProvider>;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    // 创建 Mock 对象
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockMessageProvider = {
      getMessage: jest.fn(),
      hasMessage: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRequest = {
      id: 'req-123',
      method: 'GET',
      url: '/api/users/123',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test',
        'x-request-id': 'req-123',
      },
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  describe('基本功能', () => {
    it('应该创建过滤器实例', () => {
      // Act
      filter = new HttpExceptionFilter();

      // Assert
      expect(filter).toBeInstanceOf(HttpExceptionFilter);
    });

    it('应该使用注入的日志服务', () => {
      // Act
      filter = new HttpExceptionFilter(mockLogger);

      // Assert
      expect(filter).toBeDefined();
    });

    it('应该使用注入的消息提供者', () => {
      // Act
      filter = new HttpExceptionFilter(mockLogger, mockMessageProvider);

      // Assert
      expect(filter).toBeDefined();
    });
  });

  describe('catch() - 异常捕获', () => {
    beforeEach(() => {
      filter = new HttpExceptionFilter(mockLogger);
    });

    it('应该捕获 GeneralNotFoundException', () => {
      // Arrange
      const exception = new GeneralNotFoundException(
        '用户未找到',
        'ID 为 "user-123" 的用户不存在',
        { userId: 'user-123' },
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/problem+json; charset=utf-8',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'https://docs.hl8.com/errors#NOT_FOUND',
          title: '用户未找到',
          detail: 'ID 为 "user-123" 的用户不存在',
          status: 404,
          errorCode: 'NOT_FOUND',
          instance: 'req-123',
          data: { userId: 'user-123' },
        }),
      );
    });

    it('应该捕获 GeneralBadRequestException', () => {
      // Arrange
      const exception = new GeneralBadRequestException(
        '参数验证失败',
        '邮箱格式不正确',
        { field: 'email' },
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'BAD_REQUEST',
          status: 400,
        }),
      );
    });

    it('应该捕获 GeneralInternalServerException', () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        '数据库错误',
        '数据库连接失败',
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
          status: 500,
        }),
      );
    });

    it('应该填充 instance 字段', () => {
      // Arrange
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: 'req-123',
        }),
      );
    });

    it('应该处理没有 request.id 的情况', () => {
      // Arrange
      mockRequest.id = undefined;
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: 'req-123', // 应该使用 x-request-id header
        }),
      );
    });
  });

  describe('日志记录', () => {
    beforeEach(() => {
      filter = new HttpExceptionFilter(mockLogger);
    });

    it('应该记录 4xx 错误为 warn 级别', () => {
      // Arrange
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'HTTP 404: 未找到',
        expect.objectContaining({
          exception: expect.any(Object),
          request: expect.any(Object),
        }),
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('应该记录 5xx 错误为 error 级别', () => {
      // Arrange
      const exception = new GeneralInternalServerException('错误', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'HTTP 500: 错误',
        expect.any(String), // stack
        expect.objectContaining({
          exception: expect.any(Object),
          request: expect.any(Object),
        }),
      );
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('应该记录完整的请求上下文', () => {
      // Arrange
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          request: {
            id: 'req-123',
            method: 'GET',
            url: '/api/users/123',
            ip: '127.0.0.1',
            userAgent: 'Jest Test',
          },
        }),
      );
    });

    it('应该记录 rootCause', () => {
      // Arrange
      const rootCause = new Error('原始错误');
      const exception = new GeneralInternalServerException(
        '错误',
        '详情',
        undefined,
        rootCause,
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          rootCause: '原始错误',
        }),
      );
    });

    it('应该在没有日志服务时使用 console', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      filter = new HttpExceptionFilter(); // 不注入日志服务
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('消息提供者集成', () => {
    beforeEach(() => {
      filter = new HttpExceptionFilter(mockLogger, mockMessageProvider);
    });

    it('应该使用消息提供者的自定义消息', () => {
      // Arrange
      mockMessageProvider.getMessage
        .mockReturnValueOnce('自定义标题')
        .mockReturnValueOnce('自定义详情');

      const exception = new GeneralNotFoundException(
        '默认标题',
        '默认详情',
        { userId: '123' },
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockMessageProvider.getMessage).toHaveBeenCalledWith(
        'NOT_FOUND',
        'title',
        { userId: '123' },
      );
      expect(mockMessageProvider.getMessage).toHaveBeenCalledWith(
        'NOT_FOUND',
        'detail',
        { userId: '123' },
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '自定义标题',
          detail: '自定义详情',
        }),
      );
    });

    it('应该在消息提供者返回 undefined 时使用默认消息', () => {
      // Arrange
      mockMessageProvider.getMessage.mockReturnValue(undefined);

      const exception = new GeneralNotFoundException('默认标题', '默认详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '默认标题',
          detail: '默认详情',
        }),
      );
    });

    it('应该支持部分自定义消息', () => {
      // Arrange
      mockMessageProvider.getMessage
        .mockReturnValueOnce('自定义标题')
        .mockReturnValueOnce(undefined); // detail 返回 undefined

      const exception = new GeneralBadRequestException(
        '默认标题',
        '默认详情',
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '自定义标题',
          detail: '默认详情', // 使用默认
        }),
      );
    });
  });

  describe('边界情况', () => {
    beforeEach(() => {
      filter = new HttpExceptionFilter(mockLogger);
    });

    it('应该处理没有 data 的异常', () => {
      // Arrange
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: undefined,
        }),
      );
    });

    it('应该处理复杂的 data 对象', () => {
      // Arrange
      const complexData = {
        nested: { value: 'test' },
        array: [1, 2, 3],
      };
      const exception = new GeneralNotFoundException(
        '未找到',
        '详情',
        complexData,
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: complexData,
        }),
      );
    });
  });
});

