/**
 * 事件总线接口
 *
 * @description 定义事件发布和订阅的接口，支持领域事件的异步处理
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
 * // 发布事件
 * await eventBus.publishAll(events);
 * await eventBus.publish(userCreatedEvent);
 *
 * // 订阅事件
 * await eventBus.subscribe('UserCreated', userCreatedHandler);
 * await eventBus.unsubscribe('UserCreated', userCreatedHandler);
 * ```
 *
 * @since 1.0.0
 */

import type { DomainEvent } from "../../domain/events/base/domain-event.js";
import type { IEventHandler } from "./event-handler.interface.js";

/**
 * 事件总线接口
 *
 * @description 定义事件发布和订阅的接口，支持领域事件的异步处理
 */
export interface IEventBus {
  /**
   * 发布所有事件
   *
   * @description 批量发布领域事件列表
   *
   * @param events - 领域事件列表
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * const events = aggregate.getUncommittedEvents();
   * await eventBus.publishAll(events);
   * ```
   */
  publishAll(events: DomainEvent[]): Promise<void>;

  /**
   * 发布单个事件
   *
   * @description 发布单个领域事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await eventBus.publish(userCreatedEvent);
   * ```
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * 订阅事件
   *
   * @description 订阅指定类型的事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await eventBus.subscribe('UserCreated', userCreatedHandler);
   * ```
   */
  subscribe(eventType: string, handler: IEventHandler): Promise<void>;

  /**
   * 取消订阅
   *
   * @description 取消订阅指定类型的事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await eventBus.unsubscribe('UserCreated', userCreatedHandler);
   * ```
   */
  unsubscribe(eventType: string, handler: IEventHandler): Promise<void>;

  /**
   * 获取事件处理器
   *
   * @description 获取指定事件类型的所有处理器
   *
   * @param eventType - 事件类型
   * @returns 事件处理器列表
   */
  getHandlers(eventType: string): IEventHandler[];

  /**
   * 清空所有订阅
   *
   * @description 清空所有事件订阅
   *
   * @returns Promise<void>
   */
  clear(): Promise<void>;
}
