/**
 * 事件总线实现
 *
 * @description 实现事件发布和订阅的功能，支持领域事件的异步处理
 *
 * ## 业务规则
 *
 * ### 事件发布规则
 * - 事件发布应该是异步的，不阻塞主业务流程
 * - 事件发布失败不应该影响主要业务逻辑
 * - 事件发布应该支持批量发布
 * - 事件发布应该支持单个事件发布
 *
 * ### 事件订阅规则
 * - 支持按事件类型订阅
 * - 支持多个处理器订阅同一事件
 * - 支持订阅和取消订阅
 * - 事件处理器应该是幂等的
 *
 * ### 事件处理规则
 * - 事件处理应该是异步的
 * - 事件处理失败应该有重试机制
 * - 事件处理应该有超时机制
 * - 事件处理应该有死信队列机制
 *
 * @example
 * ```typescript
 * // 创建事件总线
 * const eventBus = new EventBus(logger);
 *
 * // 订阅事件
 * await eventBus.subscribe('UserCreated', userCreatedHandler);
 *
 * // 发布事件
 * await eventBus.publishAll(events);
 * ```
 *
 * @since 1.0.0
 */

import type { IEventBus } from "./event-bus.interface.js";
import type { IEventHandler } from "./event-handler.interface.js";
import type { DomainEvent } from "../../domain/events/base/domain-event.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 事件总线实现
 *
 * @description 实现事件发布和订阅的功能，支持领域事件的异步处理
 */
export class EventBus implements IEventBus {
  private readonly handlers = new Map<string, IEventHandler[]>();
  private readonly logger: FastifyLoggerService;

  constructor(logger: FastifyLoggerService) {
    this.logger = logger;
  }

  /**
   * 发布所有事件
   *
   * @description 批量发布领域事件列表
   *
   * @param events - 领域事件列表
   * @returns Promise<void>
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    this.logger.debug(`开始发布 ${events.length} 个事件`);

    // 并发发布所有事件
    const publishPromises = events.map((event) => this.publish(event));

    try {
      await Promise.all(publishPromises);
      this.logger.info(`成功发布 ${events.length} 个事件`);
    } catch (error) {
      this.logger.error("批量发布事件失败", {
        error: error.message,
        eventCount: events.length,
      });
      throw error;
    }
  }

  /**
   * 发布单个事件
   *
   * @description 发布单个领域事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   */
  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.getHandlers(eventType);

    if (handlers.length === 0) {
      this.logger.debug(`没有找到事件类型 ${eventType} 的处理器`);
      return;
    }

    this.logger.debug(
      `开始处理事件 ${eventType}，找到 ${handlers.length} 个处理器`,
    );

    // 并发处理所有处理器
    const handlerPromises = handlers.map((handler) =>
      this.handleEvent(handler, event),
    );

    try {
      await Promise.all(handlerPromises);
      this.logger.debug(`事件 ${eventType} 处理完成`);
    } catch (error) {
      this.logger.error(`事件 ${eventType} 处理失败`, { error: error.message });
      throw error;
    }
  }

  /**
   * 订阅事件
   *
   * @description 订阅指定类型的事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @returns Promise<void>
   */
  async subscribe(eventType: string, handler: IEventHandler): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;

    // 检查是否已经订阅
    if (handlers.includes(handler)) {
      this.logger.warn(
        `处理器 ${handler.getName()} 已经订阅了事件类型 ${eventType}`,
      );
      return;
    }

    handlers.push(handler);

    // 按优先级排序
    handlers.sort((a, b) => a.getPriority() - b.getPriority());

    this.logger.info(`处理器 ${handler.getName()} 订阅事件类型 ${eventType}`);
  }

  /**
   * 取消订阅
   *
   * @description 取消订阅指定类型的事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @returns Promise<void>
   */
  async unsubscribe(eventType: string, handler: IEventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (!handlers) {
      this.logger.warn(`事件类型 ${eventType} 没有订阅的处理器`);
      return;
    }

    const index = handlers.indexOf(handler);
    if (index === -1) {
      this.logger.warn(
        `处理器 ${handler.getName()} 没有订阅事件类型 ${eventType}`,
      );
      return;
    }

    handlers.splice(index, 1);

    // 如果没有处理器了，删除事件类型
    if (handlers.length === 0) {
      this.handlers.delete(eventType);
    }

    this.logger.info(
      `处理器 ${handler.getName()} 取消订阅事件类型 ${eventType}`,
    );
  }

  /**
   * 获取事件处理器
   *
   * @description 获取指定事件类型的所有处理器
   *
   * @param eventType - 事件类型
   * @returns 事件处理器列表
   */
  getHandlers(eventType: string): IEventHandler[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * 清空所有订阅
   *
   * @description 清空所有事件订阅
   *
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    this.handlers.clear();
    this.logger.info("已清空所有事件订阅");
  }

  /**
   * 处理事件
   *
   * @description 使用指定处理器处理事件
   *
   * @param handler - 事件处理器
   * @param event - 领域事件
   * @private
   */
  private async handleEvent(
    handler: IEventHandler,
    event: DomainEvent,
  ): Promise<void> {
    try {
      this.logger.debug(
        `处理器 ${handler.getName()} 开始处理事件 ${event.constructor.name}`,
      );

      await handler.handle(event);

      this.logger.debug(
        `处理器 ${handler.getName()} 成功处理事件 ${event.constructor.name}`,
      );
    } catch (error) {
      this.logger.error(`处理器 ${handler.getName()} 处理事件失败`, {
        eventType: event.constructor.name,
        handlerName: handler.getName(),
        error: error.message,
      });
      throw error;
    }
  }
}
