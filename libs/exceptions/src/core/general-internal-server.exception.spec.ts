/**
 * GeneralInternalServerException 单元测试
 */

import { AbstractHttpException } from './abstract-http.exception.js';
import { GeneralInternalServerException } from './general-internal-server.exception.js';

describe('GeneralInternalServerException', () => {
  describe('构造函数', () => {
    it('应该创建 500 异常实例', () => {
      // Arrange & Act
      const exception = new GeneralInternalServerException(
        '服务器错误',
        '内部服务器发生错误',
      );

      // Assert
      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception).toBeInstanceOf(AbstractHttpException);
      expect(exception.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(exception.httpStatus).toBe(500);
    });

    it('应该正确设置标题和详情', () => {
      // Arrange
      const title = '数据库连接失败';
      const detail = '无法连接到数据库服务器';

      // Act
      const exception = new GeneralInternalServerException(title, detail);

      // Assert
      expect(exception.title).toBe(title);
      expect(exception.detail).toBe(detail);
    });

    it('应该正确设置附加数据', () => {
      // Arrange
      const data = { host: 'localhost', port: 5432 };

      // Act
      const exception = new GeneralInternalServerException(
        '连接失败',
        '详情',
        data,
      );

      // Assert
      expect(exception.data).toEqual(data);
    });

    it('应该正确设置 rootCause', () => {
      // Arrange
      const rootCause = new Error('原始错误');

      // Act
      const exception = new GeneralInternalServerException(
        '错误',
        '详情',
        undefined,
        rootCause,
      );

      // Assert
      expect(exception.rootCause).toBe(rootCause);
    });
  });

  describe('toRFC7807()', () => {
    it('应该返回正确的 RFC7807 格式', () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        '数据库事务失败',
        '执行数据库事务时发生错误',
        { operation: 'transaction' },
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: 'https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR',
        title: '数据库事务失败',
        detail: '执行数据库事务时发生错误',
        status: 500,
        errorCode: 'INTERNAL_SERVER_ERROR',
        data: { operation: 'transaction' },
      });
    });

    it('应该不在 RFC7807 响应中包含 rootCause', () => {
      // Arrange
      const rootCause = new Error('敏感错误信息');
      const exception = new GeneralInternalServerException(
        '错误',
        '详情',
        undefined,
        rootCause,
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).not.toHaveProperty('rootCause');
    });
  });

  describe('使用场景', () => {
    it('应该处理数据库错误', () => {
      // Arrange
      const dbError = new Error('Connection timeout');

      // Act
      const exception = new GeneralInternalServerException(
        '数据库事务失败',
        '执行数据库事务时发生错误',
        { operation: 'transaction' },
        dbError,
      );

      // Assert
      expect(exception.httpStatus).toBe(500);
      expect(exception.rootCause).toBe(dbError);
      expect(exception.data).toEqual({ operation: 'transaction' });
    });

    it('应该处理外部服务调用失败', () => {
      // Arrange
      const serviceError = new Error('Payment gateway unavailable');

      // Act
      const exception = new GeneralInternalServerException(
        '支付服务异常',
        '调用支付服务时发生错误',
        { amount: 100, provider: 'stripe' },
        serviceError,
      );

      // Assert
      expect(exception.data).toEqual({ amount: 100, provider: 'stripe' });
      expect(exception.rootCause?.message).toBe('Payment gateway unavailable');
    });

    it('应该处理系统资源不足', () => {
      // Arrange
      const memoryUsage = {
        rss: 1024 * 1024 * 1024, // 1GB
        heapTotal: 512 * 1024 * 1024,
        heapUsed: 500 * 1024 * 1024,
      };

      // Act
      const exception = new GeneralInternalServerException(
        '系统资源不足',
        '服务器内存不足，无法处理请求',
        { availableMemory: memoryUsage },
      );

      // Assert
      expect(exception.data).toEqual({ availableMemory: memoryUsage });
    });

    it('应该包装未知错误', () => {
      // Arrange
      const unknownError = new TypeError('Cannot read property of undefined');

      // Act
      const exception = new GeneralInternalServerException(
        '服务器内部错误',
        '处理请求时发生未预期的错误',
        undefined,
        unknownError,
      );

      // Assert
      expect(exception.rootCause).toBe(unknownError);
    });

    it('应该处理 Redis 连接失败', () => {
      // Arrange
      const redisError = new Error('ECONNREFUSED');

      // Act
      const exception = new GeneralInternalServerException(
        'Redis 连接失败',
        '无法连接到 Redis 服务器',
        { host: 'localhost', port: 6379 },
        redisError,
      );

      // Assert
      expect(exception.data).toEqual({ host: 'localhost', port: 6379 });
      expect(exception.rootCause).toBe(redisError);
    });
  });

  describe('安全性', () => {
    it('不应在 data 中包含敏感信息', () => {
      // Arrange
      // 正确：不包含敏感信息
      const safeData = { operation: 'database-query', timestamp: Date.now() };

      // Act
      const exception = new GeneralInternalServerException(
        '错误',
        '详情',
        safeData,
      );

      // Assert
      expect(exception.data).toEqual(safeData);
    });
  });

  describe('NestJS 集成', () => {
    it('应该具有正确的 HTTP 状态码', () => {
      // Act
      const exception = new GeneralInternalServerException('错误', '详情');

      // Assert
      expect(exception.getStatus()).toBe(500);
    });

    it('应该具有正确的异常名称', () => {
      // Act
      const exception = new GeneralInternalServerException('错误', '详情');

      // Assert
      expect(exception.name).toBe('GeneralInternalServerException');
    });
  });
});
