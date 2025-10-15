/**
 * 通用常量
 *
 * @description 定义系统通用的业务常量
 *
 * @since 1.0.0
 */

export const COMMON_LIMITS = {
  MAX_PAGE_SIZE: 1000,
  DEFAULT_PAGE_SIZE: 10,
  MIN_PAGE_SIZE: 1,
  MAX_SEARCH_LENGTH: 100,
  MAX_SORT_FIELDS: 5,
} as const;

export const COMMON_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  DISABLED: "DISABLED",
  DELETED: "DELETED",
  ARCHIVED: "ARCHIVED",
} as const;

export const COMMON_SORT_ORDERS = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export const COMMON_EVENTS = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  STATUS_CHANGED: "status_changed",
} as const;

export const COMMON_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export const COMMON_MESSAGES = {
  SUCCESS: "操作成功",
  FAILED: "操作失败",
  NOT_FOUND: "资源不存在",
  UNAUTHORIZED: "未授权访问",
  FORBIDDEN: "禁止访问",
  VALIDATION_FAILED: "数据验证失败",
} as const;
