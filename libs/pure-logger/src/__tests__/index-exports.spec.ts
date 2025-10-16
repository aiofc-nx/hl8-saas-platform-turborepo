/**
 * 索引文件导出测试
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
  createLogger,
  createDomainLogger,
  createProductionLogger,
  LogLevel,
  LoggerType,
  ConsoleLogger,
  NoOpLogger,
  StructuredLogger,
  LoggerFactory,
} from "../index";

describe("Index 导出测试", () => {
  describe("createLogger 方法", () => {
    it("应该创建默认日志器", () => {
      const logger = createLogger();

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的上下文", () => {
      const context = { module: "test", version: "1.0.0" };
      const logger = createLogger(context);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该处理空上下文", () => {
      const logger = createLogger({});

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该处理复杂上下文", () => {
      const context = {
        user: { id: "123", name: "John Doe" },
        metadata: { source: "api", version: "1.0.0" },
        array: [1, 2, 3],
        deep: { level1: { level2: "value" } },
      };

      const logger = createLogger(context);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该支持子日志器创建", () => {
      const logger = createLogger({ parent: "test" });
      const childLogger = logger.child({ child: "value" });

      expect(childLogger).toBeInstanceOf(ConsoleLogger);
      expect(childLogger).not.toBe(logger);
    });
  });

  describe("createDomainLogger 方法", () => {
    it("应该创建领域日志器", () => {
      const domain = "user-domain";
      const logger = createDomainLogger(domain);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的领域名称", () => {
      const domain = "order-domain";
      const logger = createDomainLogger(domain);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it("应该使用指定的日志级别", () => {
      const domain = "payment-domain";
      const level = LogLevel.DEBUG;
      const logger = createDomainLogger(domain, level);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it("应该包含领域上下文", () => {
      const domain = "inventory-domain";
      const logger = createDomainLogger(domain);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该包含时间戳上下文", () => {
      const domain = "notification-domain";
      const logger = createDomainLogger(domain);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该支持所有日志级别", () => {
      const levels = [
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
      ];

      levels.forEach((level) => {
        const logger = createDomainLogger("test-domain", level);
        expect(logger.getLevel()).toBe(level);
      });
    });

    it("应该支持子日志器创建", () => {
      const logger = createDomainLogger("test-domain");
      const childLogger = logger.child({ operation: "validate" });

      expect(childLogger).toBeInstanceOf(ConsoleLogger);
      expect(childLogger).not.toBe(logger);
    });
  });

  describe("createProductionLogger 方法", () => {
    it("应该创建生产环境日志器", () => {
      const logger = createProductionLogger();

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该使用指定的上下文", () => {
      const context = { service: "api", environment: "production" };
      const logger = createProductionLogger(context);

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该处理空上下文", () => {
      const logger = createProductionLogger({});

      expect(logger).toBeInstanceOf(NoOpLogger);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该处理复杂上下文", () => {
      const context = {
        service: { name: "user-service", version: "2.0.0" },
        environment: { name: "production", region: "us-east-1" },
        monitoring: { enabled: true, level: "error" },
      };

      const logger = createProductionLogger(context);

      expect(logger).toBeInstanceOf(NoOpLogger);
    });

    it("应该是空操作日志器", () => {
      const logger = createProductionLogger();
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("应该支持子日志器创建", () => {
      const logger = createProductionLogger({ service: "api" });
      const childLogger = logger.child({ operation: "process" });

      expect(childLogger).toBeInstanceOf(NoOpLogger);
      expect(childLogger).not.toBe(logger);
    });
  });

  describe("便捷方法集成测试", () => {
    it("应该创建不同类型的日志器", () => {
      const defaultLogger = createLogger();
      const domainLogger = createDomainLogger("test-domain");
      const productionLogger = createProductionLogger();

      expect(defaultLogger).toBeInstanceOf(ConsoleLogger);
      expect(domainLogger).toBeInstanceOf(ConsoleLogger);
      expect(productionLogger).toBeInstanceOf(NoOpLogger);
    });

    it("应该支持日志级别设置", () => {
      const logger = createLogger();
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      const domainLogger = createDomainLogger("test", LogLevel.WARN);
      expect(domainLogger.getLevel()).toBe(LogLevel.WARN);

      const productionLogger = createProductionLogger();
      expect(productionLogger.getLevel()).toBe(LogLevel.ERROR);
    });

    it("应该支持所有日志方法", () => {
      const logger = createLogger();
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      logger.info("test message", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "test message",
          key: "value",
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("边界情况", () => {
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
      ];

      specialNames.forEach((name) => {
        const logger = createDomainLogger(name);
        expect(logger).toBeInstanceOf(ConsoleLogger);
      });
    });

    it("应该处理 null 和 undefined 上下文", () => {
      const logger1 = createLogger(null as any);
      const logger2 = createLogger(undefined as any);
      const logger3 = createProductionLogger(null as any);
      const logger4 = createProductionLogger(undefined as any);

      expect(logger1).toBeInstanceOf(ConsoleLogger);
      expect(logger2).toBeInstanceOf(ConsoleLogger);
      expect(logger3).toBeInstanceOf(NoOpLogger);
      expect(logger4).toBeInstanceOf(NoOpLogger);
    });

    it("应该处理循环引用上下文", () => {
      const circularContext: any = { name: "test" };
      circularContext.self = circularContext;

      const logger = createLogger(circularContext);

      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("性能测试", () => {
    it("应该快速创建大量日志器实例", () => {
      const startTime = Date.now();

      // 创建大量日志器实例
      for (let i = 0; i < 1000; i++) {
        const logger = createLogger({ index: i });
        const domainLogger = createDomainLogger(`domain-${i}`);
        const productionLogger = createProductionLogger({
          service: `service-${i}`,
        });

        expect(logger).toBeInstanceOf(ConsoleLogger);
        expect(domainLogger).toBeInstanceOf(ConsoleLogger);
        expect(productionLogger).toBeInstanceOf(NoOpLogger);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（这里设置为 1000ms）
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("类型安全", () => {
    it("应该保持类型安全", () => {
      // 这些调用应该在 TypeScript 编译时通过类型检查
      const logger1 = createLogger();
      const logger2 = createLogger({ module: "test" });
      const logger3 = createDomainLogger("test-domain");
      const logger4 = createDomainLogger("test-domain", LogLevel.DEBUG);
      const logger5 = createProductionLogger();
      const logger6 = createProductionLogger({ service: "api" });

      expect(logger1).toBeInstanceOf(ConsoleLogger);
      expect(logger2).toBeInstanceOf(ConsoleLogger);
      expect(logger3).toBeInstanceOf(ConsoleLogger);
      expect(logger4).toBeInstanceOf(ConsoleLogger);
      expect(logger5).toBeInstanceOf(NoOpLogger);
      expect(logger6).toBeInstanceOf(NoOpLogger);
    });
  });

  describe("便捷方法与其他组件集成", () => {
    it("应该与 LoggerFactory 兼容", () => {
      const logger1 = createLogger();
      const logger2 = LoggerFactory.create();

      expect(logger1).toBeInstanceOf(ConsoleLogger);
      expect(logger2).toBeInstanceOf(ConsoleLogger);
    });

    it("应该支持适配器模式", () => {
      const logger = createLogger({ adapter: "test" });
      const childLogger = logger.child({ child: "value" });

      expect(childLogger).toBeInstanceOf(ConsoleLogger);
    });

    it("应该支持结构化日志", () => {
      const structuredLogger = LoggerFactory.create({
        type: LoggerType.STRUCTURED,
        level: LogLevel.INFO,
        defaultContext: { module: "test" },
      });

      expect(structuredLogger).toBeInstanceOf(StructuredLogger);
    });
  });
});
