/**
 * 平台数据库模式定义
 *
 * @description 定义Platform实体的数据库表结构
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
 * - 所有表必须包含审计字段（created_at, updated_at, created_by, updated_by）
 * - 审计信息必须记录完整的操作上下文
 * - 数据变更必须记录审计日志
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 平台表结构
 *
 * @description 存储平台基本信息
 */
export interface PlatformTable {
  /** 平台唯一标识符 */
  id: EntityId;

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
  created_at: Date;

  /** 更新时间 */
  updated_at: Date;

  /** 创建者ID */
  created_by: EntityId;

  /** 更新者ID */
  updated_by: EntityId;

  /** 版本号（用于乐观锁） */
  version: number;
}

/**
 * 平台用户关联表
 *
 * @description 存储平台用户关联关系
 */
export interface PlatformUserTable {
  /** 关联ID */
  id: EntityId;

  /** 平台ID */
  platform_id: EntityId;

  /** 用户ID */
  user_id: EntityId;

  /** 用户角色 */
  role: "PLATFORM_ADMIN" | "PLATFORM_USER";

  /** 关联状态 */
  status: "ACTIVE" | "INACTIVE";

  /** 创建时间 */
  created_at: Date;

  /** 更新时间 */
  updated_at: Date;

  /** 创建者ID */
  created_by: EntityId;

  /** 更新者ID */
  updated_by: EntityId;
}

/**
 * 平台事件表
 *
 * @description 存储平台相关的事件溯源数据
 */
export interface PlatformEventTable {
  /** 事件ID */
  id: EntityId;

  /** 聚合根ID */
  aggregate_id: EntityId;

  /** 事件类型 */
  event_type: string;

  /** 事件数据 */
  event_data: Record<string, any>;

  /** 事件版本 */
  event_version: number;

  /** 事件时间戳 */
  occurred_at: Date;

  /** 事件元数据 */
  metadata: Record<string, any>;
}

/**
 * 平台快照表
 *
 * @description 存储平台聚合根的快照数据
 */
export interface PlatformSnapshotTable {
  /** 快照ID */
  id: EntityId;

  /** 聚合根ID */
  aggregate_id: EntityId;

  /** 快照数据 */
  snapshot_data: Record<string, any>;

  /** 快照版本 */
  snapshot_version: number;

  /** 快照时间戳 */
  created_at: Date;
}
