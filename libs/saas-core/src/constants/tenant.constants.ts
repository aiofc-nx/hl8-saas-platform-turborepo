/**
 * 租户相关常量
 *
 * @description 定义租户管理相关的业务常量
 *
 * @since 1.0.0
 */

export const TENANT_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_DOMAIN_LENGTH: 253,
  MAX_CODE_LENGTH: 20,
  MIN_CODE_LENGTH: 3,
} as const;

export const TENANT_QUOTAS = {
  BASIC: {
    users: 10,
    storage: 100, // MB
    apiCalls: 1000,
  },
  PROFESSIONAL: {
    users: 100,
    storage: 1000, // MB
    apiCalls: 10000,
  },
  ENTERPRISE: {
    users: 1000,
    storage: 10000, // MB
    apiCalls: 100000,
  },
} as const;

export const TENANT_TRIAL_CONFIG = {
  TRIAL_DAYS: 30,
  TRIAL_TYPE: "PROFESSIONAL",
  TRIAL_FEATURES: [
    "user_management",
    "organization_management",
    "basic_analytics",
  ],
} as const;

export const TENANT_STATUS_TRANSITIONS = {
  PENDING: ["ACTIVE", "DISABLED", "DELETED"],
  ACTIVE: ["SUSPENDED", "DISABLED", "DELETED"],
  SUSPENDED: ["ACTIVE", "DISABLED", "DELETED"],
  DISABLED: ["ACTIVE"],
  DELETED: [],
} as const;