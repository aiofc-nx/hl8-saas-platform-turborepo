/**
 * 聚合根基础设施导出
 *
 * @description 导出聚合根相关的基础类、接口和工具
 * @since 1.0.0
 */

// 基础聚合根类
export { BaseAggregateRoot } from './base-aggregate-root.js';

// 租户感知聚合根类
export { TenantAwareAggregateRoot } from './tenant-aware-aggregate-root.js';

// 聚合根接口
export type {
  IAggregateRoot,
  IAggregateRootFactory,
} from './aggregate-root.interface';

// 重新导出常用类型
export type { EntityId } from '../../value-objects/entity-id.js';
export { BaseDomainEvent } from '../../events/base/base-domain-event.js';
