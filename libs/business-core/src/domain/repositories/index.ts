/**
 * 仓储模块导出
 *
 * @description 导出仓储相关的所有公共API
 * @since 1.0.0
 */

// 基础设施
export * from "./base/index.js";

// 业务仓储
export * from "./tenant.repository.js";
export * from "./organization.repository.js";
export * from "./department.repository.js";
export * from "./user.repository.js";
export * from "./role.repository.js";
export * from "./permission.repository.js";
export * from "./user-role.repository.js";
