/**
 * Core模块对外类型导出
 *
 * @description 为其他模块提供Core模块的核心类型接口
 * 确保类型的一致性和可用性
 *
 * @since 1.0.0
 */

// ==================== 多租户相关类型 ====================
// 已迁移到 @hl8/multi-tenancy 模块，请使用以下导入：
// import { any, any, TenantIsolationService } from '@hl8/nestjs-isolation';

// ==================== 性能监控相关类型 ====================
// 已迁移到 @hl8/logger 模块，请使用以下导入：
// import { Logger, LoggerModule } from '@hl8/nestjs-fastify';

// ==================== 事件总线相关类型 ====================

// 事件总线
export { EventBus } from "../application/cqrs/bus/event-bus";

// CQRS总线
export { CQRSBus } from "../application/cqrs/bus/cqrs-bus";

// ==================== 错误处理相关类型 ====================
// 已迁移到 @hl8/common 模块，请使用以下导入：
// import { BadRequestException } from '@nestjs/common';

// ==================== 实体和值对象类型 ====================

// 基础实体
export { BaseEntity } from "../domain/entities/base";
export { BaseAggregateRoot } from "../domain/aggregates/base";

// 实体ID
export { EntityId } from "@hl8/isolation-model";

// ==================== 配置集成类型 ====================
// 已迁移到 @hl8/config 模块，请使用以下导入：
// // import { $1 } from '@hl8/nestjs-fastify'; // TODO: 需要实现
