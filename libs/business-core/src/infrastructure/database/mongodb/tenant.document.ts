/**
 * 租户MongoDB文档定义
 *
 * @description 定义Tenant实体的MongoDB文档结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 租户级数据：包含platformId + tenantId
 * - 所有租户数据必须包含platformId和tenantId字段
 * - 租户数据在租户级别进行隔离
 *
 * ### 租户类型规则
 * - 企业租户：支持完整的组织架构和权限管理
 * - 社群租户：支持基本的用户管理和权限控制
 * - 团队租户：支持小团队协作和项目管理
 * - 个人租户：支持个人使用和基本功能
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 租户文档结构
 *
 * @description 存储租户基本信息
 */
export interface TenantDocument {
  /** 租户唯一标识符 */
  _id: EntityId;

  /** 所属平台ID */
  platformId: EntityId;

  /** 租户名称 */
  name: string;

  /** 租户类型 */
  type: "ENTERPRISE" | "COMMUNITY" | "TEAM" | "PERSONAL";

  /** 租户状态 */
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";

  /** 租户配置（JSON格式） */
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
 * 租户用户关联文档
 *
 * @description 存储租户用户关联关系
 */
export interface TenantUserDocument {
  /** 关联ID */
  _id: EntityId;

  /** 平台ID */
  platformId: EntityId;

  /** 租户ID */
  tenantId: EntityId;

  /** 用户ID */
  userId: EntityId;

  /** 用户角色 */
  role: "TENANT_ADMIN" | "TENANT_USER";

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
 * 租户事件文档
 *
 * @description 存储租户相关的事件溯源数据
 */
export interface TenantEventDocument {
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
 * 租户快照文档
 *
 * @description 存储租户聚合根的快照数据
 */
export interface TenantSnapshotDocument {
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
