/**
 * 边界情况和异常情况测试
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

import {
  ConsoleLogger,
  NoOpLogger,
  StructuredLogger,
  LoggerFactory,
  LoggerType,
  LogLevel,
  createLogger,
  createDomainLogger,
  createProductionLogger,
} from "../index";

describe("边界情况和异常情况测试", () => {
  describe("ConsoleLogger 边界情况", () => {
    let logger: ConsoleLogger;
    let consoleSpy: {
      log: jest.SpyInstance;
      debug: jest.SpyInstance;
      info: jest.SpyInstance;
      warn: jest.SpyInstance;
      error: jest.SpyInstance;
    };

    beforeEach(() => {
      logger = new ConsoleLogger();
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

    it("应该处理 null 和 undefined 消息", () => {
      expect(() => {
        logger.debug(null as any);
        logger.info(undefined as any);
        logger.warn(null as any);
        logger.error(undefined as any);
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

    it("应该处理数字消息", () => {
      expect(() => {
        logger.debug(123 as any);
        logger.info(456 as any);
        logger.warn(789 as any);
        logger.error(0 as any);
      }).not.toThrow();
    });

    it("应该处理布尔值消息", () => {
      expect(() => {
        logger.debug(true as any);
        logger.info(false as any);
        logger.warn(true as any);
        logger.error(false as any);
      }).not.toThrow();
    });

    it("应该处理对象消息", () => {
      const obj = { message: "test", value: 123 };
      
      expect(() => {
        logger.debug(obj as any);
        logger.info(obj as any);
        logger.warn(obj as any);
        logger.error(obj as any);
      }).not.toThrow();
    });

    it("应该处理函数消息", () => {
      const func = () => "test";
      
      expect(() => {
        logger.debug(func as any);
        logger.info(func as any);
        logger.warn(func as any);
        logger.error(func as any);
      }).not.toThrow();
    });

    it("应该处理 Symbol 消息", () => {
      const sym = Symbol("test");
      
      expect(() => {
        logger.debug(sym as any);
        logger.info(sym as any);
        logger.warn(sym as any);
        logger.error(sym as any);
      }).not.toThrow();
    });

    it("应该处理循环引用上下文", () => {
      const circularContext: any = { name: "test" };
      circularContext.self = circularContext;

      expect(() => {
        logger.debug("test", circularContext);
      }).not.toThrow();
    });

    it("应该处理非常大的上下文对象", () => {
      const largeContext: Record<string, unknown> = {};
      for (let i = 0; i < 10000; i++) {
        largeContext[`key${i}`] = `value${i}`;
      }

      expect(() => {
        logger.debug("large context", largeContext);
      }).not.toThrow();
    });

    it("应该处理嵌套很深的上下文对象", () => {
      let deepContext: any = {};
      let current = deepContext;
      
      for (let i = 0; i < 100; i++) {
        current[`level${i}`] = {};
        current = current[`level${i}`];
      }
      current.final = "value";

      expect(() => {
        logger.debug("deep context", deepContext);
      }).not.toThrow();
    });

    it("应该处理包含特殊字符的上下文", () => {
      const specialContext = {
        unicode: "测试中文 🚀",
        newline: "line1\nline2",
        tab: "col1\tcol2",
        quote: 'quote "test"',
        backslash: "path\\to\\file",
        nullValue: null,
        undefinedValue: undefined,
      };

      expect(() => {
        logger.debug("special chars", specialContext);
      }).not.toThrow();
    });
  });

  describe("StructuredLogger 边界情况", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = new StructuredLogger();
    });

    it("应该处理字段截断边界值", () => {
      const config = { maxFieldLength: 10 };
      const structuredLogger = new StructuredLogger(LogLevel.DEBUG, {}, config);
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // 测试边界值
      structuredLogger.info("test", { short: "123", exact: "1234567890", long: "123456789012345" });

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.short).toBe("123");
      expect(logData.exact).toBe("1234567890");
      expect(logData.long).toBe("1234567890...");

      consoleSpy.mockRestore();
    });

    it("应该处理采样率边界值", () => {
      const testCases = [
        { sampling: 0, expected: 0 },
        { sampling: 0.5, minExpected: 0, maxExpected: 10 },
        { sampling: 1.0, expected: 10 },
      ];

      testCases.forEach(({ sampling, expected, minExpected, maxExpected }) => {
        const logger = new StructuredLogger(LogLevel.DEBUG, {}, { sampling });
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        // 执行多次日志调用
        for (let i = 0; i < 10; i++) {
          logger.info(`message ${i}`);
        }

        const callCount = consoleSpy.mock.calls.length;

        if (expected !== undefined) {
          expect(callCount).toBe(expected);
        } else {
          expect(callCount).toBeGreaterThanOrEqual(minExpected);
          expect(callCount).toBeLessThanOrEqual(maxExpected);
        }

        consoleSpy.mockRestore();
      });
    });

    it("应该处理 JSON 序列化异常", () => {
      const problematicContext = {
        circular: (() => {
          const obj: any = { name: "test" };
          obj.self = obj;
          return obj;
        })(),
        bigint: BigInt(123),
        symbol: Symbol("test"),
      };

      // 结构化日志器应该能够处理 JSON 序列化异常
      expect(() => {
        logger.info("problematic context", problematicContext);
      }).not.toThrow();
    });

    it("应该处理非 JSON 格式输出", () => {
      const nonJsonLogger = new StructuredLogger(LogLevel.DEBUG, {}, { json: false });
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      nonJsonLogger.info("test message", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: test message/)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("LoggerFactory 边界情况", () => {
    it("应该处理无效的日志类型", () => {
      expect(() => {
        LoggerFactory.create({ type: "invalid" as LoggerType });
      }).toThrow("Unsupported logger type: invalid");
    });

    it("应该处理 undefined 环境变量", () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(ConsoleLogger);

      process.env.NODE_ENV = originalEnv;
    });

    it("应该处理空字符串环境变量", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "";

      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(ConsoleLogger);

      process.env.NODE_ENV = originalEnv;
    });

    it("应该处理特殊环境变量值", () => {
      const originalEnv = process.env.NODE_ENV;
      
      const specialValues = ["staging", "preview", "development-test", "production-staging"];
      
      specialValues.forEach(env => {
        process.env.NODE_ENV = env;
        const logger = LoggerFactory.create();
        expect(logger).toBeInstanceOf(ConsoleLogger);
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("便捷方法边界情况", () => {
    it("应该处理空字符串领域名称", () => {
      const logger = createDomainLogger("");
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该处理特殊字符领域名称", () => {
      const specialNames = [
        "domain-with-dashes",
        "domain_with_underscores",
        "domain.with.dots",
        "domain123",
        "DomainWithCamelCase",
        "domain-with-123-numbers",
        "domain_with_special@chars",
      ];

      specialNames.forEach(name => {
        const logger = createDomainLogger(name);
        expect(logger).toBeInstanceOf(ConsoleLogger);
      });
    });

    it("应该处理 null 和 undefined 上下文", () => {
      expect(() => {
        createLogger(null as any);
        createLogger(undefined as any);
        createProductionLogger(null as any);
        createProductionLogger(undefined as any);
      }).not.toThrow();
    });

    it("应该处理空对象上下文", () => {
      expect(() => {
        createLogger({});
        createProductionLogger({});
      }).not.toThrow();
    });
  });

  describe("内存和性能边界情况", () => {
    it("应该处理大量日志器创建", () => {
      const startTime = Date.now();
      const loggers = [];

      // 创建大量日志器实例
      for (let i = 0; i < 10000; i++) {
        loggers.push(createLogger({ index: i }));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(loggers).toHaveLength(10000);
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成

      // 验证所有日志器都是有效的
      loggers.forEach((logger, index) => {
        expect(logger).toBeInstanceOf(ConsoleLogger);
        expect(logger.getLevel()).toBe(LogLevel.INFO);
      });
    });

    it("应该处理大量子日志器创建", () => {
      const parentLogger = createLogger({ parent: "test" });
      const childLoggers = [];

      // 创建大量子日志器
      for (let i = 0; i < 1000; i++) {
        childLoggers.push(parentLogger.child({ child: i }));
      }

      expect(childLoggers).toHaveLength(1000);
      
      // 验证所有子日志器都是有效的
      childLoggers.forEach((childLogger, index) => {
        expect(childLogger).toBeInstanceOf(ConsoleLogger);
        expect(childLogger).not.toBe(parentLogger);
      });
    });

    it("应该处理并发日志调用", async () => {
      const logger = createLogger({ concurrent: "test" });
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      // 并发执行日志调用
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(logger.info(`concurrent message ${i}`, { index: i }))
      );

      await Promise.all(promises);

      expect(consoleSpy).toHaveBeenCalledTimes(100);
      consoleSpy.mockRestore();
    });
  });

  describe("错误处理边界情况", () => {
    it("应该处理 Error 对象的边界情况", () => {
      const logger = new ConsoleLogger();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const errorCases = [
        new Error("normal error"),
        new Error(""),
        new Error(null as any),
        new Error(undefined as any),
        Object.assign(new Error("custom"), { customProp: "value" }),
      ];

      errorCases.forEach(error => {
        expect(() => {
          logger.error(error);
        }).not.toThrow();
      });

      consoleSpy.mockRestore();
    });

    it("应该处理自定义错误类型", () => {
      class CustomError extends Error {
        constructor(message: string, public code: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const logger = new ConsoleLogger();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const customError = new CustomError("custom error", "CUSTOM_001");
      
      expect(() => {
        logger.error(customError);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("类型边界情况", () => {
    it("应该处理类型强制转换", () => {
      const logger = new ConsoleLogger();
      
      // 这些调用不应该在运行时抛出异常
      expect(() => {
        logger.debug("test" as any);
        logger.info(123 as any);
        logger.warn(true as any);
        logger.error({} as any);
      }).not.toThrow();
    });

    it("应该处理接口实现边界", () => {
      // 验证所有日志器都正确实现了 IPureLogger 接口
      const loggers = [
        new ConsoleLogger(),
        new NoOpLogger(),
        new StructuredLogger(),
        createLogger(),
        createDomainLogger("test"),
        createProductionLogger(),
      ];

      loggers.forEach(logger => {
        expect(typeof logger.debug).toBe("function");
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.child).toBe("function");
        expect(typeof logger.setLevel).toBe("function");
        expect(typeof logger.getLevel).toBe("function");
      });
    });
  });
});
