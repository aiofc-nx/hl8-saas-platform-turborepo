/**
 * 事件处理器接口定义
 *
 * @description 定义事件处理器的核心接口和类型
 * @since 1.0.0
 */

// import type { BaseDomainEvent } from "../../../domain/events/base/index.js";

/**
 * 事件处理器接口
 *
 * @description 定义事件处理器的基本契约
 * 事件处理器负责处理特定类型的领域事件
 *
 * @template TEvent 要处理的事件类型
 */
export interface IEventHandler<TEvent = any> {
  /**
   * 处理事件
   *
   * @description 执行事件处理逻辑
   * @param event 要处理的事件
   * @returns Promise<void>
   */
  handle(event: TEvent): Promise<void>;

  /**
   * 获取处理器支持的事件类型
   *
   * @description 返回此处理器支持的事件类型名称
   * @returns 支持的事件类型名称
   */
  getSupportedEventType(): string;

  /**
   * 检查是否支持指定事件
   *
   * @description 检查处理器是否支持处理指定类型的事件
   * @param eventType 事件类型名称
   * @returns 是否支持
   */
  canHandle(eventType: string): boolean;

  /**
   * 检查是否支持指定事件类型
   *
   * @description 检查处理器是否支持处理指定类型的事件
   * @param eventType 事件类型名称
   * @returns 是否支持
   */
  supports(eventType: string): boolean;

  /**
   * 获取处理器优先级
   *
   * @description 返回处理器的优先级，用于排序
   * @returns 优先级数值
   */
  getPriority(): number;

  /**
   * 验证事件
   *
   * @description 验证事件的有效性
   * @param event 要验证的事件
   */
  validateEvent(event: TEvent): void;

  /**
   * 检查事件是否可以处理
   *
   * @description 检查事件是否可以处理
   * @param event 要检查的事件
   * @returns 是否可以处理
   */
  canHandleEvent(event: TEvent): Promise<boolean>;

  /**
   * 检查事件是否应该被忽略
   *
   * @description 检查事件是否应该被忽略
   * @param event 要检查的事件
   * @returns 是否应该被忽略
   */
  shouldIgnore(event: TEvent): Promise<boolean>;

  /**
   * 检查事件是否已处理
   *
   * @description 检查事件是否已经被处理过
   * @param event 要检查的事件
   * @returns 是否已处理
   */
  isEventProcessed(event: TEvent): Promise<boolean>;

  /**
   * 标记事件为已处理
   *
   * @description 标记事件为已处理状态
   * @param event 要标记的事件
   */
  markEventAsProcessed(event: TEvent): Promise<void>;

  /**
   * 处理事件失败
   *
   * @description 处理事件失败时的回调
   * @param event 失败的事件
   * @param error 错误信息
   */
  handleFailure(event: TEvent, error: Error): Promise<void>;

  /**
   * 获取最大重试次数
   *
   * @description 获取事件处理失败时的最大重试次数
   * @param event 事件对象
   * @returns 最大重试次数
   */
  getMaxRetries(event: TEvent): number;

  /**
   * 获取重试延迟时间
   *
   * @description 获取重试之间的延迟时间
   * @param event 事件对象
   * @param retryCount 当前重试次数
   * @returns 重试延迟时间（毫秒）
   */
  getRetryDelay(event: TEvent, retryCount: number): number;
}

/**
 * 事件处理器工厂接口
 *
 * @description 负责创建事件处理器实例
 */
export interface IEventHandlerFactory {
  /**
   * 创建事件处理器
   *
   * @description 根据事件类型创建相应的处理器实例
   * @param eventType 事件类型
   * @returns 事件处理器实例
   */
  createHandler(eventType: string): IEventHandler;

  /**
   * 检查是否支持创建指定类型的处理器
   *
   * @description 检查工厂是否支持创建指定类型的处理器
   * @param eventType 事件类型
   * @returns 是否支持
   */
  canCreateHandler(eventType: string): boolean;
}

/**
 * 事件处理器注册表接口
 *
 * @description 管理事件处理器的注册和查找
 */
export interface IEventHandlerRegistry {
  /**
   * 注册事件处理器
   *
   * @description 将事件处理器注册到注册表中
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  register(eventType: string, handler: IEventHandler): void;

  /**
   * 获取事件处理器
   *
   * @description 根据事件类型获取相应的处理器
   * @param eventType 事件类型
   * @returns 事件处理器实例
   */
  getHandler(eventType: string): IEventHandler | undefined;

  /**
   * 检查是否已注册指定类型的处理器
   *
   * @description 检查注册表中是否已注册指定类型的处理器
   * @param eventType 事件类型
   * @returns 是否已注册
   */
  hasHandler(eventType: string): boolean;

  /**
   * 注销事件处理器
   *
   * @description 从注册表中移除指定类型的处理器
   * @param eventType 事件类型
   */
  unregister(eventType: string): void;

  /**
   * 获取所有已注册的事件类型
   *
   * @description 返回所有已注册的事件类型列表
   * @returns 事件类型列表
   */
  getRegisteredEventTypes(): string[];
}

/**
 * 事件执行上下文接口
 *
 * @description 提供事件执行时的上下文信息
 */
export interface IEventExecutionContext {
  /**
   * 事件ID
   */
  eventId: string;

  /**
   * 事件类型
   */
  eventType: string;

  /**
   * 执行时间戳
   */
  timestamp: Date;

  /**
   * 租户ID（如果适用）
   */
  tenantId?: string;

  /**
   * 用户ID（如果适用）
   */
  userId?: string;

  /**
   * 执行元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * 事件执行结果接口
 *
 * @description 表示事件处理的结果
 */
export interface IEventExecutionResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 执行时间（毫秒）
   */
  executionTime: number;

  /**
   * 错误信息（如果有）
   */
  error?: string;

  /**
   * 执行元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * 事件验证器接口
 *
 * @description 负责验证事件的有效性
 */
export interface IEventValidator {
  /**
   * 验证事件
   *
   * @description 验证事件是否符合要求
   * @param event 要验证的事件
   * @returns 验证结果
   */
  validate(event: any): IEventValidationResult;
}

/**
 * 事件验证结果接口
 *
 * @description 表示事件验证的结果
 */
export interface IEventValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 错误列表
   */
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}
