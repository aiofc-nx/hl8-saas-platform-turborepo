/**
 * 事件处理器导出
 *
 * @description 导出事件处理器相关的接口和基类
 * @since 1.0.0
 */

// 事件处理器接口
export type {
  IEventHandler,
  IEventHandlerFactory,
  IEventHandlerRegistry,
  IEventExecutionContext,
  IEventExecutionResult,
  IEventValidator,
  IEventValidationResult,
} from "./event-handler.interface.js";

// 基础事件处理器
export { BaseEventHandler } from "./base-event-handler.js";
