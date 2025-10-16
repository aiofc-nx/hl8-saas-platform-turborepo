/**
 * 空操作日志器测试
 */

// 设置测试环境
beforeAll(() => {
  process.env.NODE_ENV = "test";
});

// 全局测试工具
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

import { NoOpLogger, LogLevel } from "../index";

describe("NoOpLogger", () => {
  let logger: NoOpLogger;

  beforeEach(() => {
    logger = new NoOpLogger();
  });

  describe("构造函数", () => {
    it("应该使用默认日志级别 ERROR", () => {
      const defaultLogger = new NoOpLogger();
      expect(defaultLogger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该使用指定的日志级别", () => {
      const customLogger = new NoOpLogger(LogLevel.INFO);
      expect(customLogger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用默认上下文", () => {
      const defaultLogger = new NoOpLogger(LogLevel.DEBUG);
      expect(defaultLogger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该使用指定的默认上下文", () => {
      const context = { module: "test", version: "1.0.0" };
      const customLogger = new NoOpLogger(LogLevel.INFO, context);
      expect(customLogger.getLevel()).toBe(LogLevel.INFO);
    });
  });

  describe("日志级别管理", () => {
    it("应该正确设置日志级别", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      logger.setLevel(LogLevel.INFO);
      expect(logger.getLevel()).toBe(LogLevel.INFO);

      logger.setLevel(LogLevel.WARN);
      expect(logger.getLevel()).toBe(LogLevel.WARN);

      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该正确获取当前日志级别", () => {
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
      
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe("日志方法 - 空操作验证", () => {
    let consoleSpy: {
      log: jest.SpyInstance;
      debug: jest.SpyInstance;
      info: jest.SpyInstance;
      warn: jest.SpyInstance;
      error: jest.SpyInstance;
    };

    beforeEach(() => {
      consoleSpy = {
        log: jest.spyOn(console, "log").mockImplementation(),
        debug: jest.spyOn(console, "debug").mockImplementation(),
        info: jest.spyOn(console, "info").mockImplementation(),
        warn: jest.spyOn(console, "warn").mockImplementation(),
        error: jest.spyOn(console, "error").mockImplementation(),
      };
    });

    afterEach(() => {
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it("debug 方法应该是空操作", () => {
      logger.debug("debug message", { key: "value" });
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("info 方法应该是空操作", () => {
      logger.info("info message", { key: "value" });
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("warn 方法应该是空操作", () => {
      logger.warn("warn message", { key: "value" });
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("error 方法（字符串）应该是空操作", () => {
      logger.error("error message", { key: "value" });
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("error 方法（Error 对象）应该是空操作", () => {
      const error = new Error("test error");
      logger.error(error, { key: "value" });
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("应该处理所有参数类型而不抛出异常", () => {
      const testCases = [
        ["simple string", undefined],
        ["string with context", { key: "value" }],
        [new Error("test error"), undefined],
        [new Error("test error with context"), { context: "test" }],
        ["", {}],
        [null as any, undefined],
        [undefined as any, undefined],
      ];

      testCases.forEach(([message, context]) => {
        expect(() => {
          logger.debug(message as any, context);
          logger.info(message as any, context);
          logger.warn(message as any, context);
          logger.error(message as any, context);
        }).not.toThrow();
      });
    });
  });

  describe("子日志器创建", () => {
    it("应该正确创建子日志器", () => {
      const childContext = { parent: "test", operation: "validate" };
      const childLogger = logger.child(childContext);

      expect(childLogger).toBeInstanceOf(NoOpLogger);
      expect(childLogger).not.toBe(logger);
    });

    it("子日志器应该继承父日志器的日志级别", () => {
      logger.setLevel(LogLevel.DEBUG);
      const childLogger = logger.child({ test: "value" });

      expect(childLogger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("子日志器应该独立设置日志级别", () => {
      const childLogger = logger.child({ test: "value" });
      
      childLogger.setLevel(LogLevel.INFO);
      
      expect(childLogger.getLevel()).toBe(LogLevel.INFO);
      expect(logger.getLevel()).toBe(LogLevel.ERROR); // 父日志器不受影响
    });

    it("子日志器也应该是空操作", () => {
      const childLogger = logger.child({ test: "value" });
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      childLogger.debug("child debug");
      childLogger.info("child info");
      childLogger.warn("child warn");
      childLogger.error("child error");

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("性能测试", () => {
    it("应该具有高性能（大量调用不应有明显延迟）", () => {
      const startTime = Date.now();
      
      // 执行大量日志调用
      for (let i = 0; i < 10000; i++) {
        logger.debug(`debug message ${i}`, { index: i });
        logger.info(`info message ${i}`, { index: i });
        logger.warn(`warn message ${i}`, { index: i });
        logger.error(`error message ${i}`, { index: i });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 应该在合理时间内完成（这里设置为 100ms）
      expect(duration).toBeLessThan(100);
    });

    it("应该处理复杂上下文对象", () => {
      const complexContext = {
        user: { id: "123", name: "John Doe", email: "john@example.com" },
        metadata: { source: "api", version: "1.0.0", timestamp: new Date() },
        array: [1, 2, 3, { nested: "value" }],
        deep: { level1: { level2: { level3: "deep value" } } },
      };

      expect(() => {
        logger.debug("complex context test", complexContext);
        logger.info("complex context test", complexContext);
        logger.warn("complex context test", complexContext);
        logger.error("complex context test", complexContext);
      }).not.toThrow();
    });
  });

  describe("边界情况", () => {
    it("应该处理 undefined 和 null 消息", () => {
      expect(() => {
        logger.debug(undefined as any);
        logger.info(null as any);
        logger.warn(undefined as any);
        logger.error(null as any);
      }).not.toThrow();
    });

    it("应该处理空字符串消息", () => {
      expect(() => {
        logger.debug("");
        logger.info("");
        logger.warn("");
        logger.error("");
      }).not.toThrow();
    });

    it("应该处理非常大的上下文对象", () => {
      const largeContext: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        largeContext[`key${i}`] = `value${i}`;
      }

      expect(() => {
        logger.debug("large context test", largeContext);
      }).not.toThrow();
    });

    it("应该处理循环引用对象", () => {
      const circularContext: any = { name: "test" };
      circularContext.self = circularContext;

      expect(() => {
        logger.debug("circular reference test", circularContext);
      }).not.toThrow();
    });
  });

  describe("类型安全", () => {
    it("应该保持类型安全", () => {
      // 这些调用应该在 TypeScript 编译时通过类型检查
      logger.debug("string message");
      logger.debug("string message", { context: "value" });
      
      logger.info("string message");
      logger.info("string message", { context: "value" });
      
      logger.warn("string message");
      logger.warn("string message", { context: "value" });
      
      logger.error("string message");
      logger.error("string message", { context: "value" });
      
      const error = new Error("test error");
      logger.error(error);
      logger.error(error, { context: "value" });
    });
  });
});
