/**
 * @hl8/isolation-model
 *
 * 纯领域模型库 - 多层级数据隔离
 *
 * 特性：
 * - 零依赖，框架无关
 * - DDD 充血模型设计
 * - 可在任何 TypeScript 环境使用
 *
 * @module @hl8/isolation-model
 * @since 1.0.0
 */

// 实体
export { IsolationContext } from './entities/isolation-context.entity.js';

// 值对象
export { DepartmentId } from './value-objects/department-id.vo.js';
export { EntityId } from './value-objects/entity-id.vo.js';
export { OrganizationId } from './value-objects/organization-id.vo.js';
export { TenantId } from './value-objects/tenant-id.vo.js';
export { UserId } from './value-objects/user-id.vo.js';

// 枚举
export { IsolationLevel } from './enums/isolation-level.enum.js';
export { SharingLevel } from './enums/sharing-level.enum.js';

// 接口
export type { DataAccessContext } from './interfaces/data-access-context.interface.js';
export type { IIsolationContextProvider } from './interfaces/isolation-context-provider.interface.js';
export type { IIsolationValidator } from './interfaces/isolation-validator.interface.js';

// 事件
export { DataAccessDeniedEvent } from './events/access-denied.event.js';
export { IsolationContextCreatedEvent } from './events/context-created.event.js';
export { IsolationContextSwitchedEvent } from './events/context-switched.event.js';

// 异常
export { IsolationValidationError } from './errors/isolation-validation.error.js';
