/**
 * 部门相关常量
 *
 * @description 定义部门管理相关的业务常量
 *
 * @since 1.0.0
 */

export const DEPARTMENT_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_CODE_LENGTH: 20,
  MIN_CODE_LENGTH: 2,
  MAX_DEPTH: 10,
  MAX_CHILDREN: 100,
} as const;

export const DEPARTMENT_STATUS_TRANSITIONS = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: ["ACTIVE"],
  DELETED: [],
} as const;

export const DEPARTMENT_LEVELS = {
  ROOT: 0,
  DIVISION: 1,
  DEPARTMENT: 2,
  SECTION: 3,
  TEAM: 4,
} as const;

export const DEPARTMENT_EVENTS = {
  CREATED: "department.created",
  UPDATED: "department.updated",
  DELETED: "department.deleted",
  MOVED: "department.moved",
  STATUS_CHANGED: "department.status.changed",
} as const;