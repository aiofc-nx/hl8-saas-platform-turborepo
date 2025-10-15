/**
 * 结构化日志器测试
 */

import { StructuredLogger, LogLevel } from "../index.js";

describe("StructuredLogger", () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
  });

  describe("日志级别", () => {
    it("应该正确设置和获取日志级别", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该只输出大于等于当前级别的日志", () => {
      const consoleSpy = jest.spyOn(console, "log");

      logger.setLevel(LogLevel.INFO);
      logger.debug("debug message");
      logger.info("info message");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("结构化日志", () => {
    it("应该输出 JSON 格式的日志", () => {
      const consoleSpy = jest.spyOn(console, "log");

      logger.info("test message", { userId: "123", action: "create" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"timestamp":".*"/),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"level":"info"/),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"message":"test message"/),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"userId":"123"/),
      );
    });

    it("应该处理复杂对象", () => {
      const consoleSpy = jest.spyOn(console, "log");

      const complexData = {
        user: { id: "123", name: "John" },
        metadata: { source: "api", version: "1.0" },
      };

      logger.info("complex data", complexData);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.user).toEqual({ id: "123", name: "John" });
      expect(logData.metadata).toEqual({ source: "api", version: "1.0" });
    });
  });

  describe("错误日志", () => {
    it("应该正确处理错误对象", () => {
      const consoleSpy = jest.spyOn(console, "error");
      const error = new Error("test error");

      logger.error(error, { context: "test" });

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.error.name).toBe("Error");
      expect(logData.error.message).toBe("test error");
      expect(logData.error.stack).toBeDefined();
      expect(logData.context).toBe("test");
    });
  });

  describe("字段截断", () => {
    it("应该截断过长的字段", () => {
      const longString = "a".repeat(2000);
      const consoleSpy = jest.spyOn(console, "log");

      logger.info("long field", { longField: longString });

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.longField.length).toBeLessThan(1100); // 1000 + "..."
      expect(logData.longField).toEndWith("...");
    });
  });

  describe("子日志器", () => {
    it("应该正确创建子日志器", () => {
      const childLogger = logger.child({ parent: "test" });

      expect(childLogger).toBeInstanceOf(StructuredLogger);
      expect(childLogger).not.toBe(logger);
    });

    it("子日志器应该继承父日志器的上下文", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const childLogger = logger.child({ inherited: "value" });

      childLogger.info("child message", { child: "data" });

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.inherited).toBe("value");
      expect(logData.child).toBe("data");
    });
  });

  describe("采样率", () => {
    it("应该根据采样率过滤日志", () => {
      const loggerWithSampling = new StructuredLogger(
        LogLevel.DEBUG,
        {},
        { sampling: 0.5 },
      );
      const consoleSpy = jest.spyOn(console, "log");

      // 多次调用，应该只有部分被记录
      for (let i = 0; i < 10; i++) {
        loggerWithSampling.info(`message ${i}`);
      }

      // 由于采样率是 0.5，期望记录次数在合理范围内
      expect(consoleSpy.mock.calls.length).toBeGreaterThan(0);
      expect(consoleSpy.mock.calls.length).toBeLessThan(10);
    });
  });
});
