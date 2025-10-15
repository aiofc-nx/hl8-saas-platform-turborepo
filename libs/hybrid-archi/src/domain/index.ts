/**
 * 领域层导出
 *
 * @description 导出领域层相关的所有公共API
 * 专注于提供业务模块所需的通用功能组件
 * @since 1.0.0
 */

// 值对象系统（基础组件，被其他组件引用）
export * from "./value-objects.js";

// 实体系统 - 避免重复导出 EntityId
export { BaseEntity } from "./entities.js";
export type { IEntity, IAuditInfo, IPartialAuditInfo } from "./entities.js";

// 聚合根系统（基础组件和装饰器）- 避免重复导出 EntityId
export { BaseAggregateRoot, TenantAwareAggregateRoot } from "./aggregates.js";
export type { IAggregateRoot, IAggregateRootFactory } from "./aggregates.js";

// 领域服务系统 - 避免重复导出 EntityId
export { BaseDomainService } from "./services.js";
export type { IDomainService } from "./services.js";

// 领域事件系统
export * from "./events.js";

// 仓储接口系统
export * from "./repositories.js";

// 领域异常系统
export * from "./exceptions.js";

// 验证系统（通用功能组件）
export * from "./validation.js";

// 安全系统（通用功能组件）
export * from "./security.js";

// 业务规则系统（通用功能组件）
export * from "./rules.js";
