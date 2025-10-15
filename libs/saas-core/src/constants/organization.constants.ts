/**
 * 组织相关常量
 *
 * @description 定义组织领域相关的常量和配置
 *
 * @since 1.0.0
 */

import { OrganizationStatus } from "../domain/organization/value-objects/organization-status.vo.js";

/**
 * 组织状态转换规则
 *
 * @description 定义允许的状态转换规则
 */
export const ORGANIZATION_STATUS_TRANSITIONS: Record<
  OrganizationStatus,
  OrganizationStatus[]
> = {
  [OrganizationStatus.PENDING]: [
    OrganizationStatus.ACTIVE, // 激活
    OrganizationStatus.DISABLED, // 禁用
  ],
  [OrganizationStatus.ACTIVE]: [
    OrganizationStatus.SUSPENDED, // 暂停
    OrganizationStatus.DISABLED, // 禁用
    OrganizationStatus.ARCHIVED, // 归档
  ],
  [OrganizationStatus.SUSPENDED]: [
    OrganizationStatus.ACTIVE, // 恢复
    OrganizationStatus.DISABLED, // 禁用
    OrganizationStatus.ARCHIVED, // 归档
  ],
  [OrganizationStatus.DISABLED]: [
    OrganizationStatus.ACTIVE, // 启用
  ],
  [OrganizationStatus.ARCHIVED]: [
    OrganizationStatus.ACTIVE, // 恢复
  ],
  [OrganizationStatus.DELETED]: [
    // 已删除状态不能转换到其他状态
  ],
  [OrganizationStatus.REJECTED]: [
    OrganizationStatus.PENDING, // 重新申请
  ],
};

/**
 * 组织类型配置
 */
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

/**
 * 组织成员角色配置
 */
export const ORGANIZATION_MEMBER_ROLES = {
  /** 组织负责人 */
  OWNER: {
    name: "负责人",
    description: "组织的最高负责人，拥有所有权限",
    permissions: ["all"],
    level: 1,
  },
  /** 管理员 */
  ADMIN: {
    name: "管理员",
    description: "组织的管理员，拥有管理权限",
    permissions: ["read", "write", "manage"],
    level: 2,
  },
  /** 成员 */
  MEMBER: {
    name: "成员",
    description: "组织的普通成员",
    permissions: ["read", "write"],
    level: 3,
  },
  /** 观察者 */
  OBSERVER: {
    name: "观察者",
    description: "只能查看组织信息的观察者",
    permissions: ["read"],
    level: 4,
  },
} as const;

/**
 * 组织配置限制
 */
export const ORGANIZATION_LIMITS = {
  /** 最大成员数量 */
  MAX_MEMBERS: 1000,
  /** 最大子组织数量 */
  MAX_CHILD_ORGANIZATIONS: 50,
  /** 最大嵌套层级 */
  MAX_NESTING_LEVEL: 5,
  /** 组织名称最大长度 */
  MAX_NAME_LENGTH: 100,
  /** 组织代码最大长度 */
  MAX_CODE_LENGTH: 50,
  /** 组织描述最大长度 */
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

/**
 * 组织权限配置
 */
export const ORGANIZATION_PERMISSIONS = {
  /** 基础权限 */
  BASIC: ["organization:read", "organization:members:list"],
  /** 管理权限 */
  ADMIN: [
    "organization:read",
    "organization:write",
    "organization:members:manage",
    "organization:settings:update",
  ],
  /** 完整权限 */
  FULL: [
    "organization:read",
    "organization:write",
    "organization:delete",
    "organization:members:manage",
    "organization:settings:update",
    "organization:permissions:manage",
  ],
} as const;

/**
 * 组织通知配置
 */
export const ORGANIZATION_NOTIFICATIONS = {
  /** 成员加入通知 */
  MEMBER_JOINED: true,
  /** 成员离开通知 */
  MEMBER_LEFT: true,
  /** 角色变更通知 */
  ROLE_CHANGED: true,
  /** 组织状态变更通知 */
  STATUS_CHANGED: true,
  /** 权限变更通知 */
  PERMISSIONS_CHANGED: true,
} as const;
