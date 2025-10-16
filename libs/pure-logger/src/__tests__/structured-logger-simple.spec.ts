/**
 * 结构化日志器简化测试
 */

import { StructuredLogger, LogLevel } from "../index";

describe("StructuredLogger 简化测试", () => {
  let logger: StructuredLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new StructuredLogger();
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("基本功能", () => {
    it("应该正确设置和获取日志级别", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该输出 JSON 格式的日志", () => {
      logger.info("test message", { userId: "123" });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe("info");
      expect(logData.message).toBe("test message");
      expect(logData.userId).toBe("123");
      expect(logData.timestamp).toBeDefined();
    });

    it("应该创建子日志器", () => {
      const childLogger = logger.child({ parent: "test" });
      expect(childLogger).toBeInstanceOf(StructuredLogger);
      expect(childLogger).not.toBe(logger);
    });
  });

  describe("错误处理", () => {
    it("应该正确处理错误对象", () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("test error");

      logger.error(error, { context: "test" });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logCall = errorSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe("error");
      expect(logData.message).toBe("test error");
      expect(logData.error.name).toBe("Error");
      expect(logData.error.message).toBe("test error");
      expect(logData.context).toBe("test");

      errorSpy.mockRestore();
    });
  });

  describe("配置选项", () => {
    it("应该支持非 JSON 格式输出", () => {
      const nonJsonLogger = new StructuredLogger(
        LogLevel.INFO,
        {},
        { json: false },
      );
      const infoSpy = jest.spyOn(console, "info").mockImplementation();

      nonJsonLogger.info("test message");

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const logCall = infoSpy.mock.calls[0][0];

      expect(logCall).toMatch(/\[.*\] INFO: test message/);

      infoSpy.mockRestore();
    });

    it("应该支持字段截断", () => {
      const loggerWithTruncation = new StructuredLogger(
        LogLevel.INFO,
        {},
        { maxFieldLength: 10 },
      );
      const longString = "a".repeat(20);

      loggerWithTruncation.info("test", { longField: longString });

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.longField).toHaveLength(13); // 10 + "..."
      expect(logData.longField.endsWith("...")).toBe(true);
    });
  });
});
