/**
 * 数据库模式导出
 *
 * @description 导出所有数据库表结构定义
 * 支持多租户数据隔离和事件溯源
 *
 * @since 1.0.0
 */

// 平台相关表结构
export * from './platform.schema.js';

// 租户相关表结构
export * from './tenant.schema.js';

// 组织相关表结构
export * from './organization.schema.js';

// 部门相关表结构
export * from './department.schema.js';

// 用户相关表结构
export * from './user.schema.js';

// 身份认证相关表结构
export * from './authentication.schema.js';

// 权限相关表结构
export * from './permission.schema.js';
