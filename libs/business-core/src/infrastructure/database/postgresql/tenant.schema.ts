/**
 * 租户数据库模式定义
 *
 * @description 定义Tenant实体的数据库表结构
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
 * 租户表结构
 *
 * @description 存储租户基本信息
 */
export interface TenantTable {
  /** 租户唯一标识符 */
  id: EntityId;
  
  /** 所属平台ID */
  platform_id: EntityId;
  
  /** 租户名称 */
  name: string;
  
  /** 租户类型 */
  type: "ENTERPRISE" | "COMMUNITY" | "TEAM" | "PERSONAL";

  /** 租户状态 */
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  
  /** 租户配置（JSON格式） */
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
 * 租户用户关联表
 *
 * @description 存储租户用户关联关系
 */
export interface TenantUserTable {
  /** 关联ID */
  id: EntityId;
  
  /** 平台ID */
  platform_id: EntityId;
  
  /** 租户ID */
  tenant_id: EntityId;
  
  /** 用户ID */
  user_id: EntityId;
  
  /** 用户角色 */
  role: "TENANT_ADMIN" | "TENANT_USER";

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
 * 租户事件表
 *
 * @description 存储租户相关的事件溯源数据
 */
export interface TenantEventTable {
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
 * 租户快照表
 *
 * @description 存储租户聚合根的快照数据
 */
export interface TenantSnapshotTable {
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
