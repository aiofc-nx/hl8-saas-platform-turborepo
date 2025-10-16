/**
 * 消息队列性能基准测试示例
 *
 * @description 展示如何测试消息队列模块的性能和吞吐量
 * 包括消息发布、消费、缓存效果等性能指标测试
 *
 * @example
 * ```typescript
 * import { PerformanceBenchmark } from './performance-benchmark.example';
 *
 * const benchmark = new PerformanceBenchmark();
 * await benchmark.runAllTests();
 * ```
 */

import { Injectable } from "@nestjs/common";
// 移除ConfigService导入，使用直接注入配置类
import { MessagingService } from "../lib/messaging.service";
import { EventService } from "../lib/event.service";
import { TaskService } from "../lib/task.service";
import { MessagingMonitor } from "../lib/monitoring/messaging-monitor.service";
import { MessagingStatsService } from "../lib/monitoring/messaging-stats.service";
import { MessagingConfig } from "../lib/config/messaging.config";
import { PinoLogger } from "@hl8/logger";

/**
 * 性能基准测试类
 *
 * @description 提供完整的消息队列性能测试功能
 */
@Injectable()
export class PerformanceBenchmark {
  private readonly logger = new PinoLogger();
  private readonly testResults: BenchmarkResult[] = [];

  constructor(
    private readonly config: MessagingConfig,
    private readonly messagingService: MessagingService,
    private readonly eventService: EventService,
    private readonly taskService: TaskService,
    private readonly monitor: MessagingMonitor,
    private readonly statsService: MessagingStatsService,
  ) {
    this.logger.setContext({ requestId: "performance-benchmark" });
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests(): Promise<BenchmarkSummary> {
    this.logger.info("开始性能基准测试");

    const startTime = Date.now();

    try {
      // 基础性能测试
      await this.testBasicPublishPerformance();
      await this.testBasicConsumePerformance();

      // 高并发测试
      await this.testHighConcurrencyPublish();
      await this.testHighConcurrencyConsume();

      // 缓存性能测试
      await this.testCachePerformance();

      // 租户隔离性能测试
      await this.testTenantIsolationPerformance();

      // 内存使用测试
      await this.testMemoryUsage();

      // 错误处理性能测试
      await this.testErrorHandlingPerformance();

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      const summary = this.generateSummary(totalDuration);
      this.logger.info("性能基准测试完成", summary);

      return summary;
    } catch (error) {
      this.logger.error("性能基准测试失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试基础发布性能
   */
  async testBasicPublishPerformance(): Promise<void> {
    const testName = "基础发布性能测试";
    const messageCount = 1000;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { messageCount });

    try {
      const promises = Array.from({ length: messageCount }, (_, i) =>
        this.eventService.emit("test.basic", {
          id: i,
          timestamp: Date.now(),
          data: `test-message-${i}`,
        }),
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = (messageCount / duration) * 1000; // 消息/秒

      this.recordResult(testName, {
        messageCount,
        duration,
        throughput,
        avgLatency: duration / messageCount,
      });

      this.logger.info(`${testName}完成`, {
        messageCount,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试基础消费性能
   */
  async testBasicConsumePerformance(): Promise<void> {
    const testName = "基础消费性能测试";
    const messageCount = 1000;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { messageCount });

    try {
      let consumedCount = 0;
      const consumePromises: Promise<void>[] = [];

      // 设置消费者
      this.eventService.on("test.basic", async (_data) => {
        consumedCount++;
        // 模拟处理时间
        await new Promise((resolve) => setTimeout(resolve, 1));
      });

      // 发布消息
      for (let i = 0; i < messageCount; i++) {
        consumePromises.push(
          this.eventService.emit("test.basic", {
            id: i,
            timestamp: Date.now(),
            data: `test-message-${i}`,
          }),
        );
      }

      await Promise.all(consumePromises);

      // 等待所有消息被消费
      while (consumedCount < messageCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = (messageCount / duration) * 1000;

      this.recordResult(testName, {
        messageCount,
        duration,
        throughput,
        avgLatency: duration / messageCount,
        consumedCount,
      });

      this.logger.info(`${testName}完成`, {
        messageCount,
        consumedCount,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试高并发发布性能
   */
  async testHighConcurrencyPublish(): Promise<void> {
    const testName = "高并发发布性能测试";
    const messageCount = 10000;
    const concurrency = 100;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { messageCount, concurrency });

    try {
      const batches = [];
      for (let i = 0; i < messageCount; i += concurrency) {
        const batch = Array.from(
          { length: Math.min(concurrency, messageCount - i) },
          (_, j) =>
            this.eventService.emit("test.high-concurrency", {
              id: i + j,
              timestamp: Date.now(),
              batch: Math.floor((i + j) / concurrency),
            }),
        );
        batches.push(Promise.all(batch));
      }

      await Promise.all(batches);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = (messageCount / duration) * 1000;

      this.recordResult(testName, {
        messageCount,
        concurrency,
        duration,
        throughput,
        avgLatency: duration / messageCount,
      });

      this.logger.info(`${testName}完成`, {
        messageCount,
        concurrency,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试高并发消费性能
   */
  async testHighConcurrencyConsume(): Promise<void> {
    const testName = "高并发消费性能测试";
    const messageCount = 5000;
    const consumerCount = 10;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { messageCount, consumerCount });

    try {
      let consumedCount = 0;
      const consumedByConsumer: number[] = Array(consumerCount).fill(0);

      // 设置多个消费者
      for (let i = 0; i < consumerCount; i++) {
        const consumerId = i;
        this.eventService.on("test.high-concurrency", async (_data) => {
          consumedCount++;
          consumedByConsumer[consumerId]++;
          // 模拟处理时间
          await new Promise((resolve) => setTimeout(resolve, 2));
        });
      }

      // 发布消息
      const publishPromises = Array.from({ length: messageCount }, (_, i) =>
        this.eventService.emit("test.high-concurrency", {
          id: i,
          timestamp: Date.now(),
          message: `high-concurrency-message-${i}`,
        }),
      );

      await Promise.all(publishPromises);

      // 等待所有消息被消费
      while (consumedCount < messageCount) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = (messageCount / duration) * 1000;

      this.recordResult(testName, {
        messageCount,
        consumerCount,
        duration,
        throughput,
        avgLatency: duration / messageCount,
        consumedCount,
        consumedByConsumer,
      });

      this.logger.info(`${testName}完成`, {
        messageCount,
        consumerCount,
        consumedCount,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试缓存性能
   */
  async testCachePerformance(): Promise<void> {
    const testName = "缓存性能测试";
    const testCount = 1000;
    const _startTime = Date.now();

    this.logger.info(`开始${testName}`, { testCount });

    try {
      // 测试缓存命中性能
      const cacheHitStartTime = Date.now();
      for (let i = 0; i < testCount; i++) {
        // 注意：MessagingService没有get方法，这里仅作为示例
        // 实际缓存操作应该通过CacheService进行
        await this.simulateCacheGet("test-cache-key", () => {
          return Promise.resolve(`cached-value-${i}`);
        });
      }
      const cacheHitDuration = Date.now() - cacheHitStartTime;

      // 测试缓存未命中性能
      const cacheMissStartTime = Date.now();
      for (let i = 0; i < testCount; i++) {
        await this.simulateCacheGet(`test-cache-miss-${i}`, () => {
          return Promise.resolve(`new-value-${i}`);
        });
      }
      const cacheMissDuration = Date.now() - cacheMissStartTime;

      this.recordResult(testName, {
        testCount,
        cacheHitDuration,
        cacheMissDuration,
        cacheHitThroughput: (testCount / cacheHitDuration) * 1000,
        cacheMissThroughput: (testCount / cacheMissDuration) * 1000,
        cacheHitAvgLatency: cacheHitDuration / testCount,
        cacheMissAvgLatency: cacheMissDuration / testCount,
      });

      this.logger.info(`${testName}完成`, {
        testCount,
        cacheHitThroughput: Math.round((testCount / cacheHitDuration) * 1000),
        cacheMissThroughput: Math.round((testCount / cacheMissDuration) * 1000),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试租户隔离性能
   */
  async testTenantIsolationPerformance(): Promise<void> {
    const testName = "租户隔离性能测试";
    const tenantCount = 10;
    const messagesPerTenant = 100;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { tenantCount, messagesPerTenant });

    try {
      const promises: Promise<void>[] = [];

      // 为每个租户发布消息
      for (let tenantId = 0; tenantId < tenantCount; tenantId++) {
        for (let messageId = 0; messageId < messagesPerTenant; messageId++) {
          promises.push(
            this.eventService.emit("test.tenant-isolation", {
              tenantId: `tenant-${tenantId}`,
              messageId: `message-${messageId}`,
              timestamp: Date.now(),
            }),
          );
        }
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const totalMessages = tenantCount * messagesPerTenant;
      const throughput = (totalMessages / duration) * 1000;

      this.recordResult(testName, {
        tenantCount,
        messagesPerTenant,
        totalMessages,
        duration,
        throughput,
        avgLatency: duration / totalMessages,
      });

      this.logger.info(`${testName}完成`, {
        tenantCount,
        totalMessages,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试内存使用情况
   */
  async testMemoryUsage(): Promise<void> {
    const testName = "内存使用测试";
    const startTime = Date.now();

    this.logger.info(`开始${testName}`);

    try {
      // 获取初始内存使用情况
      const initialMemory = process.memoryUsage();

      // 发布大量消息
      const messageCount = 5000;
      const promises = Array.from({ length: messageCount }, (_, i) =>
        this.eventService.emit("test.memory", {
          id: i,
          data: new Array(1000).fill(`data-${i}`).join(""),
        }),
      );

      await Promise.all(promises);

      // 获取内存使用情况
      const finalMemory = process.memoryUsage();
      const memoryIncrease = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
      };

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.recordResult(testName, {
        messageCount,
        duration,
        initialMemory,
        finalMemory,
        memoryIncrease,
        memoryPerMessage: memoryIncrease.heapUsed / messageCount,
      });

      this.logger.info(`${testName}完成`, {
        messageCount,
        duration,
        memoryIncrease:
          Math.round(memoryIncrease.heapUsed / 1024 / 1024) + "MB",
        memoryPerMessage: Math.round(memoryIncrease.heapUsed / messageCount),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 测试错误处理性能
   */
  async testErrorHandlingPerformance(): Promise<void> {
    const testName = "错误处理性能测试";
    const errorCount = 100;
    const startTime = Date.now();

    this.logger.info(`开始${testName}`, { errorCount });

    try {
      let handledErrors = 0;

      // 设置错误处理器
      this.eventService.on("test.error", async (data: unknown) => {
        if ((data as any).shouldError) {
          handledErrors++;
          throw new Error(`Test error ${(data as any).id}`);
        }
        // 事件处理器不应该返回值
      });

      // 发布包含错误的消息
      const promises = Array.from({ length: errorCount }, (_, i) =>
        this.eventService
          .emit("test.error", {
            id: i,
            shouldError: i % 2 === 0, // 一半消息会出错
          })
          .catch((error: unknown) => {
            // 捕获并记录错误
            this.logger.warn("测试错误已处理", {
              error: (error as any).message,
              id: i,
            });
          }),
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const throughput = (errorCount / duration) * 1000;

      this.recordResult(testName, {
        errorCount,
        handledErrors,
        duration,
        throughput,
        avgLatency: duration / errorCount,
      });

      this.logger.info(`${testName}完成`, {
        errorCount,
        handledErrors,
        duration,
        throughput: Math.round(throughput),
      });
    } catch (error) {
      this.logger.error(`${testName}失败`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 记录测试结果
   */
  private recordResult(testName: string, metrics: unknown): void {
    const result: BenchmarkResult = {
      testName,
      timestamp: new Date(),
      metrics,
    };
    this.testResults.push(result);
  }

  /**
   * 生成测试摘要
   */
  private generateSummary(totalDuration: number): BenchmarkSummary {
    const config = this.config;

    return {
      totalDuration,
      testCount: this.testResults.length,
      config: {
        adapter: config?.adapter,
        enableTenantIsolation: config?.enableTenantIsolation,
        cacheEnabled: config?.cache?.enableMessageDeduplication,
      },
      results: this.testResults,
      summary: {
        avgThroughput: this.calculateAverageThroughput(),
        totalMessages: this.calculateTotalMessages(),
        avgLatency: this.calculateAverageLatency(),
      },
    };
  }

  /**
   * 计算平均吞吐量
   */
  private calculateAverageThroughput(): number {
    const throughputResults = this.testResults
      .filter((result) => (result.metrics as any).throughput)
      .map((result) => (result.metrics as any).throughput);

    if (throughputResults.length === 0) return 0;

    return (
      throughputResults.reduce((sum, throughput) => sum + throughput, 0) /
      throughputResults.length
    );
  }

  /**
   * 计算总消息数
   */
  private calculateTotalMessages(): number {
    return this.testResults
      .filter(
        (result) =>
          (result.metrics as any).messageCount ||
          (result.metrics as any).testCount,
      )
      .reduce(
        (sum, result) =>
          sum +
          ((result.metrics as any).messageCount ||
            (result.metrics as any).testCount ||
            0),
        0,
      );
  }

  /**
   * 计算平均延迟
   */
  private calculateAverageLatency(): number {
    const latencyResults = this.testResults
      .filter((result) => (result.metrics as any).avgLatency)
      .map((result) => (result.metrics as any).avgLatency);

    if (latencyResults.length === 0) return 0;

    return (
      latencyResults.reduce((sum, latency) => sum + latency, 0) /
      latencyResults.length
    );
  }

  /**
   * 获取测试结果
   */
  getResults(): BenchmarkResult[] {
    return this.testResults;
  }

  /**
   * 模拟缓存获取操作
   */
  private async simulateCacheGet<T>(
    key: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    // 模拟缓存获取延迟
    await new Promise((resolve) => setTimeout(resolve, 1));
    return factory();
  }

  /**
   * 清理测试数据
   */
  async cleanup(): Promise<void> {
    this.logger.info("清理性能测试数据");

    // 移除所有测试事件监听器
    this.eventService.off("test.basic");
    this.eventService.off("test.high-concurrency");
    this.eventService.off("test.tenant-isolation");
    this.eventService.off("test.memory");
    this.eventService.off("test.error");

    // 清理缓存
    // 注意：MessagingService没有clear方法，这里仅作为示例
    // 实际缓存清理应该通过CacheService进行
    this.logger.info("缓存清理完成（模拟）");

    this.logger.info("性能测试数据清理完成");
  }
}

// 类型定义
interface BenchmarkResult {
  testName: string;
  timestamp: Date;
  metrics: unknown;
}

interface BenchmarkSummary {
  totalDuration: number;
  testCount: number;
  config: {
    adapter?: string;
    enableTenantIsolation?: boolean;
    cacheEnabled?: boolean;
  };
  results: BenchmarkResult[];
  summary: {
    avgThroughput: number;
    totalMessages: number;
    avgLatency: number;
  };
}
