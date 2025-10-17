/**
 * 聚合根基础设施导出
 *
 * @description 导出聚合根相关的基础类、接口和工具
 * @since 1.0.0
 */

// 基础聚合根类
export { BaseAggregateRoot } from "./base-aggregate-root.js";

// 隔离感知聚合根类
export { IsolationAwareAggregateRoot } from "./isolation-aware-aggregate-root.js";

// 聚合根接口
export type {
  IAggregateRoot,
  IAggregateRootFactory,
} from "./aggregate-root.interface.js";

// 重新导出常用类型
export type { EntityId } from "@hl8/isolation-model";
export { BaseDomainEvent } from "../../events/base/base-domain-event.js";
