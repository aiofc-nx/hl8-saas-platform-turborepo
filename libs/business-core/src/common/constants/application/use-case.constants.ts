/**
 * 用例相关常量定义
 *
 * @description 定义用例相关的常量
 * @since 1.0.0
 */

/**
 * 用例元数据键
 */
export const USE_CASE_METADATA_KEY = Symbol("useCase");

/**
 * 用例默认配置
 */
export const DEFAULT_USE_CASE_CONFIG = {
  /** 默认版本 */
  VERSION: "1.0.0",
  /** 默认超时时间（毫秒） */
  TIMEOUT: 30000,
  /** 默认缓存TTL（秒） */
  CACHE_TTL: 300,
  /** 默认重试次数 */
  MAX_RETRY_ATTEMPTS: 3,
  /** 默认重试延迟（毫秒） */
  RETRY_DELAY: 1000,
  /** 默认事务超时（毫秒） */
  TRANSACTION_TIMEOUT: 60000,
  /** 默认最大执行时间（毫秒） */
  MAX_EXECUTION_TIME: 30000,
  /** 默认内存限制（MB） */
  MEMORY_LIMIT: 512,
  /** 默认CPU限制（百分比） */
  CPU_LIMIT: 80,
} as const;

/**
 * 用例类型常量
 */
export const USE_CASE_TYPES = {
  /** 命令用例 */
  COMMAND: "command",
  /** 查询用例 */
  QUERY: "query",
} as const;

/**
 * 用例状态常量
 */
export const USE_CASE_STATUS = {
  /** 待执行 */
  PENDING: "pending",
  /** 执行中 */
  RUNNING: "running",
  /** 执行成功 */
  SUCCESS: "success",
  /** 执行失败 */
  FAILED: "failed",
  /** 已取消 */
  CANCELLED: "cancelled",
  /** 已超时 */
  TIMEOUT: "timeout",
} as const;

/**
 * 用例优先级常量
 */
export const USE_CASE_PRIORITY = {
  /** 低优先级 */
  LOW: 1,
  /** 普通优先级 */
  NORMAL: 5,
  /** 高优先级 */
  HIGH: 8,
  /** 紧急优先级 */
  URGENT: 10,
} as const;

/**
 * 用例分类常量
 */
export const USE_CASE_CATEGORIES = {
  /** 用户管理 */
  USER_MANAGEMENT: "user-management",
  /** 租户管理 */
  TENANT_MANAGEMENT: "tenant-management",
  /** 组织管理 */
  ORGANIZATION_MANAGEMENT: "organization-management",
  /** 部门管理 */
  DEPARTMENT_MANAGEMENT: "department-management",
  /** 角色管理 */
  ROLE_MANAGEMENT: "role-management",
  /** 权限管理 */
  PERMISSION_MANAGEMENT: "permission-management",
  /** 审计管理 */
  AUDIT_MANAGEMENT: "audit-management",
  /** 系统管理 */
  SYSTEM_MANAGEMENT: "system-management",
} as const;

/**
 * 用例标签常量
 */
export const USE_CASE_TAGS = {
  /** 关键用例 */
  CRITICAL: "critical",
  /** 高性能 */
  HIGH_PERFORMANCE: "high-performance",
  /** 需要审计 */
  AUDIT_REQUIRED: "audit-required",
  /** 可缓存 */
  CACHEABLE: "cacheable",
  /** 需要事务 */
  TRANSACTIONAL: "transactional",
  /** 异步处理 */
  ASYNC: "async",
  /** 批量操作 */
  BATCH: "batch",
  /** 实时处理 */
  REAL_TIME: "real-time",
} as const;

/**
 * 用例权限常量
 */
export const USE_CASE_PERMISSIONS = {
  /** 用户创建 */
  USER_CREATE: "user:create",
  /** 用户读取 */
  USER_READ: "user:read",
  /** 用户更新 */
  USER_UPDATE: "user:update",
  /** 用户删除 */
  USER_DELETE: "user:delete",
  /** 用户管理 */
  USER_MANAGE: "user:manage",
  /** 租户创建 */
  TENANT_CREATE: "tenant:create",
  /** 租户读取 */
  TENANT_READ: "tenant:read",
  /** 租户更新 */
  TENANT_UPDATE: "tenant:update",
  /** 租户删除 */
  TENANT_DELETE: "tenant:delete",
  /** 租户管理 */
  TENANT_MANAGE: "tenant:manage",
  /** 组织创建 */
  ORGANIZATION_CREATE: "organization:create",
  /** 组织读取 */
  ORGANIZATION_READ: "organization:read",
  /** 组织更新 */
  ORGANIZATION_UPDATE: "organization:update",
  /** 组织删除 */
  ORGANIZATION_DELETE: "organization:delete",
  /** 组织管理 */
  ORGANIZATION_MANAGE: "organization:manage",
  /** 部门创建 */
  DEPARTMENT_CREATE: "department:create",
  /** 部门读取 */
  DEPARTMENT_READ: "department:read",
  /** 部门更新 */
  DEPARTMENT_UPDATE: "department:update",
  /** 部门删除 */
  DEPARTMENT_DELETE: "department:delete",
  /** 部门管理 */
  DEPARTMENT_MANAGE: "department:manage",
  /** 角色创建 */
  ROLE_CREATE: "role:create",
  /** 角色读取 */
  ROLE_READ: "role:read",
  /** 角色更新 */
  ROLE_UPDATE: "role:update",
  /** 角色删除 */
  ROLE_DELETE: "role:delete",
  /** 角色管理 */
  ROLE_MANAGE: "role:manage",
  /** 权限创建 */
  PERMISSION_CREATE: "permission:create",
  /** 权限读取 */
  PERMISSION_READ: "permission:read",
  /** 权限更新 */
  PERMISSION_UPDATE: "permission:update",
  /** 权限删除 */
  PERMISSION_DELETE: "permission:delete",
  /** 权限管理 */
  PERMISSION_MANAGE: "permission:manage",
  /** 系统管理 */
  SYSTEM_MANAGE: "system:manage",
  /** 审计读取 */
  AUDIT_READ: "audit:read",
  /** 审计管理 */
  AUDIT_MANAGE: "audit:manage",
} as const;

/**
 * 用例错误代码常量
 */
export const USE_CASE_ERROR_CODES = {
  /** 请求验证失败 */
  VALIDATION_FAILED: "VALIDATION_FAILED",
  /** 权限不足 */
  PERMISSION_DENIED: "PERMISSION_DENIED",
  /** 资源不存在 */
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  /** 资源已存在 */
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  /** 业务规则违反 */
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  /** 并发冲突 */
  CONCURRENCY_CONFLICT: "CONCURRENCY_CONFLICT",
  /** 系统错误 */
  SYSTEM_ERROR: "SYSTEM_ERROR",
  /** 网络错误 */
  NETWORK_ERROR: "NETWORK_ERROR",
  /** 超时错误 */
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  /** 重试次数超限 */
  MAX_RETRY_EXCEEDED: "MAX_RETRY_EXCEEDED",
} as const;

/**
 * 用例事件类型常量
 */
export const USE_CASE_EVENT_TYPES = {
  /** 用例开始执行 */
  USE_CASE_STARTED: "use-case-started",
  /** 用例执行成功 */
  USE_CASE_COMPLETED: "use-case-completed",
  /** 用例执行失败 */
  USE_CASE_FAILED: "use-case-failed",
  /** 用例执行超时 */
  USE_CASE_TIMEOUT: "use-case-timeout",
  /** 用例执行取消 */
  USE_CASE_CANCELLED: "use-case-cancelled",
} as const;
