/**
 * 领域事件基础设施导出
 *
 * @description 导出领域事件相关的基础类、接口和工具
 * @since 1.0.0
 */

// 基础领域事件类
export { BaseDomainEvent } from "./base-domain-event";

// 领域事件接口
export type {
  IDomainEvent,
  IDomainEventHandler,
  IDomainEventBus,
  IDomainEventStore,
  EventMetadata,
} from "./domain-event.interface";

// 重新导出常用类型 - 避免重复导出
// export type { EntityId } from '../../value-objects/entity-id';

// 领域事件类型别名 - 需要先导入IDomainEvent
import { IDomainEvent } from "./domain-event.interface";
export type DomainEvent = IDomainEvent;
