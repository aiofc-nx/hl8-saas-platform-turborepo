/**
 * 权限数据库模式定义
 *
 * @description 定义Permission实体的数据库表结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 权限数据：包含完整的隔离字段
 * - 所有权限数据必须包含完整的隔离字段
 * - 权限数据在平台级别进行隔离
 *
 * ### 权限范围规则
 * - 平台级权限：仅包含platformId
 * - 租户级权限：包含platformId + tenantId
 * - 组织级权限：包含platformId + tenantId + organizationId
 * - 部门级权限：包含platformId + tenantId + organizationId + departmentId
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 权限表结构
 *
 * @description 存储权限基本信息
 */
export interface PermissionTable {
  /** 权限唯一标识符 */
  id: EntityId;

  /** 所属平台ID */
  platform_id: EntityId;

  /** 权限名称 */
  name: string;

  /** 权限代码（唯一标识） */
  code: string;

  /** 权限描述 */
  description: string;

  /** CASL Subject（资源类型） */
  subject: string;

  /** CASL Action（操作类型） */
  action: string;

  /** CASL Conditions（权限条件） */
  conditions: Record<string, any>;

  /** 权限范围 */
  scope: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

  /** 可访问的字段列表 */
  fields: string[];

  /** 权限状态 */
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
 * 角色表结构
 *
 * @description 存储角色基本信息
 */
export interface RoleTable {
  /** 角色唯一标识符 */
  id: EntityId;

  /** 所属平台ID */
  platform_id: EntityId;

  /** 所属租户ID */
  tenant_id: EntityId | null;

  /** 角色名称 */
  name: string;

  /** 角色代码（唯一标识） */
  code: string;

  /** 角色描述 */
  description: string;

  /** 角色类型 */
  type: "SYSTEM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

  /** 角色级别 */
  level: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

  /** 角色状态 */
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
 * 角色权限关联表
 *
 * @description 存储角色权限关联关系
 */
export interface RolePermissionTable {
  /** 关联ID */
  id: EntityId;

  /** 平台ID */
  platform_id: EntityId;

  /** 租户ID */
  tenant_id: EntityId | null;

  /** 组织ID */
  organization_id: EntityId | null;

  /** 部门ID */
  department_id: EntityId | null;

  /** 角色ID */
  role_id: EntityId;

  /** 权限ID */
  permission_id: EntityId;

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
 * 角色继承关联表
 *
 * @description 存储角色继承关系
 */
export interface RoleInheritanceTable {
  /** 关联ID */
  id: EntityId;

  /** 平台ID */
  platform_id: EntityId;

  /** 租户ID */
  tenant_id: EntityId | null;

  /** 组织ID */
  organization_id: EntityId | null;

  /** 部门ID */
  department_id: EntityId | null;

  /** 子角色ID */
  child_role_id: EntityId;

  /** 父角色ID */
  parent_role_id: EntityId;

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
 * 权限事件表
 *
 * @description 存储权限相关的事件溯源数据
 */
export interface PermissionEventTable {
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
 * 权限快照表
 *
 * @description 存储权限聚合根的快照数据
 */
export interface PermissionSnapshotTable {
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
