/**
 * 事件处理器接口
 *
 * @description 定义事件处理器的接口，支持领域事件的处理
 *
 * ## 业务规则
 *
 * ### 事件处理规则
 * - 事件处理应该是幂等的
 * - 事件处理应该是异步的
 * - 事件处理失败应该有重试机制
 * - 事件处理应该有超时机制
 *
 * ### 事件处理职责
 * - 处理领域事件
 * - 执行业务逻辑
 * - 发布后续事件
 * - 记录处理日志
 *
 * ### 错误处理规则
 * - 事件处理失败应该记录错误日志
 * - 事件处理失败应该支持重试
 * - 事件处理失败应该支持死信队列
 * - 事件处理失败不应该影响其他处理器
 *
 * @example
 * ```typescript
 * export class UserCreatedEventHandler implements IEventHandler {
 *   async handle(event: UserCreatedEvent): Promise<void> {
 *     // 处理用户创建事件
 *     await this.sendWelcomeEmail(event.email);
 *     await this.logUserCreation(event);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import type { DomainEvent } from "../../domain/events/base/domain-event.js";

/**
 * 事件处理器接口
 *
 * @description 定义事件处理器的接口，支持领域事件的处理
 */
export interface IEventHandler {
  /**
   * 处理事件
   *
   * @description 处理领域事件
   *
   * @param event - 领域事件
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * await handler.handle(userCreatedEvent);
   * ```
   */
  handle(event: DomainEvent): Promise<void>;

  /**
   * 获取支持的事件类型
   *
   * @description 获取此处理器支持的事件类型列表
   *
   * @returns 支持的事件类型列表
   *
   * @example
   * ```typescript
   * const supportedTypes = handler.getSupportedEventTypes();
   * // ['UserCreated', 'UserUpdated']
   * ```
   */
  getSupportedEventTypes(): string[];

  /**
   * 检查是否支持事件类型
   *
   * @description 检查此处理器是否支持指定的事件类型
   *
   * @param eventType - 事件类型
   * @returns 是否支持
   *
   * @example
   * ```typescript
   * const isSupported = handler.supportsEventType('UserCreated');
   * // true
   * ```
   */
  supportsEventType(eventType: string): boolean;

  /**
   * 获取处理器名称
   *
   * @description 获取事件处理器的名称
   *
   * @returns 处理器名称
   *
   * @example
   * ```typescript
   * const name = handler.getName();
   * // 'UserCreatedEventHandler'
   * ```
   */
  getName(): string;

  /**
   * 获取处理器优先级
   *
   * @description 获取事件处理器的优先级，数字越小优先级越高
   *
   * @returns 优先级
   *
   * @example
   * ```typescript
   * const priority = handler.getPriority();
   * // 1
   * ```
   */
  getPriority(): number;
}
