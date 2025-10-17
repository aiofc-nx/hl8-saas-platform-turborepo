/**
 * 用户MongoDB文档定义
 *
 * @description 定义User实体的MongoDB文档结构
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
 * 用户文档结构
 *
 * @description 存储用户基本信息
 */
export interface UserDocument {
  /** 用户唯一标识符 */
  _id: EntityId;

  /** 所属平台ID */
  platformId: EntityId;

  /** 所属租户ID */
  tenantId: EntityId | null;

  /** 所属组织ID */
  organizationId: EntityId | null;

  /** 所属部门ID */
  departmentId: EntityId | null;

  /** 用户名 */
  username: string;

  /** 邮箱地址 */
  email: string;

  /** 手机号码 */
  phone: string | null;

  /** 用户状态 */
  status: "ACTIVE" | "PENDING" | "DISABLED" | "LOCKED" | "EXPIRED";

  /** 最后登录时间 */
  lastLoginAt: Date | null;

  /** 最后登录IP */
  lastLoginIp: string | null;

  /** 登录次数 */
  loginCount: number;

  /** 失败登录次数 */
  failedLoginAttempts: number;

  /** 锁定到期时间 */
  lockedUntil: Date | null;

  /** 密码最后修改时间 */
  passwordChangedAt: Date | null;

  /** 邮箱是否已验证 */
  emailVerified: boolean;

  /** 手机是否已验证 */
  phoneVerified: boolean;

  /** 是否启用双因素认证 */
  twoFactorEnabled: boolean;

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
 * 用户角色关联文档
 *
 * @description 存储用户角色关联关系
 */
export interface UserRoleDocument {
  /** 关联ID */
  _id: EntityId;

  /** 平台ID */
  platformId: EntityId;

  /** 租户ID */
  tenantId: EntityId | null;

  /** 组织ID */
  organizationId: EntityId | null;

  /** 部门ID */
  departmentId: EntityId | null;

  /** 用户ID */
  userId: EntityId;

  /** 角色ID */
  roleId: EntityId;

  /** 角色类型 */
  roleType:
    | "PLATFORM_ADMIN"
    | "TENANT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "REGULAR_USER";

  /** 角色范围 */
  roleScope: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

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
 * 用户权限关联文档
 *
 * @description 存储用户权限关联关系
 */
export interface UserPermissionDocument {
  /** 关联ID */
  _id: EntityId;

  /** 平台ID */
  platformId: EntityId;

  /** 租户ID */
  tenantId: EntityId | null;

  /** 组织ID */
  organizationId: EntityId | null;

  /** 部门ID */
  departmentId: EntityId | null;

  /** 用户ID */
  userId: EntityId;

  /** 权限ID */
  permissionId: EntityId;

  /** 权限范围 */
  permissionScope: "PLATFORM" | "TENANT" | "ORGANIZATION" | "DEPARTMENT";

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
 * 用户事件文档
 *
 * @description 存储用户相关的事件溯源数据
 */
export interface UserEventDocument {
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
 * 用户快照文档
 *
 * @description 存储用户聚合根的快照数据
 */
export interface UserSnapshotDocument {
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
