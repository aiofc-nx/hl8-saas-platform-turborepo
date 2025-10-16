/**
 * 集成测试 - 验证各组件协作
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
  LoggerAdapterManager,
  BaseLoggerAdapter,
  loggerAdapterManager,
} from "../index";

// 测试适配器实现
class TestLoggerAdapter extends BaseLoggerAdapter {
  readonly name = "test-adapter";
  readonly version = "1.0.0";
  private available = true;

  createLogger(level: LogLevel) {
    return new ConsoleLogger(level);
  }

  isAvailable(): boolean {
    return this.available;
  }

  setAvailable(available: boolean): void {
    this.available = available;
  }
}

describe("集成测试", () => {
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
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
  });

  describe("LoggerFactory 与各种实现集成", () => {
    it("应该正确创建和配置控制台日志器", () => {
      const config = {
        type: LoggerType.CONSOLE,
        level: LogLevel.DEBUG,
        defaultContext: { module: "integration-test" },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      // 测试日志输出
      logger.debug("debug message", { test: "value" });
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "DEBUG",
          message: "debug message",
          module: "integration-test",
          test: "value",
        }),
      );
    });

    it("应该正确创建和配置空操作日志器", () => {
      const config = {
        type: LoggerType.NOOP,
        level: LogLevel.ERROR,
        defaultContext: { module: "integration-test" },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);

      // 测试空操作
      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it("应该正确创建和配置结构化日志器", () => {
      const config = {
        type: LoggerType.STRUCTURED,
        level: LogLevel.INFO,
        defaultContext: { module: "integration-test" },
        structuredConfig: {
          json: true,
          colors: false,
          sampling: 1.0,
          maxFieldLength: 100,
        },
      };

      const logger = LoggerFactory.create(config);

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);

      // 测试结构化输出
      logger.info("structured message", { test: "value" });
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"timestamp":".*"/),
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"level":"info"/),
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"message":"structured message"/),
      );
    });
  });

  describe("便捷方法与工厂集成", () => {
    it("createLogger 应该与 LoggerFactory 兼容", () => {
      const logger1 = createLogger({ test: "value" });
      const logger2 = LoggerFactory.create({
        type: LoggerType.CONSOLE,
        defaultContext: { test: "value" },
      });

      expect(logger1).toBeInstanceOf(ConsoleLogger);
      expect(logger2).toBeInstanceOf(ConsoleLogger);

      // 测试相同的日志输出
      logger1.info("test message");
      logger2.info("test message");

      expect(consoleSpy.info).toHaveBeenCalledTimes(2);
    });

    it("createDomainLogger 应该正确设置上下文", () => {
      const domain = "user-service";
      const logger = createDomainLogger(domain, LogLevel.DEBUG);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      // 测试日志输出包含领域信息
      logger.info("domain message");
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "domain message",
          domain: domain,
        }),
      );
    });

    it("createProductionLogger 应该使用正确的配置", () => {
      const logger = createProductionLogger({ service: "api" });

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);

      // 测试空操作
      logger.info("should not appear");
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe("子日志器集成", () => {
    it("应该正确创建和使用子日志器", () => {
      const parentLogger = createLogger({ parent: "main" });
      const childLogger = parentLogger.child({ child: "sub" });

      expect(childLogger).toBeInstanceOf(ConsoleLogger);
      expect(childLogger).not.toBe(parentLogger);

      // 测试父日志器
      parentLogger.info("parent message");
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: "main",
          message: "parent message",
        }),
      );

      // 测试子日志器
      childLogger.info("child message");
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: "main",
          child: "sub",
          message: "child message",
        }),
      );
    });

    it("应该支持多层嵌套子日志器", () => {
      const rootLogger = createLogger({ root: "system" });
      const level1Logger = rootLogger.child({ level: 1 });
      const level2Logger = level1Logger.child({ level: 2 });
      const level3Logger = level2Logger.child({ level: 3 });

      expect(level3Logger).toBeInstanceOf(ConsoleLogger);

      // 测试最深层的日志器
      level3Logger.info("deep message");
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.objectContaining({
          root: "system",
          level: 3,
          message: "deep message",
        }),
      );
    });

    it("应该支持不同实现类型的子日志器", () => {
      const consoleParent = new ConsoleLogger(LogLevel.DEBUG, {
        type: "console",
      });
      const noopParent = new NoOpLogger(LogLevel.INFO, { type: "noop" });
      const structuredParent = new StructuredLogger(LogLevel.INFO, {
        type: "structured",
      });

      const consoleChild = consoleParent.child({ child: "console" });
      const noopChild = noopParent.child({ child: "noop" });
      const structuredChild = structuredParent.child({ child: "structured" });

      expect(consoleChild).toBeInstanceOf(ConsoleLogger);
      expect(noopChild).toBeInstanceOf(NoOpLogger);
      expect(structuredChild).toBeInstanceOf(StructuredLogger);
    });
  });

  describe("日志级别过滤集成", () => {
    it("应该正确过滤不同级别的日志", () => {
      const logger = new ConsoleLogger(LogLevel.WARN);

      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it("应该在所有实现中正确过滤日志级别", () => {
      const consoleLogger = new ConsoleLogger(LogLevel.WARN);
      const noopLogger = new NoOpLogger(LogLevel.WARN);
      const structuredLogger = new StructuredLogger(LogLevel.WARN);

      [consoleLogger, noopLogger, structuredLogger].forEach((logger) => {
        logger.debug("debug message");
        logger.info("info message");
        logger.warn("warn message");
        logger.error("error message");
      });

      // ConsoleLogger 应该只输出 WARN 和 ERROR
      expect(consoleSpy.warn).toHaveBeenCalledTimes(3); // 每个实现一次
      expect(consoleSpy.error).toHaveBeenCalledTimes(3); // 每个实现一次
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe("错误处理集成", () => {
    it("应该正确处理 Error 对象", () => {
      const logger = new ConsoleLogger();
      const error = new Error("test error");

      logger.error(error, { context: "test" });

      expect(consoleSpy.error).toHaveBeenCalledWith(
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

    it("应该在不同实现中正确处理 Error 对象", () => {
      const consoleLogger = new ConsoleLogger();
      const structuredLogger = new StructuredLogger();
      const error = new Error("integration error");

      consoleLogger.error(error);
      structuredLogger.error(error);

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"error":\s*{\s*"name":\s*"Error"/),
      );
    });
  });

  describe("适配器管理器集成", () => {
    let manager: LoggerAdapterManager;
    let testAdapter: TestLoggerAdapter;

    beforeEach(() => {
      manager = new LoggerAdapterManager();
      testAdapter = new TestLoggerAdapter();
    });

    it("应该正确注册和使用适配器", () => {
      manager.register("test", testAdapter, true);

      const adapter = manager.getAdapter("test");
      expect(adapter).toBe(testAdapter);

      const logger = adapter!.createLogger(LogLevel.INFO);
      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该支持适配器切换", () => {
      const adapter1 = new TestLoggerAdapter();
      const adapter2 = new TestLoggerAdapter();

      manager.register("adapter1", adapter1, true);
      manager.register("adapter2", adapter2);

      let defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBe(adapter1);

      manager.setDefault("adapter2");
      defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBe(adapter2);
    });

    it("应该处理适配器不可用的情况", () => {
      testAdapter.setAvailable(false);
      manager.register("unavailable", testAdapter, true);

      const adapter = manager.getAdapter("unavailable");
      expect(adapter).toBeUndefined();

      const defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBeUndefined();
    });
  });

  describe("全局适配器管理器集成", () => {
    beforeEach(() => {
      loggerAdapterManager.clear();
    });

    it("应该支持全局适配器注册", () => {
      const adapter = new TestLoggerAdapter();
      loggerAdapterManager.register("global-test", adapter, true);

      const retrievedAdapter = loggerAdapterManager.getAdapter("global-test");
      expect(retrievedAdapter).toBe(adapter);

      const logger = retrievedAdapter!.createLogger(LogLevel.INFO);
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该支持多个适配器管理", () => {
      const adapter1 = new TestLoggerAdapter();
      const adapter2 = new TestLoggerAdapter();

      loggerAdapterManager.register("adapter1", adapter1);
      loggerAdapterManager.register("adapter2", adapter2);

      const availableAdapters = loggerAdapterManager.getAvailableAdapters();
      expect(availableAdapters).toHaveLength(2);

      const infos = loggerAdapterManager.getAdapterInfos();
      expect(infos).toHaveLength(2);
      expect(infos.every((info) => info.available)).toBe(true);
    });
  });

  describe("完整工作流集成", () => {
    it("应该支持完整的日志工作流", () => {
      // 1. 创建日志器
      const logger = createDomainLogger("user-service", LogLevel.DEBUG);

      // 2. 设置日志级别
      logger.setLevel(LogLevel.INFO);

      // 3. 创建子日志器
      const childLogger = logger.child({ operation: "create-user" });

      // 4. 记录各种级别的日志
      childLogger.debug("debug message"); // 应该被过滤
      childLogger.info("user created", {
        userId: "123",
        email: "user@example.com",
      });
      childLogger.warn("validation warning", {
        field: "email",
        issue: "format",
      });

      // 5. 记录错误
      const error = new Error("database connection failed");
      childLogger.error(error, { operation: "save-user" });

      // 验证输出
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "user created",
          domain: "user-service",
          operation: "create-user",
          userId: "123",
          email: "user@example.com",
        }),
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message: "validation warning",
          domain: "user-service",
          operation: "create-user",
          field: "email",
          issue: "format",
        }),
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "database connection failed",
          domain: "user-service",
          operation: "create-user",
          error: expect.objectContaining({
            name: "Error",
            message: "database connection failed",
          }),
        }),
      );
    });

    it("应该支持生产环境工作流", () => {
      // 1. 创建生产环境日志器
      const logger = createProductionLogger({
        service: "api",
        environment: "production",
      });

      // 2. 尝试记录各种级别的日志
      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      // 3. 创建子日志器
      const childLogger = logger.child({ operation: "process-request" });
      childLogger.info("processing request");

      // 4. 验证空操作
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it("应该支持结构化日志工作流", () => {
      // 1. 创建结构化日志器
      const logger = LoggerFactory.create({
        type: LoggerType.STRUCTURED,
        level: LogLevel.INFO,
        defaultContext: { service: "analytics" },
        structuredConfig: {
          json: true,
          sampling: 1.0,
        },
      });

      // 2. 记录结构化数据
      logger.info("user action", {
        userId: "123",
        action: "click",
        target: "button",
        metadata: {
          timestamp: new Date().toISOString(),
          sessionId: "session-456",
          userAgent: "Mozilla/5.0...",
        },
      });

      // 3. 验证 JSON 输出
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"service":\s*"analytics"/),
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"userId":\s*"123"/),
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/"action":\s*"click"/),
      );
    });
  });

  describe("性能集成测试", () => {
    it("应该高效处理大量日志操作", () => {
      const logger = createLogger({ performance: "test" });
      const startTime = Date.now();

      // 执行大量日志操作
      for (let i = 0; i < 1000; i++) {
        logger.info(`message ${i}`, { index: i, timestamp: Date.now() });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(consoleSpy.info).toHaveBeenCalledTimes(1000);
    });

    it("应该高效处理大量子日志器创建", () => {
      const parentLogger = createLogger({ parent: "performance-test" });
      const startTime = Date.now();

      // 创建大量子日志器
      const childLoggers = [];
      for (let i = 0; i < 1000; i++) {
        childLoggers.push(parentLogger.child({ child: i }));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 应该在500ms内完成
      expect(childLoggers).toHaveLength(1000);
      expect(
        childLoggers.every((logger) => logger instanceof ConsoleLogger),
      ).toBe(true);
    });
  });
});
