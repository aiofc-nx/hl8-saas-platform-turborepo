/**
 * 应用异常单元测试
 *
 * @description 测试应用异常的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect } from "@jest/globals";
import { ApplicationException } from "./application.exception.js";

describe("ApplicationException", () => {
  describe("构造函数", () => {
    it("应该正确创建应用异常", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        { field: "test", value: "test-value" },
      );

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("TEST_ERROR");
      expect(exception.message).toBe("测试错误");
      expect(exception.userMessage).toBe("这是一个测试错误");
      expect(exception.statusCode).toBe(500);
      expect(exception.context).toEqual({ field: "test", value: "test-value" });
    });

    it("应该提供默认状态码", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception.statusCode).toBe(500);
    });

    it("应该提供默认上下文", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception.context).toEqual({});
    });

    it("应该提供默认用户消息", () => {
      const exception = new ApplicationException("TEST_ERROR", "测试错误");

      expect(exception.userMessage).toBe("测试错误");
    });
  });

  describe("错误代码", () => {
    it("应该正确设置错误代码", () => {
      const exception = new ApplicationException(
        "VALIDATION_ERROR",
        "验证错误",
        "数据验证失败",
      );

      expect(exception.errorCode).toBe("VALIDATION_ERROR");
    });

    it("应该处理空错误代码", () => {
      const exception = new ApplicationException(
        "",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception.errorCode).toBe("");
    });
  });

  describe("消息处理", () => {
    it("应该正确设置技术消息", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "技术错误消息",
        "用户友好的错误消息",
      );

      expect(exception.message).toBe("技术错误消息");
    });

    it("应该正确设置用户消息", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "技术错误消息",
        "用户友好的错误消息",
      );

      expect(exception.userMessage).toBe("用户友好的错误消息");
    });

    it("应该处理空消息", () => {
      const exception = new ApplicationException("TEST_ERROR", "", "");

      expect(exception.message).toBe("");
      expect(exception.userMessage).toBe("");
    });
  });

  describe("状态码", () => {
    it("应该正确设置状态码", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        400,
      );

      expect(exception.statusCode).toBe(400);
    });

    it("应该处理无效状态码", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        -1,
      );

      expect(exception.statusCode).toBe(-1);
    });
  });

  describe("上下文", () => {
    it("应该正确设置上下文", () => {
      const context = {
        userId: "user123",
        operation: "create",
        resource: "user",
      };
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        context,
      );

      expect(exception.context).toEqual(context);
    });

    it("应该处理空上下文", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        {},
      );

      expect(exception.context).toEqual({});
    });

    it("应该处理复杂上下文", () => {
      const context = {
        userId: "user123",
        operation: "create",
        resource: "user",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "api",
        },
        errors: [
          { field: "email", message: "邮箱格式无效" },
          { field: "password", message: "密码长度不足" },
        ],
      };
      const exception = new ApplicationException(
        "VALIDATION_ERROR",
        "验证错误",
        "数据验证失败",
        400,
        context,
      );

      expect(exception.context).toEqual(context);
    });
  });

  describe("继承关系", () => {
    it("应该继承自Error", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(ApplicationException);
    });

    it("应该具有Error的所有属性", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception.name).toBe("ApplicationException");
      expect(exception.message).toBe("测试错误");
      expect(exception.stack).toBeDefined();
    });
  });

  describe("序列化", () => {
    it("应该正确序列化异常", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        { field: "test", value: "test-value" },
      );

      const serialized = JSON.stringify(exception);
      const parsed = JSON.parse(serialized);

      expect(parsed.errorCode).toBe("TEST_ERROR");
      expect(parsed.message).toBe("测试错误");
      expect(parsed.userMessage).toBe("这是一个测试错误");
      expect(parsed.statusCode).toBe(500);
      expect(parsed.context).toEqual({ field: "test", value: "test-value" });
    });

    it("应该处理循环引用", () => {
      const context: any = { field: "test" };
      context.self = context; // 创建循环引用

      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        context,
      );

      // 序列化应该不会抛出错误
      expect(() => JSON.stringify(exception)).not.toThrow();
    });
  });

  describe("堆栈跟踪", () => {
    it("应该保留堆栈跟踪", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
      );

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("ApplicationException");
    });

    it("应该包含调用位置信息", () => {
      function createException() {
        return new ApplicationException(
          "TEST_ERROR",
          "测试错误",
          "这是一个测试错误",
        );
      }

      const exception = createException();
      expect(exception.stack).toContain("createException");
    });
  });

  describe("toString方法", () => {
    it("应该正确转换为字符串", () => {
      const exception = new ApplicationException(
        "TEST_ERROR",
        "测试错误",
        "这是一个测试错误",
        500,
        { field: "test" },
      );

      const stringRepresentation = exception.toString();
      expect(stringRepresentation).toContain("ApplicationException");
      expect(stringRepresentation).toContain("TEST_ERROR");
      expect(stringRepresentation).toContain("测试错误");
    });
  });

  describe("错误比较", () => {
    it("应该正确比较相同错误代码的异常", () => {
      const exception1 = new ApplicationException(
        "TEST_ERROR",
        "测试错误1",
        "用户消息1",
      );
      const exception2 = new ApplicationException(
        "TEST_ERROR",
        "测试错误2",
        "用户消息2",
      );

      expect(exception1.errorCode).toBe(exception2.errorCode);
    });

    it("应该正确比较不同错误代码的异常", () => {
      const exception1 = new ApplicationException(
        "ERROR_1",
        "测试错误1",
        "用户消息1",
      );
      const exception2 = new ApplicationException(
        "ERROR_2",
        "测试错误2",
        "用户消息2",
      );

      expect(exception1.errorCode).not.toBe(exception2.errorCode);
    });
  });
});
