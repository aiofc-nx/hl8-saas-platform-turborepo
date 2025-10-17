/**
 * 平台MongoDB文档定义
 *
 * @description 定义Platform实体的MongoDB文档结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 平台级数据：仅包含platformId
 * - 所有平台数据必须包含platformId字段
 * - 平台数据在平台级别进行隔离
 *
 * ### 审计规则
 * - 所有文档必须包含审计字段（createdAt, updatedAt, createdBy, updatedBy）
 * - 审计信息必须记录完整的操作上下文
 * - 数据变更必须记录审计日志
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 平台文档结构
 *
 * @description 存储平台基本信息
 */
export interface PlatformDocument {
  /** 平台唯一标识符 */
  _id: EntityId;
  
  /** 平台名称 */
  name: string;
  
  /** 平台描述 */
  description: string;
  
  /** 平台域名 */
  domain: string;
  
  /** 平台状态 */
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  
  /** 平台配置（JSON格式） */
  settings: Record<string, any>;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
  
  /** 创建者ID */
  createdBy: EntityId;
  
  /** 更新者ID */
  updatedBy: EntityId;
  
  /** 版本号（用于乐观锁） */
  version: number;
}

/**
 * 平台用户关联文档
 *
 * @description 存储平台用户关联关系
 */
export interface PlatformUserDocument {
  /** 关联ID */
  _id: EntityId;
  
  /** 平台ID */
  platformId: EntityId;
  
  /** 用户ID */
  userId: EntityId;
  
  /** 用户角色 */
  role: "PLATFORM_ADMIN" | "PLATFORM_USER";

  /** 关联状态 */
  status: "ACTIVE" | "INACTIVE";
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
  
  /** 创建者ID */
  createdBy: EntityId;
  
  /** 更新者ID */
  updatedBy: EntityId;
}

/**
 * 平台事件文档
 *
 * @description 存储平台相关的事件溯源数据
 */
export interface PlatformEventDocument {
  /** 事件ID */
  _id: EntityId;
  
  /** 聚合根ID */
  aggregateId: EntityId;
  
  /** 事件类型 */
  eventType: string;
  
  /** 事件数据 */
  eventData: Record<string, any>;
  
  /** 事件版本 */
  eventVersion: number;
  
  /** 事件时间戳 */
  occurredAt: Date;
  
  /** 事件元数据 */
  metadata: Record<string, any>;
}

/**
 * 平台快照文档
 *
 * @description 存储平台聚合根的快照数据
 */
export interface PlatformSnapshotDocument {
  /** 快照ID */
  _id: EntityId;
  
  /** 聚合根ID */
  aggregateId: EntityId;
  
  /** 快照数据 */
  snapshotData: Record<string, any>;
  
  /** 快照版本 */
  snapshotVersion: number;
  
  /** 快照时间戳 */
  createdAt: Date;
}
