/**
 * 身份认证数据库模式定义
 *
 * @description 定义Authentication实体的数据库表结构
 * 支持多租户数据隔离和事件溯源
 *
 * ## 业务规则
 *
 * ### 数据隔离规则
 * - 认证数据：包含完整的隔离字段
 * - 所有认证数据必须包含完整的隔离字段
 * - 认证数据在用户级别进行隔离
 *
 * ### 认证类型规则
 * - 密码认证：传统的用户名密码认证
 * - OAuth认证：第三方OAuth认证
 * - SSO认证：单点登录认证
 * - MFA认证：多因素认证
 *
 * @since 1.0.0
 */

import type { EntityId } from "@hl8/isolation-model";

/**
 * 身份认证表结构
 *
 * @description 存储用户身份认证信息
 */
export interface AuthenticationTable {
  /** 认证记录唯一标识符 */
  id: EntityId;
  
  /** 所属平台ID */
  platform_id: EntityId;
  
  /** 所属租户ID */
  tenant_id: EntityId | null;
  
  /** 关联用户ID */
  user_id: EntityId;
  
  /** 认证类型 */
  auth_type: "PASSWORD" | "OAUTH" | "SSO" | "MFA";

  /** 认证状态 */
  status: "ACTIVE" | "LOCKED" | "EXPIRED" | "DISABLED";
  
  /** 最后登录时间 */
  last_login_at: Date | null;
  
  /** 最后登录IP */
  last_login_ip: string | null;
  
  /** 登录尝试次数 */
  login_attempts: number;
  
  /** 锁定到期时间 */
  locked_until: Date | null;
  
  /** 认证过期时间 */
  expires_at: Date | null;
  
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
 * 认证凭据表结构
 *
 * @description 存储用户认证凭据信息
 */
export interface AuthCredentialsTable {
  /** 凭据记录唯一标识符 */
  id: EntityId;
  
  /** 认证记录ID */
  auth_id: EntityId;
  
  /** 密码哈希值 */
  password_hash: string | null;
  
  /** 密码盐值 */
  salt: string | null;
  
  /** OAuth提供商信息（JSON格式） */
  oauth_providers: Record<string, any> | null;
  
  /** 多因素认证密钥 */
  mfa_secret: string | null;
  
  /** 是否启用多因素认证 */
  mfa_enabled: boolean;
  
  /** 备用验证码 */
  backup_codes: string[] | null;
  
  /** SSO提供商 */
  sso_provider: string | null;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

/**
 * 认证会话表结构
 *
 * @description 存储用户认证会话信息
 */
export interface AuthSessionTable {
  /** 会话唯一标识符 */
  id: EntityId;
  
  /** 关联用户ID */
  user_id: EntityId;
  
  /** 关联认证记录ID */
  auth_id: EntityId;
  
  /** 会话令牌 */
  session_token: string;
  
  /** 刷新令牌 */
  refresh_token: string | null;
  
  /** 访问令牌 */
  access_token: string | null;
  
  /** 设备信息（JSON格式） */
  device_info: Record<string, any>;
  
  /** IP地址 */
  ip_address: string;
  
  /** 用户代理 */
  user_agent: string;
  
  /** 会话状态 */
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  
  /** 会话过期时间 */
  expires_at: Date;
  
  /** 最后活动时间 */
  last_activity_at: Date;
  
  /** 创建时间 */
  created_at: Date;
  
  /** 更新时间 */
  updated_at: Date;
}

/**
 * 认证事件表
 *
 * @description 存储身份认证相关的事件溯源数据
 */
export interface AuthenticationEventTable {
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
 * 认证快照表
 *
 * @description 存储身份认证聚合根的快照数据
 */
export interface AuthenticationSnapshotTable {
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
