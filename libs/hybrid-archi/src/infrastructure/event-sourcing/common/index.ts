/**
 * 通用事件溯源组件导出
 *
 * @description 导出通用事件溯源组件相关的所有公共API
 * @since 1.0.0
 */

// 事件存储
export * from "./event-store.interface.js";
export { EventStoreImplementation } from "../event-store.implementation.js";

// 快照存储
export * from "./snapshot-store.interface.js";
export { SnapshotStoreImplementation } from "../snapshot-store.implementation.js";
