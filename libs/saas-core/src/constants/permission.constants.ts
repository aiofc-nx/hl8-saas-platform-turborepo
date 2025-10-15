/**
 * 权限相关常量
 *
 * @description 定义权限管理相关的业务常量
 *
 * @since 1.0.0
 */

export const PERMISSION_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_CODE_LENGTH: 100,
  MIN_CODE_LENGTH: 3,
  MAX_RESOURCE_LENGTH: 50,
  MAX_ACTION_LENGTH: 20,
  MAX_CATEGORY_LENGTH: 30,
} as const;

export const PERMISSION_STATUS_TRANSITIONS = {
  ACTIVE: ["INACTIVE", "DEPRECATED"],
  INACTIVE: ["ACTIVE", "DEPRECATED"],
  DEPRECATED: ["ACTIVE"],
  DELETED: [],
} as const;

export const PERMISSION_CATEGORIES = {
  USER: "用户管理",
  ORGANIZATION: "组织管理",
  DEPARTMENT: "部门管理",
  ROLE: "角色管理",
  PERMISSION: "权限管理",
  TENANT: "租户管理",
  SYSTEM: "系统管理",
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  APPROVE: "approve",
  EXPORT: "export",
  IMPORT: "import",
} as const;

export const PERMISSION_RESOURCES = {
  USER: "user",
  ORGANIZATION: "organization",
  DEPARTMENT: "department",
  ROLE: "role",
  PERMISSION: "permission",
  TENANT: "tenant",
  SYSTEM: "system",
} as const;

export const PERMISSION_EVENTS = {
  CREATED: "permission.created",
  UPDATED: "permission.updated",
  DELETED: "permission.deleted",
  STATUS_CHANGED: "permission.status.changed",
} as const;