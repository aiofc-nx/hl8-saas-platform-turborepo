/**
 * 基础命令用例单元测试
 *
 * @description 测试基础命令用例的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { BaseCommandUseCase } from "./base-command-use-case.js";
import {
  MockEventBus,
  MockTransactionManager,
  MockLoggerService,
  TestDataFactory,
} from "../../__tests__/test-utils/index.js";
import type { IUseCaseContext } from "./use-case.interface.js";

/**
 * 测试命令用例实现
 *
 * @description 用于测试基础命令用例的具体实现
 */
class TestCommandUseCase extends BaseCommandUseCase<TestRequest, TestResponse> {
  private shouldThrowError = false;
  private shouldThrowBusinessError = false;
  private shouldThrowValidationError = false;

  constructor(eventBus?: any, transactionManager?: any, logger?: any) {
    super("TestCommand", "测试命令用例", "1.0.0", ["test:execute"], logger);
    this.eventBus = eventBus;
    this.transactionManager = transactionManager;
  }

  /**
   * 设置是否抛出错误
   */
  setShouldThrowError(shouldThrow: boolean): void {
    this.shouldThrowError = shouldThrow;
  }

  /**
   * 设置是否抛出业务错误
   */
  setShouldThrowBusinessError(shouldThrow: boolean): void {
    this.shouldThrowBusinessError = shouldThrow;
  }

  /**
   * 设置是否抛出验证错误
   */
  setShouldThrowValidationError(shouldThrow: boolean): void {
    this.shouldThrowValidationError = shouldThrow;
  }

  /**
   * 执行命令逻辑
   */
  protected async executeCommand(
    request: TestRequest,
    context: IUseCaseContext,
  ): Promise<TestResponse> {
    if (this.shouldThrowError) {
      throw new Error("测试错误");
    }

    if (this.shouldThrowBusinessError) {
      throw new Error("业务规则错误");
    }

    return {
      id: "test-id",
      message: "测试成功",
      data: request.data,
    };
  }

  /**
   * 验证业务规则
   */
  protected async validateBusinessRules(
    request: TestRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    if (this.shouldThrowValidationError) {
      throw new Error("验证失败");
    }
  }
}

/**
 * 测试请求接口
 */
interface TestRequest {
  data: string;
}

/**
 * 测试响应接口
 */
interface TestResponse {
  id: string;
  message: string;
  data: string;
}

describe("BaseCommandUseCase", () => {
  let useCase: TestCommandUseCase;
  let mockEventBus: MockEventBus;
  let mockTransactionManager: MockTransactionManager;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // 初始化模拟对象
    mockEventBus = new MockEventBus();
    mockTransactionManager = new MockTransactionManager();
    mockLogger = new MockLoggerService();

    // 创建测试用例实例
    useCase = new TestCommandUseCase(
      mockEventBus,
      mockTransactionManager,
      mockLogger,
    );
  });

  afterEach(() => {
    // 清理测试数据
    mockEventBus.clearEvents();
    mockTransactionManager.reset();
    mockLogger.clearLogs();
  });

  describe("构造函数", () => {
    it("应该正确初始化基础属性", () => {
      expect(useCase.useCaseName).toBe("TestCommand");
      expect(useCase.useCaseDescription).toBe("测试命令用例");
      expect(useCase.useCaseVersion).toBe("1.0.0");
      expect(useCase.requiredPermissions).toEqual(["test:execute"]);
    });
  });

  describe("execute - 成功场景", () => {
    it("应该成功执行命令", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("test-id");
      expect(result.data?.message).toBe("测试成功");
      expect(result.data?.data).toBe("测试数据");
    });

    it("应该记录执行日志", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证日志记录
      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("execute - 错误处理", () => {
    it("应该处理执行错误", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 设置抛出错误
      useCase.setShouldThrowError(true);

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("测试错误");
    });

    it("应该处理业务规则错误", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 设置抛出业务错误
      useCase.setShouldThrowBusinessError(true);

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("业务规则错误");
    });

    it("应该处理验证错误", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 设置抛出验证错误
      useCase.setShouldThrowValidationError(true);

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("验证失败");
    });
  });

  describe("事件发布", () => {
    it("应该发布领域事件", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 创建模拟聚合根
      const mockAggregate = {
        getUncommittedEvents: () => [
          { eventType: "TestEvent", data: "test" },
          { eventType: "AnotherEvent", data: "another" },
        ],
        markEventsAsCommitted: () => {},
        clearEvents: () => {},
      };

      // 执行用例
      await useCase.execute(request, context);

      // 手动发布事件（模拟聚合根产生事件）
      await useCase.publishDomainEvents(mockAggregate);

      // 验证事件已发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents).toHaveLength(2);
      expect(publishedEvents[0]).toEqual({
        eventType: "TestEvent",
        data: "test",
      });
      expect(publishedEvents[1]).toEqual({
        eventType: "AnotherEvent",
        data: "another",
      });
    });

    it("应该处理事件发布失败", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟事件发布失败
      const originalPublishAll = mockEventBus.publishAll;
      mockEventBus.publishAll = async () => {
        throw new Error("事件发布失败");
      };

      // 创建模拟聚合根
      const mockAggregate = {
        getUncommittedEvents: () => [{ eventType: "TestEvent", data: "test" }],
        markEventsAsCommitted: () => {},
        clearEvents: () => {},
      };

      // 执行用例并验证异常
      const result = await useCase.execute(request, context);

      // 手动发布事件（模拟聚合根产生事件）
      await expect(useCase.publishDomainEvents(mockAggregate)).rejects.toThrow(
        "事件发布失败",
      );

      // 恢复原始方法
      mockEventBus.publishAll = originalPublishAll;
    });

    it("应该处理空事件列表", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 创建模拟聚合根（无事件）
      const mockAggregate = {
        getUncommittedEvents: () => [],
        markEventsAsCommitted: () => {},
        clearEvents: () => {},
      };

      // 执行用例
      await useCase.execute(request, context);

      // 手动发布事件（模拟聚合根产生事件）
      await useCase.publishDomainEvents(mockAggregate);

      // 验证没有事件发布
      const publishedEvents = mockEventBus.getPublishedEvents();
      expect(publishedEvents).toHaveLength(0);
    });
  });

  describe("事务管理", () => {
    it("应该开始事务", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例
      await useCase.execute(request, context);

      // 验证事务已开始
      expect(mockTransactionManager.getTransactionCount()).toBeGreaterThan(0);
    });

    it("应该处理事务管理器未注入的情况", async () => {
      // 创建没有事务管理器的用例
      const useCaseWithoutTransaction = new TestCommandUseCase(
        mockEventBus,
        undefined,
        mockLogger,
      );

      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 执行用例（应该不抛出异常）
      const result = await useCaseWithoutTransaction.execute(request, context);

      // 验证成功
      expect(result.success).toBe(true);
    });
  });

  describe("日志记录", () => {
    it("应该记录事件发布日志", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 创建模拟聚合根
      const mockAggregate = {
        getUncommittedEvents: () => [{ eventType: "TestEvent", data: "test" }],
        markEventsAsCommitted: () => {},
        clearEvents: () => {},
      };

      // 执行用例
      await useCase.execute(request, context);

      // 手动发布事件
      await useCase.publishDomainEvents(mockAggregate);

      // 验证日志记录
      const logs = mockLogger.getLogs();
      const infoLogs = mockLogger.getLogsByLevel("info");
      expect(infoLogs.length).toBeGreaterThan(0);
    });

    it("应该记录事件发布失败日志", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 模拟事件发布失败
      const originalPublishAll = mockEventBus.publishAll;
      mockEventBus.publishAll = async () => {
        throw new Error("事件发布失败");
      };

      // 创建模拟聚合根
      const mockAggregate = {
        getUncommittedEvents: () => [{ eventType: "TestEvent", data: "test" }],
        markEventsAsCommitted: () => {},
        clearEvents: () => {},
      };

      // 执行用例
      await useCase.execute(request, context);

      // 手动发布事件并捕获异常
      try {
        await useCase.publishDomainEvents(mockAggregate);
      } catch (error) {
        // 预期会抛出异常
      }

      // 验证错误日志记录
      const errorLogs = mockLogger.getLogsByLevel("error");
      expect(errorLogs.length).toBeGreaterThan(0);

      // 恢复原始方法
      mockEventBus.publishAll = originalPublishAll;
    });
  });

  describe("执行结果创建", () => {
    it("应该创建成功的执行结果", () => {
      // 准备测试数据
      const response: TestResponse = {
        id: "test-id",
        message: "成功",
        data: "test",
      };
      const context = TestDataFactory.createUseCaseContext();

      // 创建执行结果
      const result = useCase.createExecutionResult(
        true,
        response,
        undefined,
        context,
        100,
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(response);
      expect(result.error).toBeUndefined();
      expect(result.metadata?.useCaseName).toBe("TestCommand");
      expect(result.metadata?.executionTime).toBe(100);
      expect(result.metadata?.timestamp).toBeDefined();
    });

    it("应该创建失败的执行结果", () => {
      // 准备测试数据
      const error = new Error("测试错误");
      const context = TestDataFactory.createUseCaseContext();

      // 创建执行结果
      const result = useCase.createExecutionResult(
        false,
        undefined,
        error,
        context,
        50,
      );

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("测试错误");
      expect(result.metadata?.useCaseName).toBe("TestCommand");
      expect(result.metadata?.executionTime).toBe(50);
    });
  });

  describe("性能测试", () => {
    it("应该在合理时间内完成", async () => {
      // 准备测试数据
      const request: TestRequest = { data: "测试数据" };
      const context = TestDataFactory.createUseCaseContext();

      // 记录开始时间
      const startTime = Date.now();

      // 执行用例
      const result = await useCase.execute(request, context);

      // 记录结束时间
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 验证成功
      expect(result.success).toBe(true);

      // 验证执行时间（应该在1秒内完成）
      expect(executionTime).toBeLessThan(1000);
    });
  });
});
