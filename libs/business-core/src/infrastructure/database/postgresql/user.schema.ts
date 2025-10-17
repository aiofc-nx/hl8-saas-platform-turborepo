/**
 * 用户数据库模式定义
 *
 * @description 定义User实体的数据库表结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 用户级数据：包含完整的隔离字段
 * - 所有用户数据必须包含完整的隔离字段
 * - 用户数据在用户级别进行隔离
 *
 * ### 用户状态规则
 * - 活跃：用户可以正常使用系统
 * - 待激活：用户已注册但未激活
 * - 禁用：用户被管理员禁用
 * - 锁定：用户因安全原因被锁定
 * - 过期：用户权限已过期
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 用户表结构
 *
 * @description 存储用户基本信息
 */
export interface UserTable {
  /** 用户唯一标识符 */
  id: EntityId;

  /** 所属平台ID */
  platform_id: EntityId;

  /** 所属租户ID */
  tenant_id: EntityId | null;

  /** 所属组织ID */
  organization_id: EntityId | null;

  /** 所属部门ID */
  department_id: EntityId | null;

  /** 用户名 */
  username: string;

  /** 邮箱地址 */
  email: string;

  /** 手机号码 */
  phone: string | null;

  /** 用户状态 */
  status: "ACTIVE" | "PENDING" | "DISABLED" | "LOCKED" | "EXPIRED";

  /** 最后登录时间 */
  last_login_at: Date | null;

  /** 最后登录IP */
  last_login_ip: string | null;

  /** 登录次数 */
  login_count: number;

  /** 失败登录次数 */
  failed_login_attempts: number;

  /** 锁定到期时间 */
  locked_until: Date | null;

  /** 密码最后修改时间 */
  password_changed_at: Date | null;

  /** 邮箱是否已验证 */
  email_verified: boolean;

  /** 手机是否已验证 */
  phone_verified: boolean;

  /** 是否启用双因素认证 */
  two_factor_enabled: boolean;

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
 * 用户角色关联表
 *
 * @description 存储用户角色关联关系
 */
export interface UserRoleTable {
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

  /** 用户ID */
  user_id: EntityId;

  /** 角色ID */
  role_id: EntityId;

  /** 角色类型 */
  role_type:
    | "PLATFORM_ADMIN"
    | "TENANT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "REGULAR_USER";

  /** 角色范围 */
  role_scope: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

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
 * 用户权限关联表
 *
 * @description 存储用户权限关联关系
 */
export interface UserPermissionTable {
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

  /** 用户ID */
  user_id: EntityId;

  /** 权限ID */
  permission_id: EntityId;

  /** 权限范围 */
  permission_scope: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

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
 * 用户事件表
 *
 * @description 存储用户相关的事件溯源数据
 */
export interface UserEventTable {
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
 * 用户快照表
 *
 * @description 存储用户聚合根的快照数据
 */
export interface UserSnapshotTable {
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
