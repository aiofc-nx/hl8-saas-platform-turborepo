/**
 * DefaultMessageProvider 单元测试
 */

import { DefaultMessageProvider } from "./default-message.provider.js";

describe("DefaultMessageProvider", () => {
  let provider: DefaultMessageProvider;

  beforeEach(() => {
    provider = new DefaultMessageProvider();
  });

  describe("getMessage()", () => {
    it("应该返回 NOT_FOUND 的 title", () => {
      // Act
      const message = provider.getMessage("NOT_FOUND", "title");

      // Assert
      expect(message).toBe("资源未找到");
    });

    it("应该返回 NOT_FOUND 的 detail", () => {
      // Act
      const message = provider.getMessage("NOT_FOUND", "detail");

      // Assert
      expect(message).toBe("请求的{{resource}}不存在");
    });

    it("应该返回 BAD_REQUEST 的消息", () => {
      // Act
      const title = provider.getMessage("BAD_REQUEST", "title");
      const detail = provider.getMessage("BAD_REQUEST", "detail");

      // Assert
      expect(title).toBe("错误的请求");
      expect(detail).toBe("请求参数不符合要求");
    });

    it("应该返回 INTERNAL_SERVER_ERROR 的消息", () => {
      // Act
      const title = provider.getMessage("INTERNAL_SERVER_ERROR", "title");
      const detail = provider.getMessage("INTERNAL_SERVER_ERROR", "detail");

      // Assert
      expect(title).toBe("服务器内部错误");
      expect(detail).toBe("处理请求时发生未预期的错误");
    });

    it("应该对不存在的错误代码返回 undefined", () => {
      // Act
      const message = provider.getMessage("UNKNOWN_ERROR", "title");

      // Assert
      expect(message).toBeUndefined();
    });

    it("应该替换简单参数", () => {
      // Arrange
      const params = { resource: "用户" };

      // Act
      const message = provider.getMessage("NOT_FOUND", "detail", params);

      // Assert
      expect(message).toBe("请求的用户不存在");
    });

    it("应该替换嵌套参数", () => {
      // Arrange
      // 创建自定义消息来测试嵌套参数
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.CUSTOM = {
        title: "Custom",
        detail: "User {{user.id}} from {{user.department}}",
      };

      const params = {
        user: {
          id: "user-123",
          department: "技术部",
        },
      };

      // Act
      const message = customProvider.getMessage("CUSTOM", "detail", params);

      // Assert
      expect(message).toBe("User user-123 from 技术部");
    });

    it("应该保留不存在的参数占位符", () => {
      // Arrange
      const params = {};

      // Act
      const message = provider.getMessage("NOT_FOUND", "detail", params);

      // Assert
      expect(message).toBe("请求的{{resource}}不存在");
    });

    it("应该处理部分参数缺失", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.MULTI_PARAM = {
        title: "Multi",
        detail: "{{param1}} and {{param2}}",
      };

      const params = { param1: "value1" };

      // Act
      const message = customProvider.getMessage(
        "MULTI_PARAM",
        "detail",
        params,
      );

      // Assert
      expect(message).toBe("value1 and {{param2}}");
    });
  });

  describe("hasMessage()", () => {
    it("应该对存在的消息返回 true", () => {
      // Act & Assert
      expect(provider.hasMessage("NOT_FOUND", "title")).toBe(true);
      expect(provider.hasMessage("NOT_FOUND", "detail")).toBe(true);
      expect(provider.hasMessage("BAD_REQUEST", "title")).toBe(true);
      expect(provider.hasMessage("INTERNAL_SERVER_ERROR", "detail")).toBe(true);
    });

    it("应该对不存在的消息返回 false", () => {
      // Act & Assert
      expect(provider.hasMessage("UNKNOWN_ERROR", "title")).toBe(false);
      expect(provider.hasMessage("UNKNOWN_ERROR", "detail")).toBe(false);
    });
  });

  describe("getAvailableErrorCodes()", () => {
    it("应该返回所有可用的错误代码", () => {
      // Act
      const codes = provider.getAvailableErrorCodes();

      // Assert
      expect(codes).toEqual([
        "NOT_FOUND",
        "BAD_REQUEST",
        "INTERNAL_SERVER_ERROR",
      ]);
    });

    it("返回的数组应包含所有预定义的错误代码", () => {
      // Act
      const codes = provider.getAvailableErrorCodes();

      // Assert
      expect(codes).toContain("NOT_FOUND");
      expect(codes).toContain("BAD_REQUEST");
      expect(codes).toContain("INTERNAL_SERVER_ERROR");
    });
  });

  describe("参数替换", () => {
    it("应该替换多个相同的占位符", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.REPEAT = {
        title: "Repeat",
        detail: "{{value}} and {{value}} again",
      };

      const params = { value: "test" };

      // Act
      const message = customProvider.getMessage("REPEAT", "detail", params);

      // Assert
      expect(message).toBe("test and test again");
    });

    it("应该处理数字参数", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.NUMBER = {
        title: "Number",
        detail: "Count: {{count}}",
      };

      const params = { count: 42 };

      // Act
      const message = customProvider.getMessage("NUMBER", "detail", params);

      // Assert
      expect(message).toBe("Count: 42");
    });

    it("应该处理布尔参数", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.BOOL = {
        title: "Bool",
        detail: "Active: {{active}}",
      };

      const params = { active: true };

      // Act
      const message = customProvider.getMessage("BOOL", "detail", params);

      // Assert
      expect(message).toBe("Active: true");
    });

    it("应该处理 null 和 undefined 参数", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.NULL = {
        title: "Null",
        detail: "Value: {{value}}",
      };

      // Act
      const messageNull = customProvider.getMessage("NULL", "detail", {
        value: null,
      });
      const messageUndefined = customProvider.getMessage("NULL", "detail", {
        value: undefined,
      });

      // Assert
      expect(messageNull).toBe("Value: null");
      expect(messageUndefined).toBe("Value: {{value}}"); // undefined 保留占位符
    });

    it("应该处理嵌套对象中的 null", () => {
      // Arrange
      const customProvider = new DefaultMessageProvider();
      (customProvider as any).messages.NESTED_NULL = {
        title: "Nested",
        detail: "User: {{user.name}}",
      };

      const params = { user: null };

      // Act
      const message = customProvider.getMessage(
        "NESTED_NULL",
        "detail",
        params,
      );

      // Assert
      expect(message).toBe("User: {{user.name}}"); // 应保留占位符
    });
  });
});
