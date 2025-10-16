/**
 * 实体基础设施导出
 *
 * @description 导出实体相关的基础类、接口和工具
 * @since 1.0.0
 */

// 基础实体接口
export type { IBaseEntity } from "./base-entity.interface.js";

// 实体接口
export type {
  IEntity,
  IEntityFactory,
  IEntitySpecification,
  IEntityValidator,
  IEntityValidationResult,
  IEntityAuditInfo,
} from "./entity.interface.js";

// 基础实体类
export { BaseEntity } from "./base-entity.js";

// 审计信息
export type { IAuditInfo, IPartialAuditInfo } from "./audit-info.js";
export { AuditInfoBuilder } from "./audit-info.js";

// 重新导出常用类型
export type { EntityId } from "@hl8/isolation-model";
