/**
 * MongoDB文档导出
 *
 * @description 导出所有MongoDB文档结构定义
 * 支持多租户数据隔离和事件溯源
 *
 * @since 1.0.0
 */

// 平台相关文档
export * from "./platform.document.js";

// 租户相关文档
export * from "./tenant.document.js";

// 用户相关文档
export * from "./user.document.js";
