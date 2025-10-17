/**
 * 数据库索引定义
 *
 * @description 定义多租户数据库的索引策略
 * 优化查询性能和数据隔离
 *
 * ## 索引策略
 *
 * ### 多租户索引
 * - 所有表必须包含隔离字段的复合索引
 * - 查询性能优化：platform_id, tenant_id, organization_id, department_id
 * - 数据隔离保证：通过索引确保数据访问的隔离性
 *
 * ### 业务索引
 * - 唯一性约束：确保业务数据的唯一性
 * - 外键索引：优化关联查询性能
 * - 状态索引：优化状态查询性能
 *
 * @since 1.0.0
 */

/**
 * 平台表索引
 */
export const PLATFORM_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_platform_id',
  
  /** 平台名称唯一索引 */
  UNIQUE_NAME: 'uk_platform_name',
  
  /** 平台域名唯一索引 */
  UNIQUE_DOMAIN: 'uk_platform_domain',
  
  /** 平台状态索引 */
  STATUS: 'idx_platform_status',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_platform_created_at',
} as const;

/**
 * 租户表索引
 */
export const TENANT_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_tenant_id',
  
  /** 平台+租户名称唯一索引 */
  UNIQUE_PLATFORM_NAME: 'uk_tenant_platform_name',
  
  /** 平台+租户状态索引 */
  PLATFORM_STATUS: 'idx_tenant_platform_status',
  
  /** 租户类型索引 */
  TYPE: 'idx_tenant_type',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_tenant_created_at',
} as const;

/**
 * 组织表索引
 */
export const ORGANIZATION_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_organization_id',
  
  /** 租户+组织名称唯一索引 */
  UNIQUE_TENANT_NAME: 'uk_organization_tenant_name',
  
  /** 租户+组织状态索引 */
  TENANT_STATUS: 'idx_organization_tenant_status',
  
  /** 组织类型索引 */
  TYPE: 'idx_organization_type',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_organization_created_at',
} as const;

/**
 * 部门表索引
 */
export const DEPARTMENT_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_department_id',
  
  /** 组织+部门名称唯一索引 */
  UNIQUE_ORGANIZATION_NAME: 'uk_department_organization_name',
  
  /** 组织+部门状态索引 */
  ORGANIZATION_STATUS: 'idx_department_organization_status',
  
  /** 部门层级索引 */
  LEVEL: 'idx_department_level',
  
  /** 上级部门索引 */
  PARENT: 'idx_department_parent',
  
  /** 部门路径索引 */
  PATH: 'idx_department_path',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_department_created_at',
} as const;

/**
 * 用户表索引
 */
export const USER_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_user_id',
  
  /** 平台+用户名唯一索引 */
  UNIQUE_PLATFORM_USERNAME: 'uk_user_platform_username',
  
  /** 平台+邮箱唯一索引 */
  UNIQUE_PLATFORM_EMAIL: 'uk_user_platform_email',
  
  /** 平台+用户状态索引 */
  PLATFORM_STATUS: 'idx_user_platform_status',
  
  /** 租户+用户状态索引 */
  TENANT_STATUS: 'idx_user_tenant_status',
  
  /** 组织+用户状态索引 */
  ORGANIZATION_STATUS: 'idx_user_organization_status',
  
  /** 部门+用户状态索引 */
  DEPARTMENT_STATUS: 'idx_user_department_status',
  
  /** 最后登录时间索引 */
  LAST_LOGIN: 'idx_user_last_login',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_user_created_at',
} as const;

/**
 * 身份认证表索引
 */
export const AUTHENTICATION_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_authentication_id',
  
  /** 用户+认证类型唯一索引 */
  UNIQUE_USER_TYPE: 'uk_authentication_user_type',
  
  /** 平台+认证状态索引 */
  PLATFORM_STATUS: 'idx_authentication_platform_status',
  
  /** 租户+认证状态索引 */
  TENANT_STATUS: 'idx_authentication_tenant_status',
  
  /** 认证类型索引 */
  TYPE: 'idx_authentication_type',
  
  /** 最后登录时间索引 */
  LAST_LOGIN: 'idx_authentication_last_login',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_authentication_created_at',
} as const;

/**
 * 认证会话表索引
 */
export const AUTH_SESSION_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_auth_session_id',
  
  /** 会话令牌唯一索引 */
  UNIQUE_SESSION_TOKEN: 'uk_auth_session_token',
  
  /** 用户+会话状态索引 */
  USER_STATUS: 'idx_auth_session_user_status',
  
  /** 会话过期时间索引 */
  EXPIRES_AT: 'idx_auth_session_expires_at',
  
  /** 最后活动时间索引 */
  LAST_ACTIVITY: 'idx_auth_session_last_activity',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_auth_session_created_at',
} as const;

/**
 * 权限表索引
 */
export const PERMISSION_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_permission_id',
  
  /** 平台+权限代码唯一索引 */
  UNIQUE_PLATFORM_CODE: 'uk_permission_platform_code',
  
  /** 平台+权限状态索引 */
  PLATFORM_STATUS: 'idx_permission_platform_status',
  
  /** 权限范围索引 */
  SCOPE: 'idx_permission_scope',
  
  /** 权限主题索引 */
  SUBJECT: 'idx_permission_subject',
  
  /** 权限操作索引 */
  ACTION: 'idx_permission_action',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_permission_created_at',
} as const;

/**
 * 角色表索引
 */
export const ROLE_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_role_id',
  
  /** 平台+角色代码唯一索引 */
  UNIQUE_PLATFORM_CODE: 'uk_role_platform_code',
  
  /** 租户+角色代码唯一索引 */
  UNIQUE_TENANT_CODE: 'uk_role_tenant_code',
  
  /** 平台+角色状态索引 */
  PLATFORM_STATUS: 'idx_role_platform_status',
  
  /** 租户+角色状态索引 */
  TENANT_STATUS: 'idx_role_tenant_status',
  
  /** 角色类型索引 */
  TYPE: 'idx_role_type',
  
  /** 角色级别索引 */
  LEVEL: 'idx_role_level',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_role_created_at',
} as const;

/**
 * 用户角色关联表索引
 */
export const USER_ROLE_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_user_role_id',
  
  /** 用户+角色唯一索引 */
  UNIQUE_USER_ROLE: 'uk_user_role_user_role',
  
  /** 用户+角色状态索引 */
  USER_STATUS: 'idx_user_role_user_status',
  
  /** 角色+用户状态索引 */
  ROLE_STATUS: 'idx_user_role_role_status',
  
  /** 平台+用户角色索引 */
  PLATFORM_USER: 'idx_user_role_platform_user',
  
  /** 租户+用户角色索引 */
  TENANT_USER: 'idx_user_role_tenant_user',
  
  /** 组织+用户角色索引 */
  ORGANIZATION_USER: 'idx_user_role_organization_user',
  
  /** 部门+用户角色索引 */
  DEPARTMENT_USER: 'idx_user_role_department_user',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_user_role_created_at',
} as const;

/**
 * 角色权限关联表索引
 */
export const ROLE_PERMISSION_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_role_permission_id',
  
  /** 角色+权限唯一索引 */
  UNIQUE_ROLE_PERMISSION: 'uk_role_permission_role_permission',
  
  /** 角色+权限状态索引 */
  ROLE_STATUS: 'idx_role_permission_role_status',
  
  /** 权限+角色状态索引 */
  PERMISSION_STATUS: 'idx_role_permission_permission_status',
  
  /** 平台+角色权限索引 */
  PLATFORM_ROLE: 'idx_role_permission_platform_role',
  
  /** 租户+角色权限索引 */
  TENANT_ROLE: 'idx_role_permission_tenant_role',
  
  /** 组织+角色权限索引 */
  ORGANIZATION_ROLE: 'idx_role_permission_organization_role',
  
  /** 部门+角色权限索引 */
  DEPARTMENT_ROLE: 'idx_role_permission_department_role',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_role_permission_created_at',
} as const;

/**
 * 事件表索引
 */
export const EVENT_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_event_id',
  
  /** 聚合根+版本唯一索引 */
  UNIQUE_AGGREGATE_VERSION: 'uk_event_aggregate_version',
  
  /** 聚合根+事件类型索引 */
  AGGREGATE_TYPE: 'idx_event_aggregate_type',
  
  /** 事件时间戳索引 */
  OCCURRED_AT: 'idx_event_occurred_at',
  
  /** 事件类型索引 */
  EVENT_TYPE: 'idx_event_event_type',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_event_created_at',
} as const;

/**
 * 快照表索引
 */
export const SNAPSHOT_INDEXES = {
  /** 主键索引 */
  PRIMARY: 'pk_snapshot_id',
  
  /** 聚合根唯一索引 */
  UNIQUE_AGGREGATE: 'uk_snapshot_aggregate',
  
  /** 聚合根+版本索引 */
  AGGREGATE_VERSION: 'idx_snapshot_aggregate_version',
  
  /** 创建时间索引 */
  CREATED_AT: 'idx_snapshot_created_at',
} as const;
