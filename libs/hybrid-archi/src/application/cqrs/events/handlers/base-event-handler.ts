/**
 * 基础事件处理器
 *
 * @description 提供事件处理器的通用实现
 * @since 1.0.0
 */

// import type { BaseDomainEvent } from "../../../domain/events/base/index.js";
import type { IEventHandler } from "./event-handler.interface.js";

/**
 * 基础事件处理器抽象类
 *
 * @description 为事件处理器提供通用实现
 * 子类需要实现具体的处理逻辑
 *
 * @template TEvent 要处理的事件类型
 */
export abstract class BaseEventHandler<TEvent = any>
  implements IEventHandler<TEvent>
{
  /**
   * 支持的事件类型
   */
  protected readonly supportedEventType: string;

  /**
   * 构造函数
   *
   * @param supportedEventType 支持的事件类型
   */
  constructor(supportedEventType: string) {
    this.supportedEventType = supportedEventType;
  }

  /**
   * 处理事件
   *
   * @description 执行事件处理逻辑
   * @param event 要处理的事件
   * @returns Promise<void>
   */
  public async handle(event: TEvent): Promise<void> {
    // 验证事件类型
    if (!this.canHandle(event.constructor.name)) {
      throw new Error(
        `事件处理器不支持处理事件类型: ${event.constructor.name}`
      );
    }

    // 执行具体的处理逻辑
    await this.execute(event);
  }

  /**
   * 获取处理器支持的事件类型
   *
   * @description 返回此处理器支持的事件类型名称
   * @returns 支持的事件类型名称
   */
  public getSupportedEventType(): string {
    return this.supportedEventType;
  }

  /**
   * 检查是否支持指定事件
   *
   * @description 检查处理器是否支持处理指定类型的事件
   * @param eventType 事件类型名称
   * @returns 是否支持
   */
  public canHandle(eventType: string): boolean {
    return this.supportedEventType === eventType;
  }

  /**
   * 检查是否支持指定事件类型
   *
   * @description 检查处理器是否支持处理指定类型的事件
   * @param eventType 事件类型名称
   * @returns 是否支持
   */
  public supports(eventType: string): boolean {
    return this.supportedEventType === eventType;
  }

  /**
   * 获取处理器优先级
   *
   * @description 返回处理器的优先级，用于排序
   * @returns 优先级数值
   */
  public getPriority(): number {
    return 0; // 默认优先级
  }

  /**
   * 验证事件
   *
   * @description 验证事件的有效性
   * @param event 要验证的事件
   */
  public validateEvent(event: TEvent): void {
    // 默认实现：不进行特殊验证
  }

  /**
   * 检查事件是否可以处理
   *
   * @description 检查事件是否可以处理
   * @param event 要检查的事件
   * @returns 是否可以处理
   */
  public async canHandleEvent(event: TEvent): Promise<boolean> {
    return this.canHandle(event.constructor.name);
  }

  /**
   * 检查事件是否应该被忽略
   *
   * @description 检查事件是否应该被忽略
   * @param event 要检查的事件
   * @returns 是否应该被忽略
   */
  public async shouldIgnore(event: TEvent): Promise<boolean> {
    return false; // 默认不忽略
  }

  /**
   * 检查事件是否已处理
   *
   * @description 检查事件是否已经被处理过
   * @param event 要检查的事件
   * @returns 是否已处理
   */
  public async isEventProcessed(event: TEvent): Promise<boolean> {
    return false; // 默认未处理
  }

  /**
   * 标记事件为已处理
   *
   * @description 标记事件为已处理状态
   * @param event 要标记的事件
   */
  public async markEventAsProcessed(event: TEvent): Promise<void> {
    // 默认实现：不进行特殊处理
  }

  /**
   * 处理事件失败
   *
   * @description 处理事件失败时的回调
   * @param event 失败的事件
   * @param error 错误信息
   */
  public async handleFailure(event: TEvent, error: Error): Promise<void> {
    // 默认实现：记录错误
    console.error(`Event handling failed: ${error.message}`, event);
  }

  /**
   * 获取最大重试次数
   *
   * @description 获取事件处理失败时的最大重试次数
   * @param event 事件对象
   * @returns 最大重试次数
   */
  public getMaxRetries(event: TEvent): number {
    return 3; // 默认重试3次
  }

  /**
   * 获取重试延迟时间
   *
   * @description 获取重试之间的延迟时间
   * @param event 事件对象
   * @param retryCount 当前重试次数
   * @returns 重试延迟时间（毫秒）
   */
  public getRetryDelay(event: TEvent, retryCount: number): number {
    return Math.pow(2, retryCount) * 1000; // 指数退避
  }

  /**
   * 执行具体的处理逻辑
   *
   * @description 子类需要实现此方法来定义具体的处理逻辑
   * @param event 要处理的事件
   * @returns Promise<void>
   */
  protected abstract execute(event: TEvent): Promise<void>;
}
