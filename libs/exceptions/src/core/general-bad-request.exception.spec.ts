/**
 * GeneralBadRequestException 单元测试
 */

import { AbstractHttpException } from "./abstract-http.exception.js";
import { GeneralBadRequestException } from "./general-bad-request.exception.js";

describe("GeneralBadRequestException", () => {
  describe("构造函数", () => {
    it("应该创建 400 异常实例", () => {
      // Arrange & Act
      const exception = new GeneralBadRequestException(
        "错误请求",
        "请求参数不合法",
      );

      // Assert
      expect(exception).toBeInstanceOf(GeneralBadRequestException);
      expect(exception).toBeInstanceOf(AbstractHttpException);
      expect(exception.errorCode).toBe("BAD_REQUEST");
      expect(exception.httpStatus).toBe(400);
    });

    it("应该正确设置标题和详情", () => {
      // Arrange
      const title = "参数验证失败";
      const detail = "邮箱地址格式不正确";

      // Act
      const exception = new GeneralBadRequestException(title, detail);

      // Assert
      expect(exception.title).toBe(title);
      expect(exception.detail).toBe(detail);
    });

    it("应该正确设置附加数据", () => {
      // Arrange
      const data = { field: "email", value: "invalid-email" };

      // Act
      const exception = new GeneralBadRequestException(
        "验证失败",
        "格式错误",
        data,
      );

      // Assert
      expect(exception.data).toEqual(data);
    });
  });

  describe("toRFC7807()", () => {
    it("应该返回正确的 RFC7807 格式", () => {
      // Arrange
      const exception = new GeneralBadRequestException(
        "邮箱格式错误",
        '邮箱地址 "test@" 格式不正确',
        { email: "test@", expectedFormat: "user@example.com" },
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#BAD_REQUEST",
        title: "邮箱格式错误",
        detail: '邮箱地址 "test@" 格式不正确',
        status: 400,
        errorCode: "BAD_REQUEST",
        data: { email: "test@", expectedFormat: "user@example.com" },
      });
    });
  });

  describe("使用场景", () => {
    it("应该处理参数验证失败", () => {
      // Arrange
      const email = "invalid-email";

      // Act
      const exception = new GeneralBadRequestException(
        "邮箱格式错误",
        `邮箱地址 "${email}" 格式不正确`,
        { email, expectedFormat: "user@example.com" },
      );

      // Assert
      expect(exception.httpStatus).toBe(400);
      expect(exception.data).toEqual({
        email,
        expectedFormat: "user@example.com",
      });
    });

    it("应该处理业务规则校验失败", () => {
      // Arrange
      const quantity = 100;
      const stock = 50;

      // Act
      const exception = new GeneralBadRequestException(
        "库存不足",
        `请求数量 ${quantity} 超过可用库存 ${stock}`,
        { requestedQuantity: quantity, availableStock: stock },
      );

      // Assert
      expect(exception.data).toEqual({
        requestedQuantity: quantity,
        availableStock: stock,
      });
    });

    it("应该处理状态冲突", () => {
      // Arrange
      const orderId = "order-123";
      const currentStatus = "CANCELLED";

      // Act
      const exception = new GeneralBadRequestException(
        "订单已取消",
        "无法修改已取消的订单",
        { orderId, currentStatus },
      );

      // Assert
      expect(exception.data).toEqual({ orderId, currentStatus });
    });

    it("应该处理批量验证失败", () => {
      // Arrange
      const errors = [
        { field: "name", message: "姓名不能为空" },
        { field: "age", message: "年龄必须大于 0" },
      ];

      // Act
      const exception = new GeneralBadRequestException(
        "用户数据验证失败",
        "请求数据包含多个错误",
        { validationErrors: errors },
      );

      // Assert
      expect(exception.data).toEqual({ validationErrors: errors });
    });

    it("应该处理日期范围错误", () => {
      // Arrange
      const startDate = "2025-01-01";
      const endDate = "2024-12-31";

      // Act
      const exception = new GeneralBadRequestException(
        "日期范围错误",
        `结束日期 ${endDate} 不能早于开始日期 ${startDate}`,
        { startDate, endDate },
      );

      // Assert
      expect(exception.detail).toContain(startDate);
      expect(exception.detail).toContain(endDate);
    });
  });

  describe("NestJS 集成", () => {
    it("应该具有正确的 HTTP 状态码", () => {
      // Act
      const exception = new GeneralBadRequestException("错误", "详情");

      // Assert
      expect(exception.getStatus()).toBe(400);
    });

    it("应该具有正确的异常名称", () => {
      // Act
      const exception = new GeneralBadRequestException("错误", "详情");

      // Assert
      expect(exception.name).toBe("GeneralBadRequestException");
    });
  });
});
