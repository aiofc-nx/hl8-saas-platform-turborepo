/**
 * 组织相关常量
 *
 * @description 定义组织管理相关的业务常量
 *
 * @since 1.0.0
 */

export const ORGANIZATION_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CODE_LENGTH: 20,
  MIN_CODE_LENGTH: 2,
  MAX_MEMBERS: 1000,
} as const;

export const ORGANIZATION_STATUS_TRANSITIONS = {
  PENDING: ["ACTIVE", "DISABLED"],
  ACTIVE: ["SUSPENDED", "DISABLED", "ARCHIVED"],
  SUSPENDED: ["ACTIVE", "DISABLED", "ARCHIVED"],
  DISABLED: ["ACTIVE"],
  ARCHIVED: ["ACTIVE"],
  DELETED: [],
  REJECTED: ["PENDING"],
} as const;

export const ORGANIZATION_TYPE_CONFIG = {
  PROFESSIONAL_COMMITTEE: {
    name: "专业委员会",
    description: "负责特定专业领域的技术决策和标准制定",
    icon: "committee",
    color: "#1890ff",
    permissions: ["read", "write", "approve"],
  },
  PROJECT_TEAM: {
    name: "项目管理团队",
    description: "负责项目全生命周期的管理和协调",
    icon: "team",
    color: "#52c41a",
    permissions: ["read", "write", "manage"],
  },
  QUALITY_CONTROL: {
    name: "质量控制小组",
    description: "负责产品质量控制和质量管理",
    icon: "quality",
    color: "#fa8c16",
    permissions: ["read", "inspect", "approve"],
  },
  PERFORMANCE_TEAM: {
    name: "绩效管理小组",
    description: "负责绩效评估和绩效管理",
    icon: "performance",
    color: "#722ed1",
    permissions: ["read", "evaluate", "report"],
  },
  CUSTOM: {
    name: "自定义类型",
    description: "用户自定义的组织类型",
    icon: "custom",
    color: "#666666",
    permissions: ["read"],
  },
} as const;

export const ORGANIZATION_ROLES = {
  OWNER: {
    name: "负责人",
    description: "组织的最高负责人，拥有所有权限",
    permissions: ["all"],
    level: 1,
  },
  ADMIN: {
    name: "管理员",
    description: "组织的管理员，拥有管理权限",
    permissions: ["read", "write", "manage"],
    level: 2,
  },
  MEMBER: {
    name: "成员",
    description: "组织的普通成员",
    permissions: ["read", "write"],
    level: 3,
  },
  OBSERVER: {
    name: "观察者",
    description: "只能查看组织信息的观察者",
    permissions: ["read"],
    level: 4,
  },
} as const;

export const ORGANIZATION_PERMISSIONS = {
  BASIC: ["organization:read", "organization:members:list"],
  ADMIN: [
    "organization:read",
    "organization:write",
    "organization:members:manage",
    "organization:settings:update",
  ],
  FULL: [
    "organization:read",
    "organization:write",
    "organization:delete",
    "organization:members:manage",
    "organization:settings:update",
    "organization:permissions:manage",
  ],
} as const;

export const ORGANIZATION_EVENTS = {
  CREATED: "organization.created",
  UPDATED: "organization.updated",
  DELETED: "organization.deleted",
  MEMBER_ADDED: "organization.member.added",
  MEMBER_REMOVED: "organization.member.removed",
  STATUS_CHANGED: "organization.status.changed",
  PERMISSIONS_CHANGED: "organization.permissions.changed",
} as const;