/**
 * 角色相关常量
 *
 * @description 定义角色管理相关的业务常量
 *
 * @since 1.0.0
 */

export const ROLE_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CODE_LENGTH: 50,
  MIN_CODE_LENGTH: 2,
} as const;

export const ROLE_STATUS_TRANSITIONS = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: ["ACTIVE"],
  DELETED: [],
} as const;

export const ROLE_LEVELS = {
  SYSTEM: 1,
  TENANT: 2,
  ORGANIZATION: 3,
  DEPARTMENT: 4,
  TEAM: 5,
} as const;

export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    code: "SUPER_ADMIN",
    name: "超级管理员",
    description: "系统最高权限管理员",
    level: ROLE_LEVELS.SYSTEM,
    permissions: ["*"],
  },
  TENANT_ADMIN: {
    code: "TENANT_ADMIN",
    name: "租户管理员",
    description: "租户管理员，拥有租户内所有权限",
    level: ROLE_LEVELS.TENANT,
    permissions: ["tenant:*"],
  },
  USER: {
    code: "USER",
    name: "普通用户",
    description: "普通用户，拥有基础权限",
    level: ROLE_LEVELS.TENANT,
    permissions: ["user:read", "user:update"],
  },
} as const;

export const ROLE_EVENTS = {
  CREATED: "role.created",
  UPDATED: "role.updated",
  DELETED: "role.deleted",
  PERMISSIONS_CHANGED: "role.permissions.changed",
  STATUS_CHANGED: "role.status.changed",
} as const;