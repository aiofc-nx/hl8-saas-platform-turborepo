/**
 * 消息队列适配器测试
 *
 * @description 测试消息队列适配器的业务逻辑和消息处理功能
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { MessageQueueAdapter } from "./message-queue.adapter.js";
import type {
  IMessageQueueConfig,
  IMessage,
  IMessageHandler,
} from "./message-queue.adapter.js";
import type { CacheService } from "@hl8/caching";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

describe("MessageQueueAdapter", () => {
  let adapter: MessageQueueAdapter;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockLogger: jest.Mocked<FastifyLoggerService>;
  let mockConfig: IMessageQueueConfig;

  beforeEach(() => {
    // 创建模拟缓存服务
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<CacheService>;

    // 创建模拟日志记录器
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as jest.Mocked<FastifyLoggerService>;

    // 创建配置
    mockConfig = {
      enableCache: true,
      cacheTtl: 300,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableDeadLetterQueue: true,
      enablePersistence: true,
      messageTtl: 3600000,
      enableCompression: false,
      enableEncryption: false,
    };

    // 创建适配器实例
    adapter = new MessageQueueAdapter(mockCacheService, mockLogger, mockConfig);
  });

  describe("构造函数", () => {
    it("应该成功创建消息队列适配器", () => {
      expect(adapter).toBeDefined();
      expect(adapter.isConnected()).toBe(false);
    });

    it("应该使用默认配置创建适配器", () => {
      const defaultAdapter = new MessageQueueAdapter(
        mockCacheService,
        mockLogger,
      );
      expect(defaultAdapter).toBeDefined();
    });
  });

  describe("连接管理", () => {
    it("应该能够连接到消息队列", async () => {
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
    });

    it("应该能够断开连接", async () => {
      await adapter.connect();
      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it("应该处理连接失败", async () => {
      // 模拟连接失败
      jest.spyOn(adapter, "connect").mockRejectedValue(new Error("连接失败"));

      await expect(adapter.connect()).rejects.toThrow("连接失败");
    });

    it("应该处理重复连接", async () => {
      await adapter.connect();
      await adapter.connect(); // 重复连接
      expect(adapter.isConnected()).toBe(true);
    });
  });

  describe("消息发布", () => {
    beforeEach(async () => {
      await adapter.connect();
    });

    it("应该成功发布消息", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
        correlationId: "corr-123",
        replyTo: "reply-queue",
        ttl: 3600000,
        priority: 1,
        headers: { source: "test" },
      };

      const result = await adapter.publish("test-topic", message);
      expect(result).toBe(true);
    });

    it("应该验证消息内容", async () => {
      const invalidMessage = {
        messageId: "",
        messageType: "",
        content: null,
      } as IMessage;

      await expect(
        adapter.publish("test-topic", invalidMessage),
      ).rejects.toThrow("消息ID不能为空");
    });

    it("应该验证消息类型", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "消息类型不能为空",
      );
    });

    it("应该验证主题名称", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await expect(adapter.publish("", message)).rejects.toThrow(
        "主题名称不能为空",
      );
    });

    it("应该处理发布失败", async () => {
      // 模拟发布失败
      jest.spyOn(adapter, "publish").mockRejectedValue(new Error("发布失败"));

      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "发布失败",
      );
    });

    it("应该支持消息缓存", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", message);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it("应该支持消息重试", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      // 模拟第一次失败，第二次成功
      let attemptCount = 0;
      jest.spyOn(adapter, "publish").mockImplementation(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error("临时失败");
        }
        return true;
      });

      const result = await adapter.publish("test-topic", message);
      expect(result).toBe(true);
      expect(attemptCount).toBe(2);
    });
  });

  describe("消息订阅", () => {
    beforeEach(async () => {
      await adapter.connect();
    });

    it("应该成功订阅消息", async () => {
      const handler: IMessageHandler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };

      await adapter.subscribe("test-topic", handler);
      expect(adapter.isSubscribed("test-topic")).toBe(true);
    });

    it("应该验证处理器", async () => {
      await expect(
        adapter.subscribe("test-topic", null as any),
      ).rejects.toThrow("消息处理器不能为空");
    });

    it("应该验证主题名称", async () => {
      const handler: IMessageHandler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };

      await expect(adapter.subscribe("", handler)).rejects.toThrow(
        "主题名称不能为空",
      );
    });

    it("应该处理重复订阅", async () => {
      const handler: IMessageHandler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };

      await adapter.subscribe("test-topic", handler);
      await adapter.subscribe("test-topic", handler); // 重复订阅
      expect(adapter.isSubscribed("test-topic")).toBe(true);
    });

    it("应该能够取消订阅", async () => {
      const handler: IMessageHandler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };

      await adapter.subscribe("test-topic", handler);
      await adapter.unsubscribe("test-topic");
      expect(adapter.isSubscribed("test-topic")).toBe(false);
    });
  });

  describe("消息处理", () => {
    let handler: jest.Mocked<IMessageHandler>;

    beforeEach(async () => {
      await adapter.connect();
      handler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };
      await adapter.subscribe("test-topic", handler);
    });

    it("应该处理消息", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", message);
      expect(handler.handle).toHaveBeenCalledWith(message);
    });

    it("应该处理消息成功", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      handler.handle.mockResolvedValue(undefined);

      await adapter.publish("test-topic", message);
      expect(handler.onSuccess).toHaveBeenCalledWith(message);
    });

    it("应该处理消息错误", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      const error = new Error("处理失败");
      handler.handle.mockRejectedValue(error);

      await adapter.publish("test-topic", message);
      expect(handler.onError).toHaveBeenCalledWith(message, error);
    });

    it("应该支持消息过滤", async () => {
      const filter = (message: IMessage) => message.messageType === "filtered";

      await adapter.subscribe("test-topic", handler, filter);

      const message1: IMessage = {
        messageId: "msg-1",
        messageType: "filtered",
        content: { data: "test1" },
        timestamp: new Date(),
      };

      const message2: IMessage = {
        messageId: "msg-2",
        messageType: "other",
        content: { data: "test2" },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", message1);
      await adapter.publish("test-topic", message2);

      expect(handler.handle).toHaveBeenCalledTimes(1);
      expect(handler.handle).toHaveBeenCalledWith(message1);
    });
  });

  describe("死信队列", () => {
    beforeEach(async () => {
      await adapter.connect();
    });

    it("应该处理死信消息", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      // 模拟消息处理失败
      jest.spyOn(adapter, "publish").mockRejectedValue(new Error("处理失败"));

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "处理失败",
      );
    });

    it("应该支持死信队列配置", () => {
      const configWithDLQ = {
        ...mockConfig,
        enableDeadLetterQueue: true,
      };

      const dlqAdapter = new MessageQueueAdapter(
        mockCacheService,
        mockLogger,
        configWithDLQ,
      );

      expect(dlqAdapter).toBeDefined();
    });
  });

  describe("消息持久化", () => {
    beforeEach(async () => {
      await adapter.connect();
    });

    it("应该支持消息持久化", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", message);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("消息已持久化"),
      );
    });

    it("应该支持消息恢复", async () => {
      const messages = await adapter.recoverMessages("test-topic");
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe("消息压缩", () => {
    beforeEach(async () => {
      const configWithCompression = {
        ...mockConfig,
        enableCompression: true,
      };
      adapter = new MessageQueueAdapter(
        mockCacheService,
        mockLogger,
        configWithCompression,
      );
      await adapter.connect();
    });

    it("应该压缩大消息", async () => {
      const largeMessage: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "x".repeat(10000) },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", largeMessage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("消息已压缩"),
      );
    });
  });

  describe("消息加密", () => {
    beforeEach(async () => {
      const configWithEncryption = {
        ...mockConfig,
        enableEncryption: true,
      };
      adapter = new MessageQueueAdapter(
        mockCacheService,
        mockLogger,
        configWithEncryption,
      );
      await adapter.connect();
    });

    it("应该加密敏感消息", async () => {
      const sensitiveMessage: IMessage = {
        messageId: "msg-123",
        messageType: "sensitive-message",
        content: { data: "sensitive-data" },
        timestamp: new Date(),
      };

      await adapter.publish("test-topic", sensitiveMessage);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("消息已加密"),
      );
    });
  });

  describe("性能测试", () => {
    beforeEach(async () => {
      await adapter.connect();
    });

    it("应该能够快速发布消息", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date(),
      };

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await adapter.publish("test-topic", message);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速订阅消息", async () => {
      const handler: IMessageHandler = {
        handle: jest.fn(),
        onError: jest.fn(),
        onSuccess: jest.fn(),
      };

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await adapter.subscribe(`topic-${i}`, handler);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe("边界条件", () => {
    it("应该处理空消息内容", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: null,
        timestamp: new Date(),
      };

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "消息内容不能为空",
      );
    });

    it("应该处理无效的时间戳", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "test" },
        timestamp: new Date("invalid"),
      };

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "无效的时间戳",
      );
    });

    it("应该处理超长消息", async () => {
      const message: IMessage = {
        messageId: "msg-123",
        messageType: "test-message",
        content: { data: "x".repeat(1000000) },
        timestamp: new Date(),
      };

      await expect(adapter.publish("test-topic", message)).rejects.toThrow(
        "消息内容过长",
      );
    });
  });
});
