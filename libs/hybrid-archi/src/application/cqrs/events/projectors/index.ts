/**
 * 事件投射器导出
 *
 * @description 导出事件投射器相关的接口和基类
 * @since 1.0.0
 */

// 投射器接口
export type {
  IEventProjector,
  IReadModelProjector,
  IProjectorManager,
  IProjectionExecutionContext,
  IProjectionExecutionResult,
} from "./event-projector.interface.js";

// 基础投射器
export {
  BaseEventProjector,
  BaseReadModelProjector,
} from "./base-event-projector.js";

// 投射器管理器
export { ProjectorManager } from "./projector-manager.js";
