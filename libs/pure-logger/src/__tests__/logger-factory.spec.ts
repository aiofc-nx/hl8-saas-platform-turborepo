/**
 * 日志工厂测试
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
  LoggerFactory,
  LoggerType,
  LogLevel,
  ConsoleLogger,
  NoOpLogger,
  StructuredLogger,
  type LoggerConfig,
} from "../index";

describe("LoggerFactory", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    // 保存原始环境变量
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // 恢复原始环境变量
    process.env.NODE_ENV = originalEnv;
  });

  describe("create 方法", () => {
    it("应该使用默认配置创建日志器", () => {
      process.env.NODE_ENV = "development";
      const logger = LoggerFactory.create();

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该创建控制台日志器", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        level: LogLevel.DEBUG,
        defaultContext: { module: "test" },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该创建空操作日志器", () => {
      const config: LoggerConfig = {
        type: LoggerType.NOOP,
        level: LogLevel.ERROR,
        defaultContext: { module: "test" },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该创建结构化日志器", () => {
      const config: LoggerConfig = {
        type: LoggerType.STRUCTURED,
        level: LogLevel.INFO,
        defaultContext: { module: "test" },
        structuredConfig: {
          json: true,
          colors: false,
          sampling: 0.5,
          maxFieldLength: 500,
        },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用默认日志级别", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
      };

      const logger = LoggerFactory.create(config);

      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用默认上下文", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        defaultContext: { module: "test", version: "1.0.0" },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该抛出错误对于不支持的日志类型", () => {
      const config: LoggerConfig = {
        type: "unsupported" as LoggerType,
      };

      expect(() => {
        LoggerFactory.create(config);
      }).toThrow("Unsupported logger type: unsupported");
    });
  });

  describe("环境适配", () => {
    it("开发环境应该使用控制台日志器", () => {
      process.env.NODE_ENV = "development";
      const logger = LoggerFactory.create();

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("生产环境应该使用空操作日志器", () => {
      process.env.NODE_ENV = "production";
      const logger = LoggerFactory.create();

      expect(logger).toBeInstanceOf(NoOpLogger);
    });

    it("测试环境应该使用空操作日志器", () => {
      process.env.NODE_ENV = "test";
      const logger = LoggerFactory.create();

      expect(logger).toBeInstanceOf(NoOpLogger);
    });

    it("未定义环境应该使用控制台日志器", () => {
      delete process.env.NODE_ENV;
      const logger = LoggerFactory.create();

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("createConsoleLogger 方法", () => {
    it("应该创建控制台日志器", () => {
      const logger = LoggerFactory.createConsoleLogger();

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的日志级别", () => {
      const logger = LoggerFactory.createConsoleLogger(LogLevel.DEBUG);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该使用指定的默认上下文", () => {
      const defaultContext = { module: "test", version: "1.0.0" };
      const logger = LoggerFactory.createConsoleLogger(
        LogLevel.INFO,
        defaultContext,
      );

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该支持所有日志级别", () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
      ];

      levels.forEach((level) => {
        const logger = LoggerFactory.createConsoleLogger(level);
        expect(logger.getLevel()).toBe(level);
      });
    });
  });

  describe("createNoOpLogger 方法", () => {
    it("应该创建空操作日志器", () => {
      const logger = LoggerFactory.createNoOpLogger();

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该使用指定的日志级别", () => {
      const logger = LoggerFactory.createNoOpLogger(LogLevel.INFO);

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的默认上下文", () => {
      const defaultContext = { module: "test", version: "1.0.0" };
      const logger = LoggerFactory.createNoOpLogger(
        LogLevel.INFO,
        defaultContext,
      );

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该支持所有日志级别", () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
      ];

      levels.forEach((level) => {
        const logger = LoggerFactory.createNoOpLogger(level);
        expect(logger.getLevel()).toBe(level);
      });
    });
  });

  describe("createStructuredLogger 方法", () => {
    it("应该创建结构化日志器", () => {
      const logger = LoggerFactory.createStructuredLogger();

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的日志级别", () => {
      const logger = LoggerFactory.createStructuredLogger(LogLevel.DEBUG);

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该使用指定的默认上下文", () => {
      const defaultContext = { module: "test", version: "1.0.0" };
      const logger = LoggerFactory.createStructuredLogger(
        LogLevel.INFO,
        defaultContext,
      );

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的结构化配置", () => {
      const config = {
        json: false,
        colors: true,
        sampling: 0.8,
        maxFieldLength: 200,
      };

      const logger = LoggerFactory.createStructuredLogger(
        LogLevel.INFO,
        {},
        config,
      );

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用默认结构化配置", () => {
      const logger = LoggerFactory.createStructuredLogger();

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该支持所有日志级别", () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
      ];

      levels.forEach((level) => {
        const logger = LoggerFactory.createStructuredLogger(level);
        expect(logger.getLevel()).toBe(level);
      });
    });
  });

  describe("配置验证", () => {
    it("应该处理空配置", () => {
      const logger = LoggerFactory.create({});

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该处理部分配置", () => {
      const config: LoggerConfig = {
        type: LoggerType.NOOP,
        // 省略 level 和 defaultContext
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该处理结构化配置的各种组合", () => {
      const testCases = [
        { json: true },
        { colors: true },
        { sampling: 0.5 },
        { maxFieldLength: 100 },
        { json: true, colors: true },
        { sampling: 0.8, maxFieldLength: 200 },
        { json: false, colors: false, sampling: 1.0, maxFieldLength: 1000 },
      ];

      testCases.forEach((config) => {
        const logger = LoggerFactory.create({
          type: LoggerType.STRUCTURED,
          structuredConfig: config,
        });

        expect(logger).toBeInstanceOf(StructuredLogger);
      });
    });
  });

  describe("边界情况", () => {
    it("应该处理无效的日志级别", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        level: "invalid" as LogLevel,
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe("invalid" as LogLevel);
    });

    it("应该处理 undefined 上下文", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        defaultContext: undefined,
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该处理 null 上下文", () => {
      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        defaultContext: null as any,
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该处理复杂的上下文对象", () => {
      const complexContext = {
        user: { id: "123", name: "John Doe" },
        metadata: { source: "api", version: "1.0.0" },
        array: [1, 2, 3],
        deep: { level1: { level2: "value" } },
      };

      const config: LoggerConfig = {
        type: LoggerType.CONSOLE,
        defaultContext: complexContext,
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("类型安全", () => {
    it("应该保持类型安全", () => {
      // 这些调用应该在 TypeScript 编译时通过类型检查
      const config1: LoggerConfig = {
        type: LoggerType.CONSOLE,
        level: LogLevel.DEBUG,
        defaultContext: { module: "test" },
      };

      const config2: LoggerConfig = {
        type: LoggerType.NOOP,
        level: LogLevel.ERROR,
        defaultContext: { module: "test" },
      };

      const config3: LoggerConfig = {
        type: LoggerType.STRUCTURED,
        level: LogLevel.INFO,
        defaultContext: { module: "test" },
        structuredConfig: {
          json: true,
          colors: false,
          sampling: 0.5,
          maxFieldLength: 1000,
        },
      };

      const logger1 = LoggerFactory.create(config1);
      const logger2 = LoggerFactory.create(config2);
      const logger3 = LoggerFactory.create(config3);

      expect(logger1).toBeInstanceOf(ConsoleLogger);
      expect(logger2).toBeInstanceOf(NoOpLogger);
      expect(logger3).toBeInstanceOf(StructuredLogger);
    });
  });

  describe("性能测试", () => {
    it("应该快速创建大量日志器实例", () => {
      const startTime = Date.now();

      // 创建大量日志器实例
      for (let i = 0; i < 1000; i++) {
        const logger = LoggerFactory.create({
          type: LoggerType.CONSOLE,
          level: LogLevel.INFO,
          defaultContext: { index: i },
        });

        expect(logger).toBeInstanceOf(ConsoleLogger);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（这里设置为 500ms）
      expect(duration).toBeLessThan(500);
    });
  });
});
