/**
 * GeneralNotFoundException 单元测试
 */

import { AbstractHttpException } from './abstract-http.exception.js';
import { GeneralNotFoundException } from './general-not-found.exception.js';

describe('GeneralNotFoundException', () => {
  describe('构造函数', () => {
    it('应该创建 404 异常实例', () => {
      // Arrange & Act
      const exception = new GeneralNotFoundException(
        '资源未找到',
        '请求的资源不存在',
      );

      // Assert
      expect(exception).toBeInstanceOf(GeneralNotFoundException);
      expect(exception).toBeInstanceOf(AbstractHttpException);
      expect(exception.errorCode).toBe('NOT_FOUND');
      expect(exception.httpStatus).toBe(404);
    });

    it('应该正确设置标题和详情', () => {
      // Arrange
      const title = '用户未找到';
      const detail = 'ID 为 "user-123" 的用户不存在';

      // Act
      const exception = new GeneralNotFoundException(title, detail);

      // Assert
      expect(exception.title).toBe(title);
      expect(exception.detail).toBe(detail);
    });

    it('应该正确设置附加数据', () => {
      // Arrange
      const data = { userId: 'user-123', timestamp: new Date().toISOString() };

      // Act
      const exception = new GeneralNotFoundException(
        '用户未找到',
        '用户不存在',
        data,
      );

      // Assert
      expect(exception.data).toEqual(data);
    });

    it('应该允许不传递附加数据', () => {
      // Act
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Assert
      expect(exception.data).toBeUndefined();
    });
  });

  describe('toRFC7807()', () => {
    it('应该返回正确的 RFC7807 格式', () => {
      // Arrange
      const exception = new GeneralNotFoundException(
        '订单未找到',
        '订单号 "ORD-123" 不存在',
        { orderId: 'ORD-123' },
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: 'https://docs.hl8.com/errors#NOT_FOUND',
        title: '订单未找到',
        detail: '订单号 "ORD-123" 不存在',
        status: 404,
        errorCode: 'NOT_FOUND',
        data: { orderId: 'ORD-123' },
      });
    });
  });

  describe('使用场景', () => {
    it('应该处理数据库资源未找到', () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const exception = new GeneralNotFoundException(
        '用户未找到',
        `ID 为 "${userId}" 的用户不存在`,
        { userId },
      );

      // Assert
      expect(exception.httpStatus).toBe(404);
      expect(exception.data).toEqual({ userId });
    });

    it('应该处理多个资源未找到', () => {
      // Arrange
      const productIds = ['prod-1', 'prod-2', 'prod-3'];

      // Act
      const exception = new GeneralNotFoundException(
        '产品未找到',
        '未找到任何匹配的产品',
        { productIds },
      );

      // Assert
      expect(exception.data).toEqual({ productIds });
    });

    it('应该处理 API 端点不存在', () => {
      // Arrange
      const path = '/api/v1/unknown';

      // Act
      const exception = new GeneralNotFoundException(
        '端点未找到',
        `API 端点 "${path}" 不存在`,
        { path },
      );

      // Assert
      expect(exception.detail).toContain(path);
    });

    it('应该处理文件不存在', () => {
      // Arrange
      const filename = 'document.pdf';

      // Act
      const exception = new GeneralNotFoundException(
        '文件未找到',
        `文件 "${filename}" 不存在或已被删除`,
        { filename },
      );

      // Assert
      expect(exception.data).toEqual({ filename });
    });
  });

  describe('NestJS 集成', () => {
    it('应该具有正确的 HTTP 状态码', () => {
      // Act
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Assert
      expect(exception.getStatus()).toBe(404);
    });

    it('应该具有正确的异常名称', () => {
      // Act
      const exception = new GeneralNotFoundException('未找到', '详情');

      // Assert
      expect(exception.name).toBe('GeneralNotFoundException');
    });
  });
});
