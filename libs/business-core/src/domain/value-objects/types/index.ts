/**
 * 类型值对象导出
 *
 * @description 导出所有类型相关的值对象和工具类
 * 业务特定类型已移除，迁移到 @hl8/saas-core
 * @since 1.0.0
 */

// 业务特定类型归口管理：
// - TenantType：SAAS平台租户类型
// - UserRole → 已迁移到 @hl8/saas-core
// - PermissionDefinitions → 已迁移到 @hl8/saas-core

// 通用与业务类型值对象导出
export * from "./tenant-type.vo.js";
export * from "./user-role.vo.js";
export * from "./user-status.vo.js";
export * from "./organization-type.vo.js";
export * from "./department-level.vo.js";
export * from "./role-type.vo.js";
export * from "./permission-type.vo.js";
export * from "./permission-action.vo.js";
