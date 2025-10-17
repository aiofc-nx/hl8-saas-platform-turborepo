/**
 * MongoDB索引定义
 *
 * @description 定义多租户MongoDB的索引策略
 * 优化查询性能和数据隔离
 *
 * ## 索引策略
 *
 * ### 多租户索引
 * - 所有集合必须包含隔离字段的复合索引
 * - 查询性能优化：platformId, tenantId, organizationId, departmentId
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
 * 平台集合索引
 */
export const PLATFORM_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 平台名称唯一索引 */
  UNIQUE_NAME: { name: 1 },

  /** 平台域名唯一索引 */
  UNIQUE_DOMAIN: { domain: 1 },

  /** 平台状态索引 */
  STATUS: { status: 1 },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;

/**
 * 租户集合索引
 */
export const TENANT_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 平台+租户名称唯一索引 */
  UNIQUE_PLATFORM_NAME: { platformId: 1, name: 1 },

  /** 平台+租户状态索引 */
  PLATFORM_STATUS: { platformId: 1, status: 1 },

  /** 租户类型索引 */
  TYPE: { type: 1 },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;

/**
 * 用户集合索引
 */
export const USER_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 平台+用户名唯一索引 */
  UNIQUE_PLATFORM_USERNAME: { platformId: 1, username: 1 },

  /** 平台+邮箱唯一索引 */
  UNIQUE_PLATFORM_EMAIL: { platformId: 1, email: 1 },

  /** 平台+用户状态索引 */
  PLATFORM_STATUS: { platformId: 1, status: 1 },

  /** 租户+用户状态索引 */
  TENANT_STATUS: { platformId: 1, tenantId: 1, status: 1 },

  /** 组织+用户状态索引 */
  ORGANIZATION_STATUS: {
    platformId: 1,
    tenantId: 1,
    organizationId: 1,
    status: 1,
  },

  /** 部门+用户状态索引 */
  DEPARTMENT_STATUS: {
    platformId: 1,
    tenantId: 1,
    organizationId: 1,
    departmentId: 1,
    status: 1,
  },

  /** 最后登录时间索引 */
  LAST_LOGIN: { lastLoginAt: 1 },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;

/**
 * 用户角色关联集合索引
 */
export const USER_ROLE_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 用户+角色唯一索引 */
  UNIQUE_USER_ROLE: { userId: 1, roleId: 1 },

  /** 用户+角色状态索引 */
  USER_STATUS: { userId: 1, status: 1 },

  /** 角色+用户状态索引 */
  ROLE_STATUS: { roleId: 1, status: 1 },

  /** 平台+用户角色索引 */
  PLATFORM_USER: { platformId: 1, userId: 1 },

  /** 租户+用户角色索引 */
  TENANT_USER: { platformId: 1, tenantId: 1, userId: 1 },

  /** 组织+用户角色索引 */
  ORGANIZATION_USER: {
    platformId: 1,
    tenantId: 1,
    organizationId: 1,
    userId: 1,
  },

  /** 部门+用户角色索引 */
  DEPARTMENT_USER: {
    platformId: 1,
    tenantId: 1,
    organizationId: 1,
    departmentId: 1,
    userId: 1,
  },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;

/**
 * 事件集合索引
 */
export const EVENT_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 聚合根+版本唯一索引 */
  UNIQUE_AGGREGATE_VERSION: { aggregateId: 1, eventVersion: 1 },

  /** 聚合根+事件类型索引 */
  AGGREGATE_TYPE: { aggregateId: 1, eventType: 1 },

  /** 事件时间戳索引 */
  OCCURRED_AT: { occurredAt: 1 },

  /** 事件类型索引 */
  EVENT_TYPE: { eventType: 1 },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;

/**
 * 快照集合索引
 */
export const SNAPSHOT_INDEXES = {
  /** 主键索引 */
  PRIMARY: { _id: 1 },

  /** 聚合根唯一索引 */
  UNIQUE_AGGREGATE: { aggregateId: 1 },

  /** 聚合根+版本索引 */
  AGGREGATE_VERSION: { aggregateId: 1, snapshotVersion: 1 },

  /** 创建时间索引 */
  CREATED_AT: { createdAt: 1 },
} as const;
