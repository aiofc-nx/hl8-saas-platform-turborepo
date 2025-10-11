/**
 * @hl8/platform - HL8 平台核心业务逻辑
 *
 * @description 纯业务逻辑层，无框架依赖
 * 包含领域模型、值对象、实体、枚举、类型定义
 *
 * @packageDocumentation
 */

// ===== 值对象 (Value Objects) =====
export { EntityId } from './shared/value-objects/entity-id.vo.js';
export { TenantId } from './shared/value-objects/tenant-id.vo.js';
export { OrganizationId } from './shared/value-objects/organization-id.vo.js';
export { DepartmentId } from './shared/value-objects/department-id.vo.js';
export { UserId } from './shared/value-objects/user-id.vo.js';

// ===== 实体 (Entities) =====
export { IsolationContext } from './shared/entities/isolation-context.entity.js';

// ===== 枚举 (Enums) =====
export { IsolationLevel } from './shared/enums/isolation-level.enum.js';
export { DataSharingLevel } from './shared/enums/data-sharing-level.enum.js';

// ===== 类型 (Types) =====
export type {
  DeepPartial,
  DeepReadonly,
  Nullable,
  Optional,
  Constructor,
  AbstractConstructor,
  AnyFunction,
  AsyncFunction,
  ValueOf,
  Mutable,
  RequiredKeys,
  OptionalKeys,
} from './shared/types/shared.types.js';

// 版本信息
export const version = '0.1.0';

