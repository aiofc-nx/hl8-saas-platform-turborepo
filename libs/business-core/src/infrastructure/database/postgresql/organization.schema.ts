/**
 * 组织数据库模式定义
 *
 * @description 定义Organization实体的数据库表结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 组织级数据：包含platformId + tenantId + organizationId
 * - 所有组织数据必须包含完整的隔离字段
 * - 组织数据在组织级别进行隔离
 *
 * ### 组织类型规则
 * - 专业委员会：负责特定领域的决策和管理
 * - 项目管理团队：负责项目执行和协调
 * - 质量控制小组：负责质量管理和监督
 * - 绩效管理小组：负责绩效评估和改进
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 组织表结构
 *
 * @description 存储组织基本信息
 */
export interface OrganizationTable {
  /** 组织唯一标识符 */
  id: EntityId;

  /** 所属平台ID */
  platform_id: EntityId;

  /** 所属租户ID */
  tenant_id: EntityId;

  /** 组织名称 */
  name: string;

  /** 组织类型 */
  type: "COMMITTEE" | "PROJECT_TEAM" | "QUALITY_GROUP" | "PERFORMANCE_GROUP";

  /** 组织描述 */
  description: string;

  /** 组织状态 */
  status: "ACTIVE" | "INACTIVE";

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
 * 组织用户关联表
 *
 * @description 存储组织用户关联关系
 */
export interface OrganizationUserTable {
  /** 关联ID */
  id: EntityId;

  /** 平台ID */
  platform_id: EntityId;

  /** 租户ID */
  tenant_id: EntityId;

  /** 组织ID */
  organization_id: EntityId;

  /** 用户ID */
  user_id: EntityId;

  /** 用户角色 */
  role: "ORGANIZATION_ADMIN" | "ORGANIZATION_USER";

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
 * 组织事件表
 *
 * @description 存储组织相关的事件溯源数据
 */
export interface OrganizationEventTable {
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
 * 组织快照表
 *
 * @description 存储组织聚合根的快照数据
 */
export interface OrganizationSnapshotTable {
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
