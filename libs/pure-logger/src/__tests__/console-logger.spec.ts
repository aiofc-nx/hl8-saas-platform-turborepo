/**
 * 控制台日志器测试
 */

import { ConsoleLogger, LogLevel } from "../index.js";

describe("ConsoleLogger", () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
  });

  describe("日志级别", () => {
    it("应该正确设置和获取日志级别", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该只输出大于等于当前级别的日志", () => {
      const consoleSpy = jest.spyOn(console, "info");

      logger.setLevel(LogLevel.INFO);
      logger.debug("debug message");
      logger.info("info message");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "info message",
        }),
      );
    });
  });

  describe("日志方法", () => {
    it("应该正确记录调试日志", () => {
      const consoleSpy = jest.spyOn(console, "debug");

      logger.setLevel(LogLevel.DEBUG);
      logger.debug("debug message", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "DEBUG",
          message: "debug message",
          key: "value",
        }),
      );
    });

    it("应该正确记录错误对象", () => {
      const consoleSpy = jest.spyOn(console, "error");
      const error = new Error("test error");

      logger.error(error, { context: "test" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "test error",
          error: {
            name: "Error",
            message: "test error",
            stack: expect.any(String),
          },
          context: "test",
        }),
      );
    });
  });

  describe("子日志器", () => {
    it("应该正确创建子日志器", () => {
      const childLogger = logger.child({ parent: "test" });

      expect(childLogger).toBeInstanceOf(ConsoleLogger);
      expect(childLogger).not.toBe(logger);
    });
  });
});
